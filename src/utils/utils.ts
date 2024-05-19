import User, { UserDocument, UserInterface } from "../model/users";
import transporter from "./emailTransport";
import { Errors } from "./errorTypes";
import { backendURL } from "./env";


function generateRandomNumber(): number {
    return Math.floor(100000 + Math.random() * 900000); // Generates a random number between 100000 and 999999
}

export async function generateUniqueUserId(): Promise<number> {
    let uniqueId = generateRandomNumber();
    let user = await User.findOne({ member_id: uniqueId })
    while (user) {
        uniqueId = generateRandomNumber();
        user = await User.findOne({ member_id: uniqueId })
    }
    return uniqueId;
}

export async function uniquenessValidator<T>(properties: UserInterface): Promise<boolean> {
    const user: UserDocument = await User.findOne<UserDocument>(properties) as UserDocument;
    return !user;
}



export const sendMail = async (reciever: UserInterface, id: string) => {
    try {

        const { email, name } = reciever;
        const url = `${backendURL}/api/auth/activate/${id}`;

        const { messageId } = await transporter.sendMail({
            from: "mahmoudsameh734@outlook.com",
            to: email,
            subject: "Activation mail",
            html: `
            <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Document</title>
                        <style>
                            body{
                                background-color: #14151a;
                            }
                            main {
                                background-color: #14151a;
                                color: white;
                                height: 100vh;
                            }
                        
                            .header {
                                background-color: #191b2a;
                                padding: 10px 0px;
                            }
                        
                            .header h1 {
                                text-align: center;
                                text-transform: uppercase;
                                font-family: Arial, sans-serif;
                                color: orange;
                            }
                        
                            .content {
                                gap: 10px;
                                padding: 10px;
                                margin-top: 50px;
                            }
                        </style>
                </head>
    
                <body style="margin:0;">
                    <main>
                        <div class="header">
                            <h1>Welcome to Gem-Gym</h1>
                        </div>
                        <div class="content">
                            <h2>Hello, ${name}</h2>
                            <p>Your account has been registered successfully.</p>
                            <div>To activate your account please click here:
                                <a style="color:rgb(122, 160, 207);text-decoration:none;" href="${url}">Activate me</a>.
                            </div>
                        </div>
                    </main>
                </body>`
        })
        return messageId;
    } catch (error: any) {
        if (error.code === "EENVELOPE") {
            throw {
                name: Errors.MAIL_FAILURE_ERROR,
                type: "invalid-recipient"
            }
        }
        return {
            name : Errors.MAIL_FAILURE_ERROR,
            type: error.code
        }
    }
}

//split array to number of batches
export const chunkArray = (array: UserDocument[], size: number): UserDocument[][] => {
    const result: UserDocument[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};