import express, { Application,Request,Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv"
import { Result, Schema, checkSchema, query, validationResult } from "express-validator";
import { ResultWithContext } from "express-validator/src/chain";

dotenv.config();
const port: number = (process.env.PORT as unknown) as number;
const app: Application = express();
const schema : Schema = {
    name: {
        trim: true,
        notEmpty: {
            errorMessage: "Enter valid name"
        },
    }
}
app.use(cors({ origin: "*" }))
app.use(express.json());

mongoose.set("strictQuery", false);
app.get("/:name",async(req:Request,res:Response)=>{

    const result : ResultWithContext[] = await checkSchema(schema).run(req);

    res.send(result)
})

app.listen(port, () => {
    console.log("Listening: http://localhost:3000")
});