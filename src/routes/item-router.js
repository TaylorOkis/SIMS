import express from "express";
import {
  createItem,
  deleteItem,
  getAllItems,
  getSingleItem,
  updateItem,
} from "../controllers/item-controller.js";
import { authenticateUser } from "../middlewares/authentication.js";

const itemRouter = express.Router();

itemRouter
  .route("/")
  .get(authenticateUser, getAllItems)
  .post(authenticateUser, createItem);
itemRouter
  .route("/:id")
  .get(authenticateUser, getSingleItem)
  .patch(authenticateUser, updateItem)
  .delete(authenticateUser, deleteItem);

export default itemRouter;
