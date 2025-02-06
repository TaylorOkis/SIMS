import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "../utils/errors/index.js";

const errorHandler = (error, req, res, next) => {
  let customerror = {
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    status: "fail",
    error: error.message || "Something went wrong, please try again later",
  };

  res
    .status(customerror.statusCode)
    .json({ status: customerror.status, error: customerror.error });
};

export default errorHandler;
