import express from "express";
import {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
} from "../controllers/product-controller.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/authentication.js";

const productRouter = express.Router();

productRouter
  .route("/")
  .get(authenticateUser, getAllProducts)
  .post(authenticateUser, authorizePermissions("ADMIN"), createProduct);
productRouter.route("/search").get(authenticateUser, searchProduct);
productRouter
  .route("/:id")
  .get(authenticateUser, getSingleProduct)
  .patch(authenticateUser, authorizePermissions("ADMIN"), updateProduct)
  .delete(authenticateUser, authorizePermissions("ADMIN"), deleteProduct);

export default productRouter;
