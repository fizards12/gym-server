import { NextFunction, Request, Response } from "express";
import { jweKey } from "../utils/env";
import { TokenPayload, decryptJWE, generateJWE, isTokenExpired, verifyToken } from "../utils/auth";
import User, { UserDocument } from "../model/users";
import { ADMIN_ROLES, TOKEN_TYPES } from "../utils/constants";
import { Errors } from "../utils/errorTypes";

export interface CustomRequest extends Request {
    accJWE?: string,
    user?: UserDocument

}

type AuthMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => Promise<Response | undefined>

export const authMiddleware = (roles: string[]): AuthMiddleware => async function (req: CustomRequest, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
        //Check if token was sent with Request, and verify and decode it.
        let encryptedAccesstoken: string = req.headers.authorization?.split(" ")[1] as string;
        if (!encryptedAccesstoken) {
            throw { name: Errors.INVALID_AUTH_HEADER };
        }

        //Check refresh token and verify it's not expired
        const encryptedRefreshToken: string = req.cookies["en-rt"];
        if (!encryptedAccesstoken) {
            throw {
                name: Errors.TOKEN_NOT_FOUND_ERROR,
                type: TOKEN_TYPES.REFRESH
            }
        }
        const refreshToken: string = await decryptJWE(encryptedRefreshToken, jweKey)
        const refreshPayload: TokenPayload = await verifyToken(refreshToken, "refresh")
        const { email, id, role } = refreshPayload;
        if (isTokenExpired(refreshPayload)) {
            throw {
                name: Errors.TOKEN_EXPIRATION_ERROR,
                type: TOKEN_TYPES.REFRESH
            }
        }

        const accessToken: string = await decryptJWE(encryptedAccesstoken, jweKey);
        let payload: TokenPayload = await verifyToken(accessToken, TOKEN_TYPES.ACCESS);

        // If access token expired, regenerate new access token.
        const isAccessExpired = isTokenExpired(payload);
        if (isAccessExpired) {
            if(!(payload.id === id && payload.email === email && payload.role === role)){
                throw {
                    name: Errors.INVALID_TOKEN_CREDENTIALS_ERROR,
                    type: TOKEN_TYPES.ACCESS
                }
            }
            // re-assign accessToken payload for next verifications.
            const newAccesspayload = { email, id, role };
            //re-assign encryptedAccessToken with the new JWE Token.
            const newAccessJWE = await generateJWE(newAccesspayload, TOKEN_TYPES.ACCESS, { expiresIn: "30m" });

            // Pass the new JWE access token to the request handler throw request body.
            req.headers.authorization = "Bearer " + newAccessJWE;
            req.accJWE = newAccessJWE;
        }

        //Next lines verify the client's credentials, and if it is authorized or not.
        const user = await User.findOne({ member_id: payload.id, email: payload.email }) as UserDocument;
        if (!user) {
            throw {
                name: Errors.INVALID_TOKEN_CREDENTIALS_ERROR,
                type: TOKEN_TYPES.REFRESH 
            };
        }

        //Validate that the user is authorized to ask for resources.
        if (roles.includes(user.role as string)) {
            //Validate that all roles except admin are authorized only for their resources.
            if (!(user.role === ADMIN_ROLES.ADMIN || user.role === ADMIN_ROLES.CO_ADMIN)
                && req.params.id
                && user.id !== req.params.id) {
                throw {
                    name: Errors.SCOPE_ERROR
                }
            }
        } else {
            throw {
                name: Errors.SCOPE_ERROR
            }
        }
        if (!user.activated) {
            throw {
                name: Errors.ACC_ACTIVATION_ERROR
            }
        }
        req.user = user;
        next();
        return;

    } catch (err: any) {
        next(err)
    }
} 
