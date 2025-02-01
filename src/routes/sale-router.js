import express from "express";
import {
  createSale,
  getAllSales,
  getSingleSale,
  updateSale,
  deleteSale,
} from "../controllers/sales-controller.js";

const saleRouter = express.Router();
saleRouter.route("/").get(getAllSales).post(createSale);
saleRouter
  .route("/:id")
  .get(getSingleSale)
  .patch(updateSale)
  .delete(deleteSale);

export default saleRouter;
