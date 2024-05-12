export const refreshSecret:string = process.env.REFRESH_TOKEN_SECRET as string;
export const accessSecret:string = process.env.ACCESS_TOKEN_SECRET as string;
export const keySecret:string = process.env.JWE_KEY_SECRET as string;
export const jweKey :string= process.env.JWE_KEY as string;
export const saltsRounds: string = process.env.SALTS_ROUNDS as string;
export const mongodbURI :string = process.env.MONGODB_URI as string;
export const senderEmail :string = process.env.SENDER_EMAIL_ADDRESS as string;
export const senderPassword :string= process.env.SENDER_PASSWORD as string;