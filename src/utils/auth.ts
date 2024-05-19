import jwt, { JwtPayload, Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { Errors } from "./errorTypes";
import { accessSecret, activateJweKey, activationSecret, jweKey, refreshSecret } from "./env";
import { JWE, JWK } from "node-jose";
import { TOKEN_TYPES } from "./constants";
import { getRefreshToken } from "./cache";
type Token = string;

export interface TokenPayload extends JwtPayload {
    id?: string | number;
    email?: string;
    decodedPassword?: string;
    role?: string;
}

type TokenType = TOKEN_TYPES.REFRESH | TOKEN_TYPES.ACCESS | TOKEN_TYPES.ACTIVATION;

function tokenSecret(type: TokenType): Secret {
    let secret: Secret = "";
    if (type === TOKEN_TYPES.REFRESH) secret = refreshSecret;
    if (type === TOKEN_TYPES.ACCESS) secret = accessSecret;
    if (type === TOKEN_TYPES.ACTIVATION) secret = activationSecret;
    return secret;
}

function JWEKey(type: TokenType): string {
    let key: string = "";
    if (type === TOKEN_TYPES.REFRESH) key = jweKey;
    if (type === TOKEN_TYPES.ACCESS) key = jweKey;
    if (type === TOKEN_TYPES.ACTIVATION) key = activateJweKey;
    return key;
}

export const verifyToken = async (token: Token, type: TokenType, options?: VerifyOptions): Promise<TokenPayload> => {
    try {
        const secret = tokenSecret(type);
        //Throw error if secret is empty
        if (!secret) {
            throw {
                name: Errors.TOKEN_TYPE_ERROR,
                type
            };
        }

        //Check token validation
        const payload: TokenPayload = jwt.verify(token, secret, options) as TokenPayload;
        return payload;
    } catch (error: any) {
        throw {
            name: Errors.TOKEN_ERROR,
            type,
        };
    }
};

export const isTokenExpired = function (decoded: TokenPayload): boolean {
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    if (expirationTime && expirationTime < now) {
        return true;
    }
    return false;
}

async function encryptJWT(token: string, key: string): Promise<string> {
    try {
        const base64Key = Buffer.from(key, "utf8").toString("base64")
        const encryptedKey = await JWK.asKey({ kty: 'oct', k: base64Key });
        const jwe: string = await JWE.createEncrypt({ format: "compact" }, encryptedKey)
            .update(token)
            .final();
        return jwe;
    } catch (error) {
        throw error;
    }

}

export async function decryptJWE(encryptedToken: string, key: string): Promise<string | never> {
    try {
        const base64Key = Buffer.from(key, "utf8").toString("base64")
        const decryptedKey = await JWK.asKey({ kty: 'oct', k: base64Key });
        const decryptedResult: JWE.DecryptResult = await JWE.createDecrypt(decryptedKey)
            .decrypt(encryptedToken)
        const jwt: string = decryptedResult.payload.toString("utf8");
        return jwt;
    } catch (error) {
        throw error;
    }

}


//Function to generate JWE (Json Web Encryption) Token
export const generateJWE = async (payload: TokenPayload, type: TokenType, options?: SignOptions): Promise<Token> => {
    const secret = tokenSecret(type);
    //Throw error if secret is empty
    if (!secret) {
        throw {
            name: Errors.TOKEN_TYPE_ERROR,
            type
        };
    }
    const token: string = jwt.sign(payload, secret, options);
    const key = JWEKey(type);
    const jweToken = await encryptJWT(token, key);
    return jweToken;
};

export const decryptToken = (tokenJWE: string)=>new Promise<{payload:TokenPayload,token?:string}>(async(resolve,reject)=>{
    const accessToken = await decryptJWE(tokenJWE,jweKey);
        const payload = await verifyToken(accessToken,TOKEN_TYPES.ACCESS);
        const refreshJWE = await getRefreshToken(+(payload.id as number));
        if(!refreshJWE){
            
        }
        if(isTokenExpired(payload)){
            const refreshToken = await decryptJWE(refreshJWE as string,jweKey);
            const refreshPayload = await verifyToken(refreshToken,TOKEN_TYPES.ACCESS);
            if(isTokenExpired(refreshPayload)){
                reject({name:Errors.TOKEN_EXPIRATION_ERROR,type:TOKEN_TYPES.REFRESH});
            }
            if(payload.id !== refreshPayload.id){
                reject({name:Errors.INVALID_TOKEN_CREDENTIALS_ERROR,type:TOKEN_TYPES.ACCESS});
            }
            const newAccessJWE = await generateJWE({id:refreshPayload.id,email:refreshPayload.email,role:refreshPayload.role},TOKEN_TYPES.ACCESS);
            return resolve({payload,token:newAccessJWE});
        }
        return resolve({payload});
})