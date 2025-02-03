import express from "express";
import {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product-controller.js";
import { authenticateUser } from "../middlewares/authentication.js";

const productRouter = express.Router();

productRouter
  .route("/")
  .get(authenticateUser, getAllProducts)
  .post(authenticateUser, createProduct);
productRouter
  .route("/:id")
  .get(authenticateUser, getSingleProduct)
  .patch(authenticateUser, updateProduct)
  .delete(authenticateUser, deleteProduct);

export default productRouter;
