import { JWE, JWK } from "node-jose";
import User, { UserDocument, UserInterface } from "../model/users";
import { format } from "path";
function generateRandomNumber(): number {
    return Math.floor(100000 + Math.random() * 900000); // Generates a random number between 100000 and 999999
}

export async function generateUniqueUserId(): Promise<number> {
    try {
        let uniqueId = generateRandomNumber();
        const user = await User.findOne({ member_id: uniqueId })
        while (user) {
            uniqueId = generateRandomNumber();
            const user = await User.findOne({ member_id: uniqueId })
        }
        return uniqueId;
    } catch (error: unknown) {
        throw error;
    }
}

export async function uniquenessValidator<T>(properties: UserInterface): Promise<boolean> {
    const user: UserDocument = await User.findOne<UserDocument>(properties) as UserDocument;

    return !user;
}

export async function encryptJWT(token: string, key: string): Promise<string| never> {
    try {

        const encryptedKey = await JWK.asKey(key);
        const jwe : string = await JWE.createEncrypt({ format: "compact" }, encryptedKey)
            .update(token)
            .final();
        return jwe;
    } catch (error) {
        console.log(error);
        throw error;
    }

}

export async function decryptJWT(encryptedToken: string, key: string): Promise<string| never> {
    try {

        const decryptedKey = await JWK.asKey(key);
        const jwt : string = await JWE.createDecrypt(decryptedKey,{format: "compact"})
            .decrypt(encryptedToken) as unknown as string;
        return jwt;
    } catch (error) {
        console.log(error);
        throw error;
    }

}
