import express from "express";
import notification from "../controllers/notification-controller.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/authentication.js";

const notificationRouter = express.Router();

notificationRouter.get(
  "/",
  authenticateUser,
  authorizePermissions("ADMIN"),
  notification
);

export default notificationRouter;
