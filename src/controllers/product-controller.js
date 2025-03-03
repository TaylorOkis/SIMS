import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../utils/errors/bad-request.js";
import NotFoundError from "../utils/errors/not-found.js";
import paginate from "../utils/pagination.js";

const createProduct = async (req, res) => {
  const {
    name,
    description,
    alertQty,
    stockQty,
    buyingPrice,
    sellingPrice,
    slug,
    sku,
    supplier_name,
    supplier_contact,
    categoryId,
  } = req.body;

  const existingName = await db.product.findUnique({
    where: { name },
    select: { name: true },
  });
  if (existingName) {
    throw new BadRequestError("Product already exists");
  }

  const existingSlug = await db.product.findUnique({
    where: { slug },
    select: { slug: true },
  });
  if (existingSlug) {
    throw new BadRequestError("Slug already in use");
  }

  const existingSku = await db.product.findUnique({
    where: { sku },
    select: { sku: true },
  });
  if (existingSku) {
    throw new BadRequestError("Sku already in use");
  }

  const product = await db.product.create({
    data: {
      name,
      description,
      alertQty,
      stockQty,
      buyingPrice,
      sellingPrice,
      slug,
      sku,
      supplier_name,
      supplier_contact,
      categoryId,
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: product,
    error: null,
  });
};

const getAllProducts = async (req, res) => {
  const products = await db.product.findMany({
    take: Number(req.query.limit),
    skip: paginate(req.query.page, req.query.limit),
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    count: products.length,
    data: products,
    error: null,
  });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const existingProduct = await db.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    throw new NotFoundError("Product not Found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: existingProduct,
    error: null,
  });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const {
    name,
    description,
    alertQty,
    stockQty,
    buyingPrice,
    sellingPrice,
    slug,
    sku,
    supplier_name,
    supplier_contact,
    categoryId,
  } = req.body;

  const existingProduct = await db.product.findUnique({
    where: { id: productId },
    select: { name: true, slug: true, sku: true },
  });
  if (!existingProduct) {
    throw new NotFoundError("Product not Found");
  }

  if (name !== existingProduct.name) {
    const existingName = await db.product.findUnique({
      where: { name },
      select: { name: true },
    });
    if (existingName) {
      throw new BadRequestError("Product already exists");
    }
  }

  if (slug !== existingProduct.slug) {
    const existingSlug = await db.product.findUnique({
      where: { slug },
      select: { slug: true },
    });
    if (existingSlug) {
      throw new BadRequestError("Slug already in use");
    }
  }

  if (sku !== existingProduct.sku) {
    const existingSku = await db.product.findUnique({
      where: { sku },
      select: { sku: true },
    });
    if (existingSku) {
      throw new BadRequestError("Sku already in use");
    }
  }

  const updateProduct = await db.product.update({
    where: { id: productId },
    data: {
      name,
      description,
      alertQty,
      stockQty,
      buyingPrice,
      sellingPrice,
      slug,
      sku,
      supplier_name,
      supplier_contact,
      categoryId,
    },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: updateProduct,
    error: null,
  });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const existingProduct = await db.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!existingProduct) {
    throw new NotFoundError("Product not Found");
  }

  await db.product.delete({
    where: { id: productId },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
  });
};

export {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
