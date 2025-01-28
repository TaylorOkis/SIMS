import express from "express";
import {
  getAllCategories,
  createCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category-controller.js";

const categoryRouter = express.Router();

categoryRouter.route("/").get(getAllCategories).post(createCategory);
categoryRouter
  .route("/:id")
  .get(getSingleCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

export default categoryRouter;
