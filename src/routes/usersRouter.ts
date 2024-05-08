import { Router} from "express"
import { registerHandler } from "../routeshandlers/usersHandler";
import { checkSchema } from "express-validator";
import { userValidatorSchema } from "../utils/validatorSchemas";
const router : Router = Router();


router.post("/register",checkSchema(userValidatorSchema),registerHandler)
// router.post("/login",loginHandler)
// router.post("/token",accessTokenGeneratorHandler);


export default router;