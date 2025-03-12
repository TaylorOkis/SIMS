import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  initialAdminSetup,
  updateUser,
  updateUserPassword,
} from "../controllers/user-controller.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/authentication.js";

const userRouter = express.Router();

userRouter
  .route("/updatePassword/:id")
  .patch(authenticateUser, updateUserPassword);

userRouter.route("/setup").post(initialAdminSetup);

userRouter
  .route("/")
  .get(authenticateUser, authorizePermissions("ADMIN"), getAllUsers)
  .post(authenticateUser, authorizePermissions("ADMIN"), createUser);
userRouter
  .route("/:id")
  .get(authenticateUser, getSingleUser)
  .patch(authenticateUser, authorizePermissions("ADMIN"), updateUser)
  .delete(authenticateUser, authorizePermissions("ADMIN"), deleteUser);

export default userRouter;
