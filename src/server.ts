import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import http, { Server } from "http";
import cors from "cors";
import usersRouter from "./routes/usersRouter";
import authRouter from "./routes/authRouter";
import cookieParser from "cookie-parser";
import { dbconnect } from "./db";
import { frontendURI } from "./utils/env";
import errorHandler from "./routeshandlers/errorHandler";

const port: number = (process.env.PORT as unknown) as number;
const app: Application = express();
const server: Server = http.createServer(app)

app.use(cors({ origin: frontendURI || "*" }))
app.use(express.json());
app.use(cookieParser());

dbconnect();

app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);

server.listen(port, () => {
    console.log("Listening: http://localhost:" + port)
});


