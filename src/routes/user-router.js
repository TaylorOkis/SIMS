import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  updateUser,
} from "../controllers/user-controller.js";

const userRouter = express.Router();

userRouter.route("/").get(getAllUsers).post(createUser);
userRouter
  .route("/:id")
  .get(getSingleUser)
  .patch(updateUser)
  .delete(deleteUser);

export default userRouter;
