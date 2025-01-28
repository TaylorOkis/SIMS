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

  // TODO: All necessary checks before creating

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

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  // TODO: All necessary checks

  res.status(StatusCodes.OK).json({
    status: "success",
    data: user,
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

  // TODO: All necessary checks before updating

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

  // TODO: All necessary checks before deleting

  await db.user.delete({
    where: { id: userId },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
  });
};

export { getAllUsers, createUser, getSingleUser, updateUser, deleteUser };
