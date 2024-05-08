import jwt, { Jwt, JwtPayload, Secret } from "jsonwebtoken";
import { Types } from "mongoose";

const secret: Secret = process.env.TOKEN_SECRET as string;
const generateAccessToken = (userId: string | Types.ObjectId, refreshToken: string): string | boolean => {
    const payload: JwtPayload = jwt.verify(refreshToken, secret) as JwtPayload;
    if ((payload.id) === userId) {
        const token = jwt.sign({ name: payload.name }, secret, {
            expiresIn: "10s",
        });
        return token;
    } else {
        return false;
    }
};

const generateRefreshToken = (payload: JwtPayload): string => {
    const token: string = jwt.sign(payload, secret);
    return token;
};

export {
    generateAccessToken, generateRefreshToken
}