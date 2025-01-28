import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";

const createCategory = async (req, res) => {
  const { name, slug } = req.body;

  const existingName = await db.category.findUnique({
    where: { name },
  });
  if (existingName) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ status: "fail", data: null, error: "Category already exists" });
    return;
  }

  const existingSlug = await db.category.findUnique({
    where: { slug },
  });
  if (existingSlug) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ status: "fail", data: null, error: "Slug already in use" });
    return;
  }

  const category = await db.category.create({
    data: { name, slug },
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: category,
    error: null,
  });
};

const getAllCategories = async (req, res) => {
  const categories = await db.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    count: categories.length,
    data: categories,
    error: null,
  });
};

const getSingleCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  const existingCategory = await db.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Category not Found" });
    return;
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: existingCategory,
    error: null,
  });
};

const updateCategory = async (req, res) => {
  const { id: categoryId } = req.params;
  const { name, slug } = req.body;

  const existingCategory = await db.category.findUnique({
    where: { id: categoryId },
  });
  if (!existingCategory) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Category not Found" });
    return;
  }

  const existingName = await db.category.findUnique({
    where: { name },
  });
  if (existingName) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ status: "fail", data: null, error: "Name already in use" });
    return;
  }

  const existingSlug = await db.category.findUnique({
    where: { slug },
  });
  if (existingSlug) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ status: "fail", data: null, error: "Slug already in use" });
    return;
  }

  const updateCategory = await db.category.update({
    where: { id: categoryId },
    data: { name, slug },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: updateCategory,
    error: null,
  });
};

const deleteCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  const existingCategory = await db.category.findUnique({
    where: { id: categoryId },
  });
  if (!existingCategory) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "Category not Found" });
  }

  await db.category.delete({
    where: { id: categoryId },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
  });
};

export {
  getAllCategories,
  createCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
