import express from "express";
import {
  forgotPassword,
  login,
  logOut,
} from "../controllers/auth-controller.js";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.get("/logout", logOut);
authRouter.post("/forgotPassword", forgotPassword);

export default authRouter;
