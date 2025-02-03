import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";
import { attachCookiesToResponse } from "../utils/jwt.js";
import bcrypt from "bcryptjs";

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
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "fail", data: null, error: errorMessage });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordMatch) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "fail", data: null, error: errorMessage });
    return;
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
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const existingUser = await db.user.findUnique({
    where: { email },
  });
  if (!existingUser) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: "fail", data: null, error: "User Not Found" });
    return;
  }

  const resetToken = generateToken().toString();
  const fifTeenMinutes = 1000 * 60 * 15;
  const resetTokenExpiry = new Date(Date.now() + fifTeenMinutes);
  const currentTime = new Date(Date.now());

  res.status(StatusCodes.OK).json({
    status: "success",
    data: { resetToken, resetTokenExpiry, currentTime },
    error: null,
  });
};

export { login, logOut, forgotPassword };
