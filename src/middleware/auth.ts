import { NextFunction, Request, Response } from "express";
import { accessSecret, jweKey } from "../utils/env";
import { TokenPayload, verifyToken } from "../utils/generateToken";
import User, { UserDocument } from "../model/users";
import { Errors } from "../utils/constants";
import { decryptJWT } from "../utils/utils";

export const authMiddleware = (roles:string[]): Function => async function (req: Request, res: Response, next: NextFunction): Promise<Response | never | undefined> {
    try {
        const encryptedAccesstoken: string = req.headers.authorization?.split(" ")[1] as string;
        if (!encryptedAccesstoken) {
            throw Errors.TOKEN_ERROR;
        }
        const accesstoken : string = await decryptJWT(encryptedAccesstoken,jweKey); 
        const { id, email }: TokenPayload = await verifyToken(accesstoken, accessSecret,undefined,(error)=>{
            if(error.name === Errors.TOKEN_EXPIRATION_ERROR){
                const encryptedRefreshToken = req.cookies['httpOnlyCookie']
                const refreshToken = decryptJWT(encryptedRefreshToken,jweKey);
            }
        });
        const user: UserDocument = await User.findOne({ member_id: id, email }) as UserDocument;
        if (!user) {
            return res.sendStatus(403);
        }
        if(!roles.includes(user.role as string) || !user.activated){
            return res.sendStatus(403);
        }
        next();
    } catch (error: any) {
        if(error.name === Errors.TOKEN_EXPIRATION_ERROR){

        }
        res.sendStatus(401);
    }
}