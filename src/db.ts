import mongoose from "mongoose";
import { mongodbURI } from "./utils/env";


export async function dbconnect(){
    mongoose.set("strictQuery", true);
return mongoose
    .connect(
        `${mongodbURI}`
    )
    .then(() => {
        console.log("Connected!");
    })
    .catch(() => {
        console.log("Couldn't Connect!");
        process.exit(1);
    });

}