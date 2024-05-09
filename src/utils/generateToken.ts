import jwt, { Jwt, JwtPayload, Secret } from "jsonwebtoken";
import { Types } from "mongoose";

const secret: Secret = process.env.TOKEN_SECRET as string;

type Token = string
interface TokenPayload extends JwtPayload {
    id?: string,
    member_id?: string,
    email?: string,
    decodedPassword?: string,
    role?: string,
}

export const verifyAccessTokenByRefreshToken = (accessToken: Token, refreshToken: Token) => {
    const refreshPayload: TokenPayload = jwt.verify(refreshToken, secret) as TokenPayload;
    const accessPayload: TokenPayload = jwt.verify(accessToken, secret,
        {
            issuer: refreshPayload.iss
            , audience: refreshPayload.aud
        }) as TokenPayload;
}

export const generateAccessToken = (userId: string, refreshToken: Token): Token | never => {
    const payload: TokenPayload = jwt.verify(refreshToken, secret) as TokenPayload;
    if ((payload.member_id) === userId) {
        const accessPayload: TokenPayload = {
            member_id: payload.member_id,
            role: payload.role
        }
        const token: Token = jwt.sign(accessPayload, secret, {
            expiresIn: "24h",
        });
        return token;
    } else {
        throw new Error("Wrong Credentials")
    }
};

export const generateRefreshToken = (payload: TokenPayload): Token => {
    const token: string = jwt.sign(payload, secret);
    return token;
};

