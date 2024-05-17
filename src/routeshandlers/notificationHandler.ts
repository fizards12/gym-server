import { Socket } from "socket.io";
import { NotificationSocket } from "../middleware/authSocket";
import User from "../model/users";



const sendNotification = async(socket:NotificationSocket)=>{
    const message = socket.message;
    const userId = socket.userId;
    const sender = (await User.findOne({member_id:userId}))?.toObject();
}