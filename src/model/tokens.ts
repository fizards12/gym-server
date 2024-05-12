import mongoose, { Schema } from "mongoose";
export interface TokenInterface {
    token_id: string | undefined,
    token: string
}

const tokenSchema = new Schema<TokenInterface>({
    token_id: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    token: {
        type: String,
        required: true,
        unique: true
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
