import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";

const createItem = async (req, res) => {
  const { productId, quantity, orderId } = req.body;

  const purchaseProduct = await db.product.findUnique({
    where: { id: productId },
  });

  if (!purchaseProduct) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Product does not exist" });
    return;
  }

  if (quantity > purchaseProduct.stockQty) {
    res.status(StatusCodes.NOT_ACCEPTABLE).json({
      status: "fail",
      data: null,
      error: "Quantity is greater than what is in stock",
    });
    return;
  }

  const result = await db.$transaction(async (tx) => {
    const unitPrice = purchaseProduct.sellingPrice;

    const totalPrice = unitPrice * quantity;

    const item = await tx.item.create({
      data: { productId, quantity, total_price: totalPrice, orderId },
    });
    await tx.product.update({
      where: { id: productId },
      data: { stockQty: { decrement: quantity } },
    });

    return item;
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: result,
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
    return;
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

  const existingItem = await db.item.findUnique({
    where: { id: itemId },
  });
  if (!existingItem) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Item not Found" });
    return;
  }

  const existingProduct = await db.item.findUnique({
    where: { id: existingItem.productId },
  });
  if (!existingProduct) {
    res.status(StatusCodes.NOT_FOUND).json({
      status: "fail",
      data: null,
      error: "Current Item product not found",
    });
  }

  const purchaseProduct = await db.product.findUnique({
    where: { id: productId },
  });
  if (!purchaseProduct) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Product does not exist" });
    return;
  }

  if (
    quantity > purchaseProduct.stockQty ||
    quantity > existingProduct.stockQty
  ) {
    res.status(StatusCodes.NOT_ACCEPTABLE).json({
      status: "fail",
      data: null,
      error: "Quantity is greater than what is in stock",
    });
    return;
  }

  const result = await db.$transaction(async (tx) => {
    let totalPrice;

    if (
      quantity !== existingItem.quantity ||
      productId !== existingItem.productId
    ) {
      const unitPrice = purchaseProduct.sellingPrice;
      totalPrice = unitPrice * quantity;
    }

    const updateItem = await tx.item.update({
      where: { id: itemId },
      data: {
        productId,
        quantity,
        total_price: totalPrice,
        orderId,
      },
    });

    if (
      productId === existingItem.productId &&
      quantity > existingItem.quantity
    ) {
      await tx.product.update({
        where: { id: productId },
        data: { stockQty: { decrement: quantity } },
      });
    }

    if (
      productId === existingItem.productId &&
      quantity < existingItem.quantity
    ) {
      await tx.product.update({
        where: { id: productId },
        data: { stockQty: { increment: existingItem.quantity - quantity } },
      });
    }

    if (productId !== existingItem.productId) {
      await db.product.update({
        where: { id: productId },
        data: { stockQty: { decrement: quantity } },
      });

      await db.product.update({
        where: { id: existingItem.productId },
        data: { stockQty: { increment: existingItem.quantity } },
      });
    }
    return updateItem;
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: result,
    error: null,
  });
};

const deleteItem = async (req, res) => {
  const { id: itemId } = req.params;

  const existingItem = await db.item.findUnique({
    where: { id: itemId },
  });
  if (!existingItem) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Item not Found" });
    return;
  }

  await db.$transaction(async (tx) => {
    await tx.item.delete({
      where: { id: itemId },
    });

    await tx.product.update({
      where: { id: existingItem.productId },
      data: { stockQty: { increment: existingItem.quantity } },
    });
  });

  res.status(StatusCodes.OK).json({
    status: "success",
  });
};

export { getAllItems, createItem, getSingleItem, updateItem, deleteItem };
