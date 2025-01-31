import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getSingleOrder,
} from "../controllers/order-controller.js";

const orderRouter = express.Router();

orderRouter.route("/").post(createOrder).get(getAllOrders);
orderRouter.route("/:id").get(getSingleOrder).delete(deleteOrder);

export default orderRouter;
