import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../utils/errors/index.js";
import paginate from "../utils/pagination.js";

const createSale = async (req, res) => {
  const { dateOfSale, orderId, status, paymentMethod } = req.body;

  const existingOrder = await db.order.findUnique({
    where: { id: orderId },
  });
  if (!existingOrder) {
    throw new NotFoundError("Order not found");
  }

  const salesPersonId = existingOrder.salesPersonId;
  const totalAmount = existingOrder.totalPrice;

  const sale = await db.sale.create({
    data: {
      dateOfSale,
      totalAmount,
      salesPersonId,
      orderId,
      status,
      paymentMethod,
    },
  });

  res
    .status(StatusCodes.CREATED)
    .json({ status: "success", data: sale, error: null });
};

const getAllSales = async (req, res) => {
  const sales = await db.sale.findMany({
    take: Number(req.query.limit) || 15,
    skip: paginate(req.query.page, req.query.limit),
    orderBy: { createdAt: "desc" },
  });

  res
    .status(StatusCodes.OK)
    .json({ status: "success", count: sales.length, data: sales, error: null });
};

const getAllSalesPersonSales = async (req, res) => {
  const { id: salesPersonId } = req.params;

  const existingUser = await db.user.findUnique({
    where: { id: salesPersonId },
  });
  if (!existingUser) {
    throw new NotFoundError("User not Found");
  }

  const sales = await db.sale.findMany({
    where: { salesPersonId },
    take: Number(req.query.limit) || 15,
    skip: paginate(req.query.page, req.query.limit),
    orderBy: { createdAt: "desc" },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    count: sales.length,
    data: sales,
    error: null,
  });
};

const getSingleSale = async (req, res) => {
  const { id: saleId } = req.params;
  const existingSale = await db.sale.findUnique({
    where: { id: saleId },
  });

  if (!existingSale) {
    throw new NotFoundError("Sale not found");
  }

  res
    .status(StatusCodes.OK)
    .json({ status: "success", data: sale, error: null });
};

const updateSale = async (req, res) => {
  const { id: saleId } = req.params;
  const { dateOfSale, orderId, status, paymentMethod } = req.body;

  const existingOrder = await db.order.findUnique({
    where: { id: orderId },
    select: { salesPersonId: true, totalPrice: true },
  });
  if (!existingOrder) {
    throw new NotFoundError("Order not found");
  }

  const salesPersonId = existingOrder.salesPersonId;
  const totalAmount = existingOrder.totalPrice;

  const sale = await db.sale.update({
    where: { id: saleId },
    data: {
      dateOfSale,
      totalAmount,
      salesPersonId,
      orderId,
      status,
      paymentMethod,
    },
  });

  res
    .status(StatusCodes.CREATED)
    .json({ status: "success", data: sale, error: null });
};

// TODO: Write code for deleting sale (only applicable for ADMIN)
const deleteSale = async (req, res) => {};

export {
  createSale,
  getAllSales,
  getSingleSale,
  updateSale,
  deleteSale,
  getAllSalesPersonSales,
};
