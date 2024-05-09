import mongoose ,{ Model, Schema } from "mongoose";
import { EmailErrors, PasswordErrors, RoleErrors, UsernameErrors } from "../utils/constants";
import { uniquenessValidator } from "../utils/utils";
import { Document } from "mongoose";
export interface UserInterface {
    name?: string,
    username?: string,
    email?: string,
    password?: string,
    activated?: boolean,
    refreshToken?: string,
    role?: string,
    member_id?: string | number,

}
export type UserKeys = keyof UserInterface;

export interface UserDocument extends Document,UserInterface {};

const userSchema = new Schema<UserDocument>({
    name: {
        type: String,
        required: [true, "please Enter your full name."],
        min: [6, "Enter your full name with at least 6 characters."],
        max: [50, "This is Too long name, please provide just first and last name."],
    },
    username: {
        type: String,
        required: [true, UsernameErrors.NotExistError],
        min: [6, UsernameErrors.LengthError],
        max: [
            20,
            UsernameErrors.LengthError,
        ],
        unique: true,
        validate: {
            validator: async(username: string): Promise<boolean> => {
                const isValid : boolean = await uniquenessValidator({username})
                return isValid;
            },
            message: UsernameErrors.UniquenessError
        }
    },
    email: {
        type: String,
        required: [true, EmailErrors.NotExistError],
        unique: true,
        validate: {
            validator: async function (email: string): Promise<boolean> {
                var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (!re.test(email)) {
                    return false;
                }
                const isValid: boolean = await uniquenessValidator({email});
                return isValid;
            },
            message: EmailErrors.InvalidValueError
        },
    },
    password: {
        type: String,
        required: [true, PasswordErrors.NotExistError],
    },
    activated:{
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        required: [true, RoleErrors.NotExistError]
    },
    member_id: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    }
});

userSchema.set("toObject", {
    transform: (doc, ret) => {
        ret.id = doc._id.toString();
        ret = {...doc}
        delete ret._id;
        delete ret.__v;
    },
});

const User : Model<UserDocument> = mongoose.model<UserDocument>("User", userSchema) as Model<UserDocument>;

export default User;
