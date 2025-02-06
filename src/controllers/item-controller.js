import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";
import NotFoundError from "../utils/errors/not-found.js";
import BadRequestError from "../utils/errors/bad-request.js";

const createItem = async (req, res) => {
  const { productId, quantity, orderId } = req.body;

  const purchaseProduct = await db.product.findUnique({
    where: { id: productId },
  });

  if (!purchaseProduct) {
    throw new NotFoundError("Product does not exist");
  }

  if (quantity > purchaseProduct.stockQty) {
    throw new BadRequestError("Quantity is greater than what is in stock");
  }

  const existingOrder = await db.order.findUnique({
    where: { id: orderId },
  });
  if (!existingOrder) {
    throw new NotFoundError("Order not Found");
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

    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      select: { totalPrice: true },
    });

    if (!existingOrder) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", data: null, error: "Order does not exist" });
      return;
    }

    // const newTotalPrice = existingOrder.totalPrice + totalPrice;

    await tx.order.update({
      where: { id: orderId },
      data: { totalPrice: { increment: totalPrice } },
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
  const items = await db.item.findMany({});

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
    throw new NotFoundError("Item not Found");
  }

  const existingProduct = await db.product.findUnique({
    where: { id: existingItem.productId },
  });
  if (!existingProduct) {
    throw new NotFoundError("Current Item product not found");
  }

  const purchaseProduct = await db.product.findUnique({
    where: { id: productId },
  });
  if (!purchaseProduct) {
    throw new NotFoundError("Product does not exist");
  }

  const stockQuantity = existingProduct.stockQty + existingItem.stockQty;

  console.log(stockQuantity);

  if (quantity > purchaseProduct.stockQty || quantity > stockQuantity) {
    throw new BadRequestError("Quantity is greater than what is in stock");
  }

  const existingOrder = await db.order.findUnique({
    where: { id: orderId },
  });
  if (!existingOrder) {
    throw new NotFoundError("Order not Found");
  }

  if (
    quantity === existingItem.quantity &&
    productId === existingItem.productId
  ) {
    res
      .status(StatusCodes.OK)
      .json({ status: "success", data: null, error: null });
    return;
  }

  const result = await db.$transaction(async (tx) => {
    let totalPrice;
    let newOrderTotalPrice;

    const unitPrice = purchaseProduct.sellingPrice;
    totalPrice = unitPrice * quantity;
    // prettier-ignore
    newOrderTotalPrice =
        (existingOrder.totalPrice - existingItem.total_price) + totalPrice;
    //prettier-ignore-end

    const updateItem = await tx.item.update({
      where: { id: itemId },
      data: {
        productId,
        quantity,
        total_price: totalPrice,
        orderId,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { totalPrice: newOrderTotalPrice },
    });

    if (
      productId === existingItem.productId &&
      quantity > existingItem.quantity
    ) {
      await tx.product.update({
        where: { id: productId },
        data: { stockQty: { decrement: quantity - existingItem.quantity } },
      });
    }

    if (
      productId === existingItem.productId &&
      quantity < existingItem.quantity
    ) {
      await tx.product.update({
        where: { id: productId },
        data: {
          stockQty: {
            increment: existingItem.quantity - quantity,
          },
        },
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
    throw new NotFoundError("Item not Found");
  }

  const existingOrder = await db.order.findUnique({
    where: { id: existingItem.orderId },
  });

  if (!existingOrder) {
    throw new NotFoundError("Order does not exist");
  }

  await db.$transaction(async (tx) => {
    await tx.item.delete({
      where: { id: itemId },
    });

    await tx.order.update({
      where: { id: existingOrder.id },
      data: { totalPrice: { decrement: existingItem.total_price } },
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
