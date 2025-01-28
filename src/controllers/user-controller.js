import db from "../database/db.js";
import { StatusCodes } from "http-status-codes";

const getAllUsers = async (req, res) => {
  const users = db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: users,
    error: null,
  });
};

export { getAllUsers };
