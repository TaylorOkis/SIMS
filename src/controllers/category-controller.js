import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../utils/errors/index.js";

const createCategory = async (req, res) => {
  const { name, slug } = req.body;

  const existingName = await db.category.findUnique({
    where: { name },
    select: { name: true },
  });
  if (existingName) {
    throw new BadRequestError("Category already exists");
  }

  const existingSlug = await db.category.findUnique({
    where: { slug },
    select: { slug: true },
  });
  if (existingSlug) {
    throw new BadRequestError("Slug already in use");
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
    throw new NotFoundError("Category not Found");
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
    select: { id: true, name: true, slug: true },
  });
  if (!existingCategory) {
    throw new NotFoundError("Category not Found");
  }

  if (name !== existingCategory.name) {
    const existingName = await db.category.findUnique({
      where: { name },
      select: { name: true },
    });
    if (existingName) {
      throw new BadRequestError("Name already in use");
    }
  }

  if (slug !== existingCategory.slug) {
    const existingSlug = await db.category.findUnique({
      where: { slug },
      select: { slug: true },
    });
    if (existingSlug) {
      throw new BadRequestError("Slug already in use");
    }
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
    select: { id: true },
  });
  if (!existingCategory) {
    throw new NotFoundError("Category not Found");
  }

  const existingProductWithCategory = await db.product.findFirst({
    where: { categoryId },
    select: { id: true },
  });

  if (existingProductWithCategory) {
    throw new BadRequestError(
      "A product is part of this category. Category cannot be deleted"
    );
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
