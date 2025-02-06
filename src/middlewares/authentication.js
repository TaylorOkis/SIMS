import { verifyToken } from "../utils/jwt.js";
import {
  UnauthorizedError,
  UnauthenticatedError,
} from "../utils/errors/index.js";

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new UnauthenticatedError("Authentication Invalid");
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
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Unauthorized to access this resource");
    }
    next();
  };
};

export { authenticateUser, authorizePermissions };
