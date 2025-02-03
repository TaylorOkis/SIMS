import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt.js";

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "fail", error: "Authentication Invalid" });
  }

  try {
    const payload = verifyToken({ token });
    req.user = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch (error) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "fail", error: "Authentication Invalid" });
  }
};

export { authenticateUser };
