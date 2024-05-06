import express, { Application,Request,Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv"

dotenv.config();
const port: number = (process.env.PORT as unknown) as number;
const app: Application = express();

app.use(cors({ origin: "*" }))
app.use(express.json());

mongoose.set("strictQuery", false);
app.get("/",(req:Request,res:Response)=>{
    res.send("<h1>Hello, World!</h1>")
})

app.listen(port, () => {
    console.log("Listening: http://localhost:3000")
});