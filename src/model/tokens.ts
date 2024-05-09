import mongoose, { Schema, Types } from "mongoose"

export interface TokenInterface {
    userId: string | undefined,
    token:string
}

const tokenSchema = new Schema<TokenInterface>({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    token:{
        type: String,
        required: true,
        unique:true
    }
})

tokenSchema.set("toObject", {
    transform: (doc, ret) => {
        ret.id = doc._id.toString();
        delete ret._id;
        delete ret.__v;
    },
});

const Token = mongoose.model("User", tokenSchema);

export default Token;
