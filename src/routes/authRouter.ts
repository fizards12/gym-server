import { Router } from "express"
import { activateHandler, loginHandler, reAuthenticateHandler } from "../routeshandlers/authHandler";
const router: Router = Router();
router.post("/login", loginHandler);
router.get("/auto", reAuthenticateHandler);
router.get("/activate/:id", activateHandler);


export default router;