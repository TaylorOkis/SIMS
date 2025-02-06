import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";

import { attachCookiesToResponse } from "../utils/jwt.js";
import sendEmail from "../services/email-service.js";
import generateEmail from "../utils/email-template.js";
import {
  NotFoundError,
  UnauthenticatedError,
  NotImplementedError,
} from "../utils/errors/index.js";

const generateToken = () => {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const login = async (req, res) => {
  const { username, email, password } = req.body;
  let existingUser;
  const errorMessage = "Wrong Username or Password";

  if (username) {
    existingUser = await db.user.findUnique({ where: { username } });
  }

  if (email) {
    existingUser = await db.user.findUnique({ where: { email } });
  }

  if (!existingUser) {
    throw new UnauthenticatedError(errorMessage);
  }

  const passwordMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordMatch) {
    throw new UnauthenticatedError(errorMessage);
  }

  const { password: savedPassword, ...tokenUser } = existingUser;
  attachCookiesToResponse({ res, user: tokenUser });

  res
    .status(StatusCodes.OK)
    .json({ status: "success", data: tokenUser, error: null });
};

const logOut = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 3 * 1000),
  });

  res.status(StatusCodes.OK).json({ status: "success" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const existingUser = await db.user.findUnique({
    where: { email },
  });
  if (!existingUser) {
    throw new NotFoundError("User not Found");
  }

  const resetToken = generateToken().toString();
  const fifTeenMinutes = 1000 * 60 * 15;
  const resetTokenExpiry = new Date(Date.now() + fifTeenMinutes);

  await db.user.update({
    where: { email },
    data: { resetToken, resetTokenExpiry },
  });

  const emailHtml = generateEmail(resetToken);

  const emailSent = await sendEmail(email, emailHtml);

  console.log(emailSent);

  if (!emailSent) {
    throw new NotImplementedError("Email not sent, an error occurred");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: `Email sent Successfully to ${email}`,
    error: null,
  });
};

const verifyResetToken = async (req, res) => {
  const { email, resetToken } = req.body;

  const existingUser = await db.user.findUnique({
    where: { email, resetToken, resetTokenExpiry: { gte: new Date() } },
  });

  if (!existingUser) {
    throw new NotFoundError("Invalid User or Token");
  }

  res.status(StatusCodes.OK).json({ status: "success" });
};

const changePassword = async (req, res) => {
  const { newPassword, resetToken, email } = req.body;

  const existingUser = await db.user.findUnique({
    where: { email, resetToken, resetTokenExpiry: { gte: new Date() } },
  });

  if (!existingUser) {
    throw new NotFoundError("Invalid or Expired Token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  res.status(StatusCodes.OK).json({ status: "success" });
};

export { login, logOut, forgotPassword, verifyResetToken, changePassword };
