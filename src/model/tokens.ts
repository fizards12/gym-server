import mongoose, { Schema } from "mongoose";
export interface TokenInterface {
    token: string,
    state: "activate" | "blocked"
}

const tokenSchema = new Schema<TokenInterface>({
    token: {
        type: String,
        required: true,
        unique: true
    },
    state: {
        type: String,
        required: true
    }
})

tokenSchema.set("toObject", {
    transform: (doc, ret) => {
        ret.id = doc._id.toString();
        delete ret._id;
        delete ret.__v;
    },
});

const Token = mongoose.model("Token", tokenSchema);

export default Token;
