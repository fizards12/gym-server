import { Model, Schema, Types, model } from "mongoose";


export interface NotificationInterface {
    id?:string,
    message: string,
    sender: Types.ObjectId
}

export type NotificationKeys = keyof NotificationInterface;

export interface NotifyDocument extends Document, NotificationInterface { }

const notifySchema = new Schema<NotifyDocument>({
    message: {
        type: String,
        required: [true, "Notification Message value is required"],
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

notifySchema.set("toObject", {
    transform: (doc, ret) => {
        ret.id = doc._id.toString();
        delete ret._id;
        delete ret.__v;
    },
});

const Notification: Model<NotifyDocument> = model<NotifyDocument>("Notification", notifySchema) as Model<NotifyDocument>;

export default Notification;