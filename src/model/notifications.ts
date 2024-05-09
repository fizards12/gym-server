import { Model, Schema, model } from "mongoose";


export interface NotificationInterface {
    message: string,
    receivers_role: string[]
}

export type NotificationKeys = keyof NotificationInterface;

export interface NotifyDocument extends Document,NotificationInterface {}

const notifySchema = new Schema<NotifyDocument>({
    message: {
        type: String,
        required: [true,"Notification Message value is required"],
        unique: true,
    },
    receivers_role: {
        type: [{
            type: String,
            unique: true
        }],
        required: [true,"Select to whom this Notification whill be sent."]
    }
});

notifySchema.set("toObject", {
    transform: (doc, ret) => {
        ret.id = doc._id.toString();
        delete ret._id;
        delete ret.__v;
    },
});

const Notification: Model<NotifyDocument> = model<NotifyDocument>("Notification",notifySchema) as Model<NotifyDocument>;

export default Notification;