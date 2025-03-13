import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { BadRequestError, NotFoundError } from "../utils/errors/index.js";
import paginate from "../utils/pagination.js";

const initialAdminSetup = async (req, res) => {
  const existingAdmin = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (existingAdmin) {
    throw new BadRequestError("An admin account already exists");
  }
  const {
    username,
    firstname,
    lastname,
    password,
    email,
    phone,
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
      role: "ADMIN",
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
    take: Number(req.query.limit) || 15,
    skip: paginate(req.query.page, req.query.limit),
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
    select: { username: true, email: true, phone: true },
  });
  if (!existingUser) {
    throw new NotFoundError("User not Found");
  }

  if (username !== existingUser.username) {
    const existingUsername = await db.user.findUnique({
      where: { username },
      select: { username: true },
    });
    if (existingUsername) {
      throw new BadRequestError("Username already exists");
    }
  }

  if (email !== existingUser.email) {
    const existingEmail = await db.user.findUnique({
      where: { email },
      select: { email: true },
    });
    if (existingEmail) {
      throw new BadRequestError("Email already in use");
    }
  }

  if (phone && phone !== existingUser.phone) {
    const existingPhone = await db.user.findUnique({
      where: { phone },
      select: { phone: true },
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
  initialAdminSetup,
};
