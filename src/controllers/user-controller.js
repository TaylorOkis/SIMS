import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import BadRequestError from "../utils/errors/bad-request.js";
import NotFoundError from "../utils/errors/not-found.js";

const createUser = async (req, res) => {
  const {
    username,
    firstname,
    lastname,
    password,
    email,
    phone,
    role,
    status,
    gender,
    DOB,
    address,
    image,
  } = req.body;

  const existingUsername = await db.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    throw new BadRequestError("Username already exists");
  }

  const existingEmail = await db.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    throw new BadRequestError("Email already in use");
  }

  if (phone) {
    const existingPhone = await db.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      throw new BadRequestError("Phone number already in use");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      username,
      firstname,
      lastname,
      password: hashedPassword,
      email,
      phone,
      role,
      status,
      gender,
      DOB,
      address,
      image,
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: user,
    error: null,
  });
};

const getAllUsers = async (req, res) => {
  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    count: users.length,
    data: users,
    error: null,
  });
};

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;

  const existingUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new NotFoundError("User not Found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: existingUser,
    error: null,
  });
};

const updateUser = async (req, res) => {
  const { id: userId } = req.params;
  const {
    username,
    firstname,
    lastname,
    email,
    phone,
    role,
    status,
    gender,
    DOB,
    address,
    image,
  } = req.body;

  const existingUser = await db.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new NotFoundError("User not Found");
  }

  const existingUsername = await db.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    throw new BadRequestError("Username already exists");
  }

  const existingEmail = await db.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    throw new BadRequestError("Email already in use");
  }

  if (phone) {
    const existingPhone = await db.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      throw new BadRequestError("Phone number already in use");
    }
  }

  const updateUser = await db.user.update({
    where: { id: userId },
    data: {
      username,
      firstname,
      lastname,
      email,
      phone,
      role,
      status,
      gender,
      DOB,
      address,
      image,
    },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: updateUser,
    error: null,
  });
};

const deleteUser = async (req, res) => {
  const { id: userId } = req.params;

  const existingUser = await db.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new NotFoundError("User not Found");
  }

  await db.user.delete({
    where: { id: userId },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
  });
};

const updateUserPassword = async (req, res) => {
  const { id: userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  const existingUser = await db.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new NotFoundError("User not Found");
  }

  const passwordMatch = await bcrypt.compare(
    oldPassword,
    existingUser.password
  );
  if (!passwordMatch) {
    throw new BadRequestError("Invalid Old Password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  res.status(StatusCodes.OK).json({ status: "success" });
};

export {
  getAllUsers,
  createUser,
  getSingleUser,
  updateUser,
  deleteUser,
  updateUserPassword,
};
