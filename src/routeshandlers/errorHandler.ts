import { ErrorRequestHandler, Request, Response } from "express";
import { Errors } from "../utils/errorTypes";
import { TOKEN_TYPES } from "../utils/constants";

const errorHandler: ErrorRequestHandler = (error, req, res,next) => {
    const name = error.name;
    if (name === Errors.VALIDATION_ERROR) {
        return res.status(400).json({ error: error.errors })
    }
    if (name === Errors.CREDENTIALS_ERROR) {
        if (error.errors) {
            return res.status(400).json({ error: error.errors })
        }
        return res.status(400).json({ error: [Errors.CREDENTIALS_ERROR] });
    }
    if (name === Errors.INVALID_AUTH_HEADER) {
        return res.status(403).json({ error: Errors.INVALID_AUTH_HEADER, type: TOKEN_TYPES.ACCESS });
    }
    if (name === Errors.TOKEN_ERROR ||
        name === Errors.TOKEN_NOT_FOUND_ERROR ||
        name === Errors.TOKEN_EXPIRATION_ERROR ||
        name === Errors.INVALID_TOKEN_CREDENTIALS_ERROR
    ) {
        res.clearCookie("en-rt");
        return res.status(401).json({ error: name, type: error.type });
    }
    if (name === Errors.ACC_ACTIVATION_ERROR || name === Errors.SCOPE_ERROR) {
        return res.status(403).json({ error: name });
    }
    if (name === Errors.MAIL_FAILURE_ERROR) {
        return res.status(403).json({ error: name, type: error.type });
    } else {
        return res.status(500).send(error);
    }
}


export default errorHandler;