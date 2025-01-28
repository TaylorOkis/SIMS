import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";

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
  });
  if (existingName) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ status: "fail", data: null, error: "Product already exists" });
    return;
  }

  const existingSlug = await db.product.findUnique({
    where: { slug },
  });
  if (existingSlug) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ status: "fail", data: null, error: "Slug already in use" });
    return;
  }

  const existingSku = await db.product.findUnique({
    where: { sku },
  });
  if (existingSku) {
    res.status(StatusCodes.CONFLICT).json({
      status: "fail",
      data: null,
      error: "Sku already in use",
    });
    return;
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
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Product not Found" });
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
  });
  if (!existingProduct) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Product not Found" });
    return;
  }

  if (name !== existingProduct.name) {
    const existingName = await db.product.findUnique({
      where: { name },
    });
    if (existingName) {
      res
        .status(StatusCodes.CONFLICT)
        .json({ status: "fail", data: null, error: "Product already exists" });
      return;
    }
  }

  if (slug !== existingProduct.slug) {
    const existingSlug = await db.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      res
        .status(StatusCodes.CONFLICT)
        .json({ status: "fail", data: null, error: "Slug already in use" });
      return;
    }
  }

  if (sku !== existingProduct.sku) {
    const existingSku = await db.product.findUnique({
      where: { sku },
    });
    if (existingSku) {
      res.status(StatusCodes.CONFLICT).json({
        status: "fail",
        data: null,
        error: "Sku already in use",
      });
      return;
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
  });
  if (!existingProduct) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Product not Found" });
    return;
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
