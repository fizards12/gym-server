import { Secret } from "jsonwebtoken";

export const refreshSecret: Secret = process.env.REFRESH_TOKEN_SECRET as string;
export const accessSecret: Secret = process.env.ACCESS_TOKEN_SECRET as string;
export const jweKey: string = process.env.JWE_KEY as string;
export const activateJweKey: string = process.env.JWE_KEY_ACTIVATION as string;
export const activationSecret: Secret = process.env.ACTIVATION_TOKEN_SECRET as string;
export const saltsRounds: string = process.env.SALTS_ROUNDS as string;
export const mongodbURI: string = process.env.MONGODB_URI as string;
export const frontendURI: string = process.env.FRONTEND_URI as string;
export const redisUser: string = process.env.REDIS_USER as string;
export const redisPassword: string = process.env.REDIS_PASSWORD as string;
export const redisURI: string = process.env.REDIS_URI as string;
export const senderEmail: string = process.env.SENDER_EMAIL_ADDRESS as string;
export const senderPassword: string = process.env.SENDER_PASSWORD as string;
export const environment: string = process.env.ENV as string;
export const backendURL: string = (environment === "PROD" ? process.env.BACKEND_URL : "http://localhost:3000") as string;
