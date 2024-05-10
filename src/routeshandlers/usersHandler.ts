import User, { UserDocument } from "../model/users";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { generateRefreshToken, generateAccessToken } from "../utils/generateToken";
import { Result, validationResult } from "express-validator";
import { generateUniqueUserId, uniquenessValidator } from "../utils/utils";
import transporter from "../utils/emailTransport";
import { Types } from "mongoose";
import { ValidationError } from "../utils/errorTypes";
const saltRounds: number = +(process.env.SALTS_ROUNDS as unknown as number);
export const registerHandler = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    // Validate request data formats.
    const result: Result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            errors: result.formatWith(err => {
                const error : ValidationError = {
                    name: err.type,
                    message: err.msg,
                } 
                return error
            })
                .mapped()
        });
    }
    const { name, username, email, password, role } = req.body;
    try {
        // Check if the user already registered before
        const errors: string[] = [];
        const isUserUnique = await uniquenessValidator({ email, username });
        if (!isUserUnique) {
            errors.push("User already exists,please sign in.")
        }
        if (errors.length > 0) {
            res.status(400).json({ errors })
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
        const result = await user.save();
        res.status(201).send({ newUser: result });
    } catch (error: any) {
        console.log(error.message)
        next(error);
    }
};

export const sendMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { messageId } = await transporter.sendMail({
            from: "mahmoudsameh734@outlook.com",
            to: "mahmoudsameh734@gmail.com",
            subject: "First Time!",
            html: `<h1 style="text-align:center">Hello, Mahmoud</h1>
            <h4>Welcome To Nodemailer</h4>`
        })
        res.send(messageId);
    } catch (err) {
        console.log(err)
        res.send(err);
    }
}

export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate Request Data format.
        const result: Result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.formatWith(err => {
                const error : ValidationError = {
                    name: err.type,
                    message: err.msg,
                } 
            }).mapped() });
        }

        // Validate Login Credentials
        const { email, password } = req.body;
        const isUserExist: UserDocument = await (User.findOne<UserDocument>({ email })) as UserDocument;
        if (!isUserExist) {
            return res.status(400).send({ errors: ["Email is incorrect"] });
        }
        const isPasswordCorrect = await bcrypt.compare(password, isUserExist.password as string);
        if (!isPasswordCorrect) {
            return res.status(400).send({ errors: ["Password Incorrect"] });
        }

        // Generate Refresh and Access Tokens
        const refreshToken = generateRefreshToken({
            id:isUserExist.id,
            member_id: isUserExist.member_id as string,
            email:isUserExist.email,
            decodedPassword: password,
            role:isUserExist.role
        });
        const accessToken : string = generateAccessToken(isUserExist.member_id as string, refreshToken);
        isUserExist.refreshToken = refreshToken;

        // Save Refresh Token on the user's document on database
        await isUserExist.save();
        return res.status(200).send({ token: accessToken, userId: isUserExist.member_id });
    } catch (error) {
        next(error);
    }
}

export const deleteUserHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result: Result = validationResult(req);
        if (!result.isEmpty()) {
            const formatedResult = result.formatWith((error) => error.msg).mapped();
            if (formatedResult["authorization"]) {
                return res.sendStatus(403);
            }
            return res.status(400).send({ errors: formatedResult })
        }
        const token: string = req.headers.authorization?.split(" ")[1] as string;
        const memberId: string = req.params.id;
        const user = await User.findOne({member_id: memberId});
        


    } catch (error) {

    }
}


export const accessTokenGeneratorHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const member_id = req.body.id;
        const user: UserDocument = await User.findOne<UserDocument>({member_id}) as UserDocument;
        if (!user.refreshToken) {
            return res.sendStatus(403);
        }
        const token = generateAccessToken(member_id, user.refreshToken);
        if (!token) {
            user.refreshToken = "";
            await user.save();
            return res.sendStatus(401);
        }
        return res.status(201).send({ member_id, token })
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return res.status(401);
        } else {
            next(error);
        }
    }
}