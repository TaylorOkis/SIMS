import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
} from "../controllers/order-controller.js";
import { authenticateUser } from "../middlewares/authentication.js";

const orderRouter = express.Router();

orderRouter
  .route("/")
  .post(authenticateUser, createOrder)
  .get(authenticateUser, getAllOrders);
orderRouter
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(updateOrder)
  .delete(authenticateUser, deleteOrder);

export default orderRouter;
