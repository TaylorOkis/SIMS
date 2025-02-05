import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getAllSalesPersonOrders,
  getSingleOrder,
  updateOrder,
} from "../controllers/order-controller.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/authentication.js";

const orderRouter = express.Router();
orderRouter
  .route("/salesPersonOrders/:id")
  .get(authenticateUser, getAllSalesPersonOrders);
orderRouter
  .route("/")
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions("ADMIN"), getAllOrders);
orderRouter
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder)
  .delete(authenticateUser, deleteOrder);

export default orderRouter;
