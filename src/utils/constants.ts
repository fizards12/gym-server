enum Errors{
    NotExistError = " value is required.",
    InvalidValueError = " value is invalid.",
    UniquenessError = " must be unique"
}
export enum PasswordErrors {
    InvalidValueError = "Password" + Errors.InvalidValueError ,
    NotExistError= "Password" + Errors.NotExistError,
    LengthError = "Password length must be in range [12-30] character.",
    SmallLetterError = "Must contain at least one small letter.",
    CapitalLetterError = "Must contain at least one capital letter.",
    SymbolError = "Password must contain at least one of these symbols: @, #, $, %.",
    AlphanumericError = "Password must contain at least one alphanumeric character."
}


export enum NameErrors {
    InvalidValueError = "Name" + Errors.InvalidValueError ,
    NotExistError= "Name" + Errors.NotExistError,
    LengthError = "Name length must be in range [6-50] character.",
}
export enum UsernameErrors {
    InvalidValueError = "Username" + Errors.InvalidValueError ,
    NotExistError= "Username" + Errors.NotExistError,
    LengthError = "Username length must be in range [6-20] character.",
    FirstLetterError = "Username must begin with alphabet character.",
    UniquenessError = "Username" + Errors.UniquenessError
}
export enum EmailErrors {
    InvalidValueError = "Email" + Errors.InvalidValueError ,
    NotExistError= "Email" + Errors.NotExistError,
    UniquenessError = "Email" + Errors.UniquenessError
}
export enum RoleErrors {
    InvalidValueError = "Role" + Errors.InvalidValueError ,
    NotExistError= "Role" + Errors.NotExistError,
}
