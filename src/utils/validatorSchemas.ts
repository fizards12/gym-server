import { CustomValidator, ParamSchema, Schema, body } from "express-validator";
import User, { UserKeys } from "../model/users";
import { EmailErrors, NameErrors, PasswordErrors, RoleErrors, UsernameErrors } from "./errorTypes";

const userValidatorSchema: Record<UserKeys, ParamSchema> = {
    name: {
        in: ["body"],
        exists: {
            errorMessage: NameErrors.NotExistError,
            bail: true
        },
        escape: true,
        isString: {
            errorMessage: NameErrors.InvalidValueError,
            bail: true
        },
        trim: true,
        notEmpty: {
            errorMessage: NameErrors.InvalidValueError,
            bail: true
        },

        matches: {
            options: /^[a-zA-Z\s]+$/,
            errorMessage: NameErrors.InvalidValueError,
            bail: true
        },
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            if: body("name").exists().trim().notEmpty(),
            errorMessage: NameErrors.LengthError,
        },
    },
    username: {
        in: ["body"],
        exists: {
            errorMessage: UsernameErrors.NotExistError,
            bail: true
        },
        escape: true,
        isString: {
            errorMessage: UsernameErrors.InvalidValueError,
            bail: true
        },
        trim: true,
        notEmpty: {
            errorMessage: UsernameErrors.InvalidValueError,
            bail: true
        },
        matches: {
            options: /^[a-zA-Z].*$/,
            errorMessage: UsernameErrors.InvalidValueError,
            bail: true
        },
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            if: body("username").exists().trim().notEmpty(),
            errorMessage: UsernameErrors.LengthError,
        },
    },
    email: {
        in: ["body"],
        exists: {
            errorMessage: EmailErrors.NotExistError,
            bail: true
        },
        escape: true,
        isString: {
            errorMessage: EmailErrors.InvalidValueError,
            bail: true
        },
        trim: true,
        notEmpty: {
            errorMessage: EmailErrors.InvalidValueError,
            bail: true
        },
        isEmail: {
            if: body("email").isString().trim().notEmpty(),
            errorMessage: EmailErrors.InvalidValueError,
        },
    },
    password: {
        in: ["body"],
        exists: {
            errorMessage: PasswordErrors.NotExistError,
            bail: true
        },
        escape: true,
        isString: {
            errorMessage: PasswordErrors.InvalidValueError,
            bail: true
        },
        trim: true,
        notEmpty: {
            errorMessage: PasswordErrors.InvalidValueError,
            bail: true
        },
        isLength: {
            options: {
                min: 12,
                max: 30
            },
            errorMessage: PasswordErrors.LengthError,
        },
        custom: {
            options: (value, { req }) => {
                const errors : string[] = [];
                if (!/[a-z]/.test(value)) {
                    errors.push(PasswordErrors.SmallLetterError);
                }
                if (!/[A-Z]/.test(value)) {
                    errors.push(PasswordErrors.CapitalLetterError);
                }
                if (!/[@#$%]/.test(value)) {
                    errors.push(PasswordErrors.SymbolError);
                }
                if (!/[a-zA-Z0-9]/.test(value)) {
                    errors.push(PasswordErrors.AlphanumericError);
                }
                if (errors.length === 0) {
                    return true;
                } 
                throw errors;
            },
            bail: true
        }
    },
    role: {
        in: ["body"],
        exists: {
            errorMessage: RoleErrors.NotExistError,
            bail: true
        },
        isString: {
            errorMessage: RoleErrors.InvalidValueError,
            bail: true
        },
        trim: true,
        notEmpty: {
            errorMessage: RoleErrors.InvalidValueError,
        },
    },
    member_id: {
        optional: true,
        exists: {
            negated: true,
            errorMessage: "Enter Valid Credentials",
            bail: {
                level: "request"
            }
        },
    },
    notifications: {
        optional: true,
        exists: {
            negated: true,
            errorMessage: "Enter Valid Credentials",
            bail: {
                level: "request"
            }
        },
    },
    activated: {
        optional: true,
        exists: {
            negated: true,
            errorMessage: "Enter Valid Credentials",
            bail: {
                level: "request"
            }
        },
    },
}

export const loginValidationSchema: Record<UserKeys,ParamSchema> = {
    email: userValidatorSchema.email,
    password: userValidatorSchema.password,
    name: {},
    username: {},
    activated: {},
    role: {},
    notifications: {},
    member_id: {}
}

export { userValidatorSchema }