import nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"

const email = {
    address: process.env.SENDER_EMAIL_ADDRESS as unknown as string,
    password: process.env.SENDER_PASSWORD as unknown as string
}

const transportOptions : SMTPTransport.Options = {
    host: "smtp-mail.outlook.com",
    port: 587,
    secure:false,
    auth:{
        user: email.address,
        pass: email.password
    }
}

const transporter = nodemailer.createTransport(transportOptions)

export default transporter;