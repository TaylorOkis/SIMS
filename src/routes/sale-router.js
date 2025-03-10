import express from "express";
import {
  createSale,
  getAllSales,
  getSingleSale,
  updateSale,
  deleteSale,
  getAllSalesPersonSales,
} from "../controllers/sales-controller.js";

import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/authentication.js";

const saleRouter = express.Router();

saleRouter
  .route("/salesPersonSales/:id")
  .get(authenticateUser, getAllSalesPersonSales);
saleRouter
  .route("/")
  .get(authenticateUser, authorizePermissions("ADMIN"), getAllSales)
  .post(authenticateUser, createSale);
saleRouter
  .route("/:id")
  .get(authenticateUser, getSingleSale)
  .patch(authenticateUser, updateSale)
  .delete(authenticateUser, authorizePermissions("ADMIN"), deleteSale);

export default saleRouter;
