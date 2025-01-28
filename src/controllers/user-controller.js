import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";

const createUser = async (req, res) => {
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

  const existingUsername = await db.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ status: "fail", data: null, error: "Username already exists" });
    return;
  }

  const existingEmail = await db.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ status: "fail", data: null, error: "Email already in use" });
    return;
  }

  if (phone) {
    const existingPhone = await db.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      res.status(StatusCodes.CONFLICT).json({
        status: "fail",
        data: null,
        error: "Phone number already in use",
      });
      return;
    }
  }

  const user = await db.user.create({
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
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "User not Found" });
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
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "User not Found" });
  }

  const existingUsername = await db.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ status: "fail", data: null, error: "Username already exists" });
    return;
  }

  const existingEmail = await db.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    res
      .status(StatusCodes.CONFLICT)
      .json({ status: "fail", data: null, error: "Email already in use" });
    return;
  }

  if (phone) {
    const existingPhone = await db.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      res.status(StatusCodes.CONFLICT).json({
        status: "fail",
        data: null,
        error: "Phone number already in use",
      });
      return;
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
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "User not Found" });
    return;
  }

  await db.user.delete({
    where: { id: userId },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
  });
};

export { getAllUsers, createUser, getSingleUser, updateUser, deleteUser };
