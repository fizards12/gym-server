export enum Errors {
    VALIDATION_ERROR = "ValidationError",
    TOKEN_NOT_FOUND_ERROR = "TokenNotFoundError",
    TOKEN_EXPIRATION_ERROR = "TokenExpiredError",
    TOKEN_TYPE_ERROR = "TokenTypeError",
    INVALID_TOKEN_CREDENTIALS_ERROR = "InvalidTokenCredentialsError",
    TOKEN_ERROR = "JsonWebTokenError",
    INVALID_AUTH_HEADER = "InvalidAuthorizationHeader",
    CREDENTIALS_ERROR = "CredentialsError",
    SCOPE_ERROR = "InvalidScopeError",
    MAIL_FAILURE_ERROR = "SendingMailError",
    ACC_ACTIVATION_ERROR = "AccountActivationError",
}



//Inputs Valiation Errors
enum ValidationErrors{
    NotExistError = " value is required.",
    InvalidValueError = " value is invalid.",
    UniquenessError = " must be unique"
}
export enum PasswordErrors {
    InvalidValueError = "Password" + ValidationErrors.InvalidValueError ,
    NotExistError= "Password" + ValidationErrors.NotExistError,
    LengthError = "Password length must be in range [12-30] character.",
    SmallLetterError = "Must contain at least one small letter.",
    CapitalLetterError = "Must contain at least one capital letter.",
    SymbolError = "Password must contain at least one of these symbols: @, #, $, %.",
    AlphanumericError = "Password must contain at least one alphanumeric character."
}


export enum NameErrors {
    InvalidValueError = "Name" + ValidationErrors.InvalidValueError ,
    NotExistError= "Name" + ValidationErrors.NotExistError,
    LengthError = "Name length must be in range [6-50] character.",
}
export enum UsernameErrors {
    InvalidValueError = "Username" + ValidationErrors.InvalidValueError ,
    NotExistError= "Username" + ValidationErrors.NotExistError,
    LengthError = "Username length must be in range [6-20] character.",
    FirstLetterError = "Username must begin with alphabet character.",
    UniquenessError = "Username" + ValidationErrors.UniquenessError
}
export enum EmailErrors {
    InvalidValueError = "Email" + ValidationErrors.InvalidValueError ,
    NotExistError= "Email" + ValidationErrors.NotExistError,
    UniquenessError = "Email" + ValidationErrors.UniquenessError
}
export enum RoleErrors {
    InvalidValueError = "Role" + ValidationErrors.InvalidValueError ,
    NotExistError= "Role" + ValidationErrors.NotExistError,
}
