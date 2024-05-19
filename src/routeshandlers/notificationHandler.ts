import { NotificationSocket } from "../middleware/authSocket";
import User, { UserDocument } from "../model/users";
import Notification from "../model/notifications";
import { chunkArray } from "../utils/utils";
import { Server, Socket } from "socket.io";
import { Errors } from "../utils/errorTypes";
import { Types, isObjectIdOrHexString } from "mongoose";



type EventListener = (socket: NotificationSocket, io: Server) => (...args: any[]) => Promise<void>;

export const socketHandlers = (socket: NotificationSocket, io: Server): void => {
    socket.on("send-notification", sendNotification(socket, io));
    socket.on("read-notification", readListener(socket, io));
}
const sendNotification: EventListener = (socket, io) => async (message: string, role: string) => {
    try {
        const userId = socket.userId;
        const sender = await User.findOne({ member_id: userId });
        if (!sender) {
            socket.emit("error", Errors.CREDENTIALS_ERROR);
            return;
        }
        const newNotification = new Notification({
            message,
            sender: sender._id
        })
        if (!role) {
            console.error("Role not provided");
            throw Errors.SCOPE_ERROR
        }
        const recipients = await User.find({ role });
        if (!recipients.length) {
            console.error("Role not valid");
            throw Errors.SCOPE_ERROR;
        }
        const recipientsBatches = chunkArray(recipients, 100);
        await Promise.all(recipientsBatches.map(async (btch) => {
            try {
                const usersIds = btch.map(user => user._id);
                const updateResult = await User.updateMany({ _id: { $in: usersIds } },
                    { $push: { notifications: { _id: newNotification._id, read: false } } });
                console.log(`Batch updated: ${updateResult.modifiedCount} users`);

            } catch (err) {
                throw err;
            }
        }))

        await newNotification.save();
        const notifyObject = newNotification.toObject();
        io.emit("receive-notification", message, notifyObject.id);
    } catch (error) {
        socket.emit("error", { type: error, action: "SEND_ACTION" });
    }
}


const readListener: EventListener = (socket) => async (id) => {
    try {
        if (!isObjectIdOrHexString(id)) throw Errors.CREDENTIALS_ERROR
        const idObj = new Types.ObjectId(id);
        const updated = await User
            .findOneAndUpdate({ member_id: socket.userId, "notifications._id": idObj },
                { $set: { "notifications.$.read": true } }, { new: true });
        if (!updated) {
            throw Errors.CREDENTIALS_ERROR;
        }
        socket.emit("read-reaction", true)
        return;
    } catch (error) {
        socket.emit("error", { type: error, action: "READ_ACTION" });
    }
}


