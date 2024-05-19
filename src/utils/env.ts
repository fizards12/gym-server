import { Secret } from "jsonwebtoken";

export const port = +(process.env.port as string) as number || 10000;
export const refreshSecret = process.env.REFRESH_TOKEN_SECRET as Secret;
export const accessSecret = process.env.ACCESS_TOKEN_SECRET as Secret;
export const jweKey = process.env.JWE_KEY as string;
export const activateJweKey = process.env.JWE_KEY_ACTIVATION as string;
export const activationSecret: Secret = process.env.ACTIVATION_TOKEN_SECRET as Secret;
export const saltsRounds = process.env.SALTS_ROUNDS as string;
export const mongodbURI = process.env.MONGODB_URI as string;
export const frontendURI = process.env.FRONTEND_URI as string;
export const redisUser = process.env.REDIS_USER as string;
export const redisPassword = process.env.REDIS_PASSWORD as string;
export const redisURI = process.env.REDIS_URI as string;
export const senderEmail = process.env.SENDER_EMAIL_ADDRESS as string;
export const senderPassword = process.env.SENDER_PASSWORD as string;
export const environment = process.env.ENV as string;
export const backendURL = (environment === "PROD" ? process.env.BACKEND_URL : "http://localhost:3000") as string;
