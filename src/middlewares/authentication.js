import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt.js";

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "fail", error: "Authentication Invalid" });
    return;
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

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(StatusCodes.FORBIDDEN).json({
        status: "fail",
        error: "Unauthorized to access this resource",
      });
      return;
    }
    next();
  };
};

export { authenticateUser, authorizePermissions };
