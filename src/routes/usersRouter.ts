import { Router} from "express"
import { accessTokenGeneratorHandler, loginHandler, registerHandler, sendMail } from "../routeshandlers/usersHandler";
import { ParamSchema, checkSchema } from "express-validator";
import { userValidatorSchema } from "../utils/validatorSchemas";
import { UserKeys } from "../model/users";
const router : Router = Router();

const loginValidationSchema: Record<UserKeys,ParamSchema> = {
    email: userValidatorSchema.email,
    password: userValidatorSchema.password,
    name: {},
    username: {},
    activated: {},
    refreshToken: {},
    role: {},
    member_id: {}
}
router.post("/register",checkSchema(userValidatorSchema),registerHandler)
router.post("/login",checkSchema(loginValidationSchema),loginHandler);
router.post("/token",accessTokenGeneratorHandler);


export default router;