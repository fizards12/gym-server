import dotenv from "dotenv"
dotenv.config();
import express, { Application } from "express";
import mongoose from "mongoose";
import http, { Server } from "http"
import cors from "cors";
import usersRouter from "./routes/usersRouter"
const port: number = (process.env.PORT as unknown) as number;
const app: Application = express();
const server: Server = http.createServer(app)
const databaseURI: string = process.env.MONGODB_URI as unknown as string;

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

app.use("/users", usersRouter);

server.listen(port, () => {
    console.log("Listening: http://localhost:" + port)
});