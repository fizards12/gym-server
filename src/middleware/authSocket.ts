import { NextFunction } from "express";
import { Socket } from "socket.io";
import { Errors } from "../utils/errorTypes";
import { decryptJWE, decryptToken, isTokenExpired, verifyToken } from "../utils/auth";
import { jweKey } from "../utils/env";
import { TOKEN_TYPES } from "../utils/constants";
import { ExtendedError } from "socket.io/dist/namespace";
import { getRefreshToken } from "../utils/cache";

export interface NotificationSocket extends Socket {
    message?:string,
    userId?: number,
    role?: string,
    token?:string
 }

export const socketMiddleware = async(socket:NotificationSocket,next:(err?: ExtendedError | undefined) => void)=>{
    try{
        const tokenJWE = socket.handshake.auth.token || socket.handshake.headers.token;
        if(!tokenJWE){
            throw new Error(Errors.INVALID_AUTH_HEADER)
        }
        const result = await decryptToken(tokenJWE);
        if (result.token){
            socket.token = result.token;
        }
        socket.userId = result.payload.id as number;
        next();
    }catch(error: any){
        next(error);
    }
}
