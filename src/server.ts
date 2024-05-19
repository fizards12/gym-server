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
import socketIo from "socket.io"
import { NotificationSocket, socketMiddleware } from "./middleware/authSocket";
import { socketHandlers } from "./routeshandlers/notificationHandler";
import { client, connectRedis } from "./utils/cache";
const port: number = (process.env.PORT as unknown) as number;
const app: Application = express();
const server: Server = http.createServer(app)
const io = new socketIo.Server(server);
app.use(cors({ origin: frontendURI || "*" }))
app.use(express.json());
app.use(cookieParser());

dbconnect();
connectRedis();
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

io.use(socketMiddleware);
io.on("connection",(socket: NotificationSocket)=>{
    console.log(socket.userId);
    socketHandlers(socket,io);
})
app.use(errorHandler);

server.listen(port, () => {
    console.log("Listening: http://localhost:" + port)
});


