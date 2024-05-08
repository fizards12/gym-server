import express, { Application,Request,Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv"
import { Result, Schema, checkSchema, query, validationResult } from "express-validator";
import { ResultWithContext } from "express-validator/src/chain";
import usersRouter from "./routes/usersRouter"
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
const databaseUsername : string = process.env.DATABASE_USERNAME as unknown as string;
const databasePassword : string = process.env.DATABASE_PASSWORD as unknown as string; 
const databaseURI : string = process.env.MONGODB_URI as unknown as string; 

app.use(cors({ origin: "*" }))
app.use(express.json());

mongoose.set("strictQuery", true);
mongoose
  .connect(
    `${databaseURI}`
  )
  .then(() => {
    console.log("Connected!");
  })
  .catch(() => {
    console.log("Couldn't Connect!");
    process.exit(1);
  });

app.get("/:name",async(req:Request,res:Response)=>{
    
    const result : ResultWithContext[] = await checkSchema(schema).run(req);
    
    res.send(result)
})
app.use("/users",usersRouter);

app.listen(port, () => {
    console.log("Listening: http://localhost:3000")
});