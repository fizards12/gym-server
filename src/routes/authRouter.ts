import { Router } from "express"
import { activateHandler, loginHandler, logoutHandler, reAuthenticateHandler } from "../routeshandlers/authHandler";
const router: Router = Router();
router.post("/login", loginHandler);
router.get("/auto", reAuthenticateHandler);
router.get("/activate/:id", activateHandler);
router.post("/logout/:id",logoutHandler)


export default router;