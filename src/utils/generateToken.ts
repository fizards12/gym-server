import jwt, {
    JsonWebTokenError,
    Jwt,
    JwtPayload,
    Secret,
    SignOptions,
    TokenExpiredError,
    VerifyOptions,
} from "jsonwebtoken";
import { Types } from "mongoose";
import { TokenError } from "./errorTypes";

const refreshSecret: Secret = process.env.TOKEN_SECRET as string;
const accessSecret: Secret = process.env.TOKEN_SECRET as string;

type Token = string;

interface TokenPayload extends JwtPayload {
    id?: string;
    member_id?: string;
    email?: string;
    decodedPassword?: string;
    role?: string;
}

export const verifyToken = async (token: Token, tokenType: string, options?: VerifyOptions): Promise<TokenPayload | never> => {
    const secret: Secret = tokenType === "refresh" ? refreshSecret :
        tokenType === "access" ? accessSecret : "";
    try {
        if (!secret) {
            const error: TokenError = {
                name: "TokenTypeError",
                "token-type": tokenType,
                message: "Token Type not selected."
            };
            throw error
        }
        const payload: TokenPayload = jwt.verify(token, secret, options) as TokenPayload;
        return payload;
    } catch (error: any) {
        const err : TokenError = {
            name: error.name,
            "token-type": tokenType,
            message: error.message
        };
        throw err
    }
};

export const verifyAccessTokenByRefreshToken = (
    accessToken: Token,
    refreshToken: Token
) => {
    const refreshPayload: TokenPayload = verifyToken(
        refreshToken,
        "refresh"
    ) as TokenPayload;
    const accessPayload: TokenPayload = verifyToken(accessToken, "access", {
        issuer: refreshPayload.iss,
        audience: refreshPayload.aud,
    }) as TokenPayload;
};

export const generateAccessToken = (
    userId: string,
    refreshToken: Token
): Token | never => {
    const payload: TokenPayload = jwt.verify(
        refreshToken,
        refreshSecret
    ) as TokenPayload;
    if (payload.member_id === userId) {
        const accessPayload: TokenPayload = {
            member_id: payload.member_id,
            role: payload.role,
        };
        const token: Token = jwt.sign(accessPayload, accessSecret, {
            expiresIn: "24h",
        });
        return token;
    } else {
        throw new Error("Wrong Credentials");
    }
};

export const generateRefreshToken = (payload: TokenPayload): Token => {
    const token: string = jwt.sign(payload, refreshSecret);
    return token;
};
