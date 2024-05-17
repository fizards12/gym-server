import { NextFunction } from "express";
import { Socket } from "socket.io";
import { Errors } from "../utils/errorTypes";
import { decryptJWE, isTokenExpired, verifyToken } from "../utils/auth";
import { jweKey } from "../utils/env";

export interface NotificationSocket extends Socket {
    message?:string,
    userId?: number
 }

const socketMiddleware = async(socket:NotificationSocket,next:NextFunction)=>{
    const tokenJWE = socket.handshake.auth.token;
    if(!tokenJWE){
        next(Errors.INVALID_AUTH_HEADER)
    }
    const accessToken = await decryptJWE(tokenJWE,jweKey);
    const payload = await verifyToken(accessToken,"access");
    if(isTokenExpired(payload)){
        next(new Error(Errors.TOKEN_EXPIRATION_ERROR));
    }
    next();
    socket.userId = payload.id as number;
}