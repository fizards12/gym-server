import User from "../model/users";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { generateRefreshToken, generateAccessToken } from "../utils/generateToken";
import { Result, checkSchema, validationResult } from "express-validator";
import { userValidatorSchema } from "../utils/validatorSchemas";
import { ResultWithContext } from "express-validator/src/chain";
import { uniquenessValidator } from "../utils/utils";
const saltRounds: number = process.env.ROUND_OF_SALTS as unknown as number;

const registerHandler = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    const result: Result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.formatWith(err => err.msg).array() });
    }
    const { name, username, email, password, role } = req.body;
    try {
        const errors: string[] = [];
        const isEmailUnique = uniquenessValidator(email, "email");
        const isUsernameUnique = uniquenessValidator(username, "username");
        if (!isEmailUnique) {
            errors.push("Email is already exists.")
        }
        if (!isUsernameUnique) {
            errors.push("Username is already exists.")
        }
        if(errors){
            res.status(400).json({errors})
        }
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        const user = new User({
            name,
            username,
            email,
            password: encryptedPassword,
            role
        });

        const result = await user.save();
        res.status(201).send({ newUser: result });
    } catch (error) {
        next(error);
    }
};

// const loginHandler = async(req,res,next)=>{
//     try {
//         const {email,password} = req.body;
//         const isExist =  await User.findOne({email});
//         if(!isExist){
//             return res.status(400).send({type: "Email is incorrect"});
//         }

//         const isPasswordCorrect = await bcrypt.compare(password,isExist.password);
//         if(!isPasswordCorrect){
//             return res.status(400).send({type: "Password Incorrect"});
//         }
//         const refreshToken = generateRefreshToken({id:isExist.id,name: isExist.name,passowrd: password});
//         const accessToken  = generateAccessToken(isExist.id,refreshToken);
//         isExist.refreshToken = refreshToken;

//         await isExist.save();
//         return res.status(200).send({token:accessToken, userId:isExist.id});
//     } catch (error) {
//         next(error);
//     }
// }


// const accessTokenGeneratorHandler= async(req,res,next)=>{
//     try {

//         const userId = req.body.id;
//         const id = new Types.ObjectId(userId);
//         const user = await User.findById(id);
//         if(!user.refreshToken){
//             return res.status(403).send({type: "User Not authenticated yet."});
//         }
//         const token = generateAccessToken(userId,user.refreshToken);
//         if(!token){
//             user.refreshToken = "";
//             await user.save();
//             return res.sendStatus(401);
//         }
//         return res.status(201).send({userId,token})
//     } catch (error) {
//         if (error.name === "TokenExpiredError"){
//             return res.status(401);
//         }else{
//             next(error);
//         }
//     }
// }

export {
    registerHandler,
    // loginHandler,
    // accessTokenGeneratorHandler
}