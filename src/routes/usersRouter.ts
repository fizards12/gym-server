import { Router } from "express"
import { deleteHandler, getAll, getUser, registerHandler } from "../routeshandlers/usersHandler";
import { checkSchema, header, param } from "express-validator";
import { userValidatorSchema } from "../utils/validatorSchemas";
import { authMiddleware } from "../middleware/auth";
import { ADMIN_ROLES } from "../utils/constants";
const router: Router = Router();

router.get("/all", authMiddleware([ADMIN_ROLES.ADMIN, ADMIN_ROLES.CO_ADMIN]), getAll);
router.get("/:id",
param("id").exists().bail().trim().notEmpty().withMessage("Enter valid user id."),
header("authorization").exists().bail().trim().notEmpty().withMessage("Authorization header Not Set."),
authMiddleware([ADMIN_ROLES.ADMIN, ADMIN_ROLES.CO_ADMIN, "user"]), getUser);
router.post("/register", checkSchema(userValidatorSchema), registerHandler);
router.delete("/:id", authMiddleware([ADMIN_ROLES.ADMIN, ADMIN_ROLES.CO_ADMIN,"user"]), deleteHandler);


export default router;