import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../utils/errors/index.js";
import paginate from "../utils/pagination.js";

const createOrder = async (req, res) => {
  const { customerName, customerContact, salesPersonId, itemIds, status } =
    req.body;

  let totalPrice = 0;
  if (itemIds) {
    for (const itemId in itemIds) {
      const existingItem = await db.item.findUnique({
        where: { id: itemId },
      });
      if (!existingItem) {
        throw new NotFoundError("Item not Found");
      }
      totalPrice += existingItem.total_price;
    }
  }

  const order = await db.order.create({
    data: {
      customerName,
      customerContact,
      salesPersonId,
      itemIds,
      totalPrice,
      status,
    },
    include: { items: true },
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: order,
    error: null,
  });
};

const getAllOrders = async (req, res) => {
  const orders = await db.order.findMany({
    take: Number(req.query.limit),
    skip: paginate(req.query.page, req.query.limit),
    orderBy: {
      createdAt: "desc",
    },
    include: { items: true },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    count: orders.length,
    data: orders,
    error: null,
  });
};

const getAllSalesPersonOrders = async (req, res) => {
  const { id: salesPersonId } = req.params;

  const existingUser = await db.user.findUnique({
    where: { id: salesPersonId },
    select: { id: true },
  });
  if (!existingUser) {
    throw new NotFoundError("User not Found");
  }

  const orders = await db.order.findMany({
    where: { salesPersonId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    count: orders.length,
    data: orders,
    error: null,
  });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;

  const existingOrder = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!existingOrder) {
    throw new NotFoundError("Order not Found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: existingOrder,
    error: null,
  });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { customerName, customerContact, salesPersonId, itemIds, status } =
    req.body;

  const existingOrder = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });
  if (!existingOrder) {
    throw new NotFoundError("Order not Found");
  }

  const updateOrder = await db.order.update({
    where: { id: orderId },
    data: {
      customerName,
      customerContact,
      salesPersonId,
      itemIds,
      totalPrice,
      status,
    },
    include: { items: true },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: updateOrder,
    error: null,
  });
};

const deleteOrder = async (req, res) => {
  const { id: orderId } = req.params;

  const existingOrder = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!existingOrder) {
    throw new NotFoundError("Order not Found");
  }

  await db.$transaction(async (tx) => {
    for (const item of existingOrder.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { increment: item.quantity } },
      });
      await tx.item.delete({
        where: { id: item.id },
      });
    }

    await tx.order.delete({
      where: { id: orderId },
    });
  });

  res.status(StatusCodes.OK).json({
    status: "success",
  });
};

export {
  getAllOrders,
  createOrder,
  getSingleOrder,
  updateOrder,
  deleteOrder,
  getAllSalesPersonOrders,
};
