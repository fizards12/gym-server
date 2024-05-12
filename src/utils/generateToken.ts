import jwt, {
    JwtPayload,
    Secret,
    VerifyCallback,
    VerifyErrors,
    VerifyOptions,
} from "jsonwebtoken";
import { Err } from "./errorTypes";
import { Errors } from "./constants";
import { accessSecret, jweKey, refreshSecret } from "./env";
import { encryptJWT } from "./utils";
type Token = string;
export interface TokenPayload extends JwtPayload {
    id?: string;
    email?: string;
    decodedPassword?: string;
    role?: string;
}


//Tracking any errors while JWT Token verification.
export const verifyJWT = (token: string, secret: Secret, options?: VerifyOptions): Promise<TokenPayload> => {
    return new Promise<JwtPayload>((resolve, reject) => {
        jwt.verify(token, secret, options, (error, decoded) => {
            if (error) {
                reject(error);
            } else {
                resolve(decoded as TokenPayload);
            }
        })
    })
}

export const verifyToken = async (token: Token, secret: Secret, options?: VerifyOptions,callback?:(error: VerifyErrors)=>void): Promise<TokenPayload> => {
    try {
        //Throw error if secret is empty
        if (!secret) {
            throw {
                name: Errors.TOKEN_TYPE_ERROR,
                message: "Token Type not selected."
            };
        }

        //Check token validation
        const payload = await verifyJWT(token, secret, options);
        return payload;
    } catch (error: any) {
        callback && callback(error);
        throw {
            name: error.name,
            message: error.message
        };
    }
};

export const generateAccessToken = async (id: string, refreshToken: Token): Promise<Token | never> => {
    try {
        //verify Refresh Token
        const payload = await verifyJWT(refreshToken, refreshSecret);

        //Check the 6-digits user id with the encoded in the refresh token 
        if (payload.id === id) {
            const accessPayload: TokenPayload = {
                id: payload.member_id,
                role: payload.role,
            };
            //Generate new access token
            const token: Token = jwt.sign(accessPayload, accessSecret, { expiresIn: "30m" });

            //Encrypt the access token
            const jweToken = await encryptJWT(token, jweKey);
            return jweToken;
        } else {
            //throw wrong credentials error
            const error: Err = {
                name: Errors.CREDENTIALS_ERROR,
                message: "Wrong Credentials"
            }
            throw error;
        }
    } catch (error: any) {
        throw error;
    }
};


//Function to generate new refresh token
export const generateRefreshToken = async (payload: TokenPayload): Promise<Token> => {
    const token: string = jwt.sign(payload, refreshSecret, { expiresIn: "24h" });
    const jweToken = await encryptJWT(token, jweKey);
    return jweToken;
};
