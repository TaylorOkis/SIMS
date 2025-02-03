import express from "express";
import {
  getAllCategories,
  createCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category-controller.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/authentication.js";

const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .get(authenticateUser, getAllCategories)
  .post(authenticateUser, authorizePermissions("ADMIN"), createCategory);
categoryRouter
  .route("/:id")
  .get(authenticateUser, getSingleCategory)
  .patch(authenticateUser, authorizePermissions("ADMIN"), updateCategory)
  .delete(authenticateUser, authorizePermissions("ADMIN"), deleteCategory);

export default categoryRouter;
