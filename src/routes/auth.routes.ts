import express, { Request, Response } from "express";
import AuthController from "../controllers/auth.controller";

const authRouter = express.Router();
const authController = new AuthController();

authRouter.post("/signup", authController.add);
authRouter.post("/signin", authController.auth);
authRouter.post("/refreshtoken", authController.refresh);
authRouter.post("/logout", authController.logout);

export default authRouter;
