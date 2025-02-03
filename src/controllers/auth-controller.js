import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";
import { attachCookiesToResponse } from "../utils/jwt.js";
import bcrypt from "bcryptjs";

const login = async (req, res) => {
  const { username, email, password } = req.body;
  let existingUser;
  const errorMessage = "Wrong Username or Password";

  if (username) {
    existingUser = db.user.findUnique({ where: { username } });
  }

  if (email) {
    existingUser = db.user.findUnique({ where: { email } });
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

export { login, logOut };
