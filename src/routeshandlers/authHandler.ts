import { NextFunction, Request, RequestHandler, Response } from "express";
import { Result, validationResult } from "express-validator";
import User, { UserDocument } from "../model/users";
import bcrypt from "bcrypt";
import { TokenPayload, decryptJWE, generateJWE, isTokenExpired, verifyToken } from "../utils/auth";
import { activateJweKey, environment, frontendURI, jweKey } from "../utils/env";
import { EXPIRES_TIME, TOKEN_TYPES } from "../utils/constants";
import Token from "../model/tokens";
import { Types, isObjectIdOrHexString } from "mongoose";
import { Errors } from "../utils/errorTypes";
import { CustomRequest } from "../middleware/auth";
import { cacheRefreshToken, deleteRefreshToken } from "../utils/cache";


export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate Request Data format.
        const result: Result = validationResult(req);
        if (!result.isEmpty()) {
            const errors = result.formatWith(err => {
                const error = {
                    name: err.type,
                    message: err.msg,
                }
                return error
            }).mapped();
            throw {
                name: Errors.VALIDATION_ERROR,
                errors
            }
        }

        // Validate Login Credentials
        const { email, password } = req.body;
        const isUserExist = await (User.findOne<UserDocument>({ email })) as UserDocument;
        if (!isUserExist) {
            throw {
                name: Errors.CREDENTIALS_ERROR,
                errors: ["Email is incorrect"]
            }
        }
        const isPasswordCorrect = await bcrypt.compare(password, isUserExist.password as string);
        if (!isPasswordCorrect) {
            throw {
                name: Errors.CREDENTIALS_ERROR,
                errors: ["Password is incorrect"]
            }
        }

        // Generate Refresh and Access Tokens
        const refreshJWE: string = await generateJWE({
            id: isUserExist.member_id,
            email: isUserExist.email,
            password: isUserExist.password,
            role: isUserExist.role
        }, TOKEN_TYPES.REFRESH, { expiresIn: EXPIRES_TIME.ONE_DAY });

        const accessJWE: string = await generateJWE(
            { id: isUserExist.member_id, email: isUserExist.email, role: isUserExist.role },
            TOKEN_TYPES.ACCESS,
            { expiresIn: EXPIRES_TIME.HALF_HOUR }
        );

        // Save Refresh Token on a cookie-httpOnly attribute
        const expires = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
        res.cookie("en-rt", refreshJWE, { httpOnly: true, expires, secure: (environment === "PROD") || false });
        await cacheRefreshToken(isUserExist.member_id as number, refreshJWE);
        return res.status(200).send({ token: accessJWE });
    } catch (error) {
        next(error);
    }
}


export const reAuthenticateHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshJWE = req.cookies["en-rt"];
        if (!refreshJWE) {
            throw {
                name: Errors.TOKEN_NOT_FOUND_ERROR,
                type: TOKEN_TYPES.REFRESH
            }
        }
        const refreshToken: string = await decryptJWE(refreshJWE, jweKey);
        const refreshPayload: TokenPayload = await verifyToken(refreshToken, TOKEN_TYPES.REFRESH);
        const { email, id, role } = refreshPayload;
        if (isTokenExpired(refreshPayload)) {
            throw {
                name: Errors.TOKEN_EXPIRATION_ERROR,
                type: TOKEN_TYPES.REFRESH
            }
        }

        // Validate the user's credentials on the refresh token payload.. 
        const user: UserDocument = await User.findOne({ member_id: id, email }) as UserDocument;
        if (!user) {
            throw {
                name: Errors.INVALID_TOKEN_CREDENTIALS_ERROR,
                type: TOKEN_TYPES.REFRESH
            }
        }

        const newAccessJWE = await generateJWE({ id, email, role }, TOKEN_TYPES.ACCESS, { expiresIn: EXPIRES_TIME.HALF_HOUR });
        res.status(201).json({ token: newAccessJWE });
    } catch (error) {
        next(error)
    }
}



export const activateHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result: Result = validationResult(req)
        if (!result.isEmpty()) {
            const errors = result.formatWith(err => {
                const error = {
                    name: err.type,
                    message: err.msg,
                }
                return error
            }).mapped();
            throw {
                name: Errors.VALIDATION_ERROR,
                errors
            }
        }
        const jweId = req.params.id;
        if (!isObjectIdOrHexString(jweId)) {
            throw {
                name: Errors.INVALID_AUTH_HEADER,
                type: TOKEN_TYPES.ACTIVATION
            };
        }
        const id = new Types.ObjectId(jweId)
        const tokenInDB = await Token.findById(id);
        if (!tokenInDB) {
            throw {
                name: Errors.TOKEN_NOT_FOUND_ERROR,
                type: TOKEN_TYPES.ACTIVATION
            }
        }
        const activationJWE = tokenInDB?.toObject().token;
        const activationToken = await decryptJWE(activationJWE, activateJweKey);
        const payload = await verifyToken(activationToken, TOKEN_TYPES.ACTIVATION);
        if (isTokenExpired(payload)) {
            throw {
                name: Errors.TOKEN_EXPIRATION_ERROR,
                type: TOKEN_TYPES.ACTIVATION
            }
        }
        const user = await User.findOneAndUpdate({ member_id: payload.id }, { activated: true }, { new: true });
        await tokenInDB.deleteOne();
        if (!user) {
            throw {
                name: Errors.INVALID_TOKEN_CREDENTIALS_ERROR,
                type: TOKEN_TYPES.ACTIVATION
            }
        }
        return res.status(200).send("<h1>Accrount has been activated successfully</h1>");
    } catch (err: any) {
        next(err);
    }
}

export const logoutHandler: RequestHandler = async (req: CustomRequest, res, next) => {
    try {
        const result: Result = validationResult(req);
        if (!result.isEmpty()) {
            const errors = result.formatWith(err => {
                const error = {
                    name: err.type,
                    message: err.msg,
                }
                return error
            }).mapped();
            if (errors["authorization"]?.message) {
                throw {
                    name: Errors.INVALID_AUTH_HEADER,
                    type: TOKEN_TYPES.ACCESS
                }
            }
            throw {
                name: Errors.VALIDATION_ERROR,
                errors
            }
        }
        const tokenJWE = req.headers.authorization?.split(" ")[1];
        if (!tokenJWE) {
            throw {
                name: Errors.INVALID_AUTH_HEADER,
                type: TOKEN_TYPES.ACCESS
            }
        }
        const accToken = new Token({ token: tokenJWE, state: "blocked" });
        const refToken = new Token({ token: req.cookies["en-rt"], state: "blocked" });
        await Token.insertMany([accToken, refToken]);
        const userId = parseInt(req.params.id);
        await deleteRefreshToken(userId);
        return res.clearCookie("en-rt").sendStatus(204);

    } catch (error) {
        next(error);
    }
}