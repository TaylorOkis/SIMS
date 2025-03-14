import CustomAPIError from "./custom-api-error.js";
import { StatusCodes } from "http-status-codes";

class NotImplementedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_IMPLEMENTED;
  }
}

export default NotImplementedError;
