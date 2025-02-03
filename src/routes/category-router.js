import express from "express";
import {
  getAllCategories,
  createCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category-controller.js";
import { authenticateUser } from "../middlewares/authentication.js";

const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .get(authenticateUser, getAllCategories)
  .post(authenticateUser, createCategory);
categoryRouter
  .route("/:id")
  .get(authenticateUser, getSingleCategory)
  .patch(authenticateUser, updateCategory)
  .delete(authenticateUser, deleteCategory);

export default categoryRouter;
