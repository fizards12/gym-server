import { TokenExpiredError } from "jsonwebtoken";

export interface Err {
    name: string,
    message?: (string | string[])
}


export interface TokenError extends Err {
    "token-type": string
}

export interface ValidationError extends Err {
}