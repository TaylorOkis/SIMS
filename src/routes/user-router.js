import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  updateUser,
} from "../controllers/user-controller.js";
import { authenticateUser } from "../middlewares/authentication.js";

const userRouter = express.Router();

userRouter
  .route("/")
  .get(authenticateUser, getAllUsers)
  .post(authenticateUser, createUser);
userRouter
  .route("/:id")
  .get(authenticateUser, getSingleUser)
  .patch(authenticateUser, updateUser)
  .delete(authenticateUser, deleteUser);

export default userRouter;
