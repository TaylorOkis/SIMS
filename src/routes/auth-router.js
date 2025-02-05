import express from "express";
import {
  forgotPassword,
  verifyResetToken,
  login,
  logOut,
  changePassword,
} from "../controllers/auth-controller.js";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.get("/logout", logOut);
authRouter.post("/forgotPassword", forgotPassword);
authRouter.get("/verifyResetToken", verifyResetToken);
authRouter.post("/changePassword", changePassword);

export default authRouter;
