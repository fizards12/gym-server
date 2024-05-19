import User from "../model/users";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { Result, validationResult } from "express-validator";
import { generateUniqueUserId, sendMail, uniquenessValidator } from "../utils/utils";
import { CustomRequest } from "../middleware/auth";
import { generateJWE } from "../utils/auth";
import Token from "../model/tokens";
import { Errors } from "../utils/errorTypes";
import { TOKEN_TYPES } from "../utils/constants";

const saltRounds: number = +(process.env.SALTS_ROUNDS as unknown as number);


export const getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
        const users = await User.find({}).populate("notifications");
        if (req.accJWE) {
            return res.status(200).json({ users, token: req.accJWE });
        }
        const usersAsObjects = users.map((user) => user.toObject());
        return res.json({ users: usersAsObjects });
    } catch (error) {
        next(error);
    }
}

export const getUser = async (req: CustomRequest, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
        const result: Result = validationResult(req);
        if (!result.isEmpty()) {
            const formatedResult = result.formatWith((error) => error.msg).mapped();
            throw {
                name: Errors.VALIDATION_ERROR,
                errors: formatedResult
            }
        }
        const id = req.params.id
        const user = await User.findOne({ member_id: id }).populate("notifications");
        if (!user) {
            throw {
                name: Errors.CREDENTIALS_ERROR,
                errors: ["Invalid User"]
            }
        }
        // Send the new encrypted access token if the current one expired.
        if (req.accJWE) {
            return res.json({ user, token: req.accJWE });
        }
        return res.json({ user: user?.toObject() });
    } catch (error) {
        next(error);
    }
}


export const registerHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    // Validate request data formats.
    try{
    const result: Result = validationResult(req);
    if (!result.isEmpty()) {
        const errors = result.formatWith(err => {
            const error = {
                name: err.type,
                message: err.msg,
            }
            return error
        }).mapped()

        throw{
            name: Errors.VALIDATION_ERROR,
            errors
        }
    }
    const { name, username, email, password, role } = req.body;
        // Check if the user already registered before
        const isUserUnique = await uniquenessValidator({ email, username });
        if (!isUserUnique) {
            throw {
                name: Errors.CREDENTIALS_ERROR,
                errors: ["User already exists."]
            }
        }

        // Generate unique 6-digits id for each user.
        const member_id: number = await generateUniqueUserId();

        const encryptedPassword: string = await bcrypt.hash(password as string, saltRounds as number);
        const user = new User({
            name,
            username,
            email,
            password: encryptedPassword,
            role,
            member_id
        });

        // Store new user's data on the database.
        const activateJWE = await generateJWE({ id: member_id }, TOKEN_TYPES.ACTIVATION, { expiresIn: "10d" });
        const tokenInDB = new Token({ token: activateJWE,state:"activate" });
        const response = await sendMail(user.toObject(), tokenInDB._id.toHexString());
        await tokenInDB.save();
        await user.save();
        if(typeof(response) === "object"){   
            return res.status(201).json({ type: "Registered-SendingMailFailure" });
        }
        return res.status(201).json({ type: "Registerd-SendingMailSuccess" });
    } catch (error: any) {
        next(error);
    }
};

export const deleteHandler = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const result: Result = validationResult(req);
        if (!result.isEmpty()) {
            const formatedResult = result.formatWith((error) => error.msg).mapped();
            throw {
                name: Errors.VALIDATION_ERROR,
                errors: formatedResult
            }
        }
        const memberId: string = req.params.id;
        await User.findOneAndDelete({ member_id: memberId });
        
        if (req.accJWE) {
            return res.status(204).json({ token: req.accJWE });
        }
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}
