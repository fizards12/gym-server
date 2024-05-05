import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
const app : Application = express();

app.use(cors({origin:"*"}))
app.use(express.json());

mongoose.set("strictQuery",false);
