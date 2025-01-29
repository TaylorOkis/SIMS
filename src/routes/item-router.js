import express from "express";
import {
  createItem,
  deleteItem,
  getAllItems,
  getSingleItem,
  updateItem,
} from "../controllers/item-controller.js";

const itemRouter = express.Router();

itemRouter.route("/").get(getAllItems).post(createItem);
itemRouter
  .route("/:id")
  .get(getSingleItem)
  .patch(updateItem)
  .delete(deleteItem);

export default itemRouter;
