import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";

const createItem = async (req, res) => {
  const { productId, quantity, orderId } = req.body;

  const purchaseProduct = await db.product.findUnqiue({
    where: { id: productId },
  });

  if (!purchaseProduct) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Product does not exist" });
  }

  const unitPrice = purchaseProduct.sellingPrice;

  const totalPrice = unitPrice * quantity;

  const product = await db.item.create({
    data: { productId, quantity, total_price: totalPrice, orderId },
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: product,
    error: null,
  });
};

const getAllItems = async (req, res) => {
  const items = await db.item.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    count: items.length,
    data: items,
    error: null,
  });
};

const getSingleItem = async (req, res) => {
  const { id: itemId } = req.params;

  const existingItem = await db.item.findUnique({
    where: { id: itemId },
  });

  if (!existingItem) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Item not Found" });
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: existingItem,
    error: null,
  });
};

const updateItem = async (req, res) => {
  const { id: itemId } = req.params;
  const { productId, quantity, orderId } = req.body;

  const existingItem = await db.product.findUnique({
    where: { id: itemId },
  });
  if (!existingItem) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Item not Found" });
    return;
  }

  let totalPrice = existingItem.total_price;

  if (quantity !== existingItem.quantity) {
    const unitPrice = existingItem.price;
    totalPrice = unitPrice * quantity;
  }

  const updateItem = await db.item.update({
    where: { id: itemId },
    data: {
      productId,
      quantity,
      total_price: totalPrice,
      orderId,
    },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: updateItem,
    error: null,
  });
};

const deleteItem = async (req, res) => {
  const { id: itemId } = req.params;

  const existingItem = await db.product.findUnique({
    where: { id: itemId },
  });
  if (!existingItem) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Item not Found" });
    return;
  }

  await db.item.delete({
    where: { id: itemId },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
  });
};

export { getAllItems, createItem, getSingleItem, updateItem, deleteItem };
