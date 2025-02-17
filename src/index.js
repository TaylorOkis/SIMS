import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import xss from "xss";
import helmet from "helmet";
import "express-async-errors";

import userRouter from "./routes/user-router.js";
import categoryRouter from "./routes/category-router.js";
import productRouter from "./routes/product-router.js";
import itemRouter from "./routes/item-router.js";
import orderRouter from "./routes/order-router.js";
import saleRouter from "./routes/sale-router.js";
import authRouter from "./routes/auth-router.js";
import notFound from "./middlewares/not-found.js";
import errorHandler from "./middlewares/error-handler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use(express.json());
app.use(helmet());
app.use(limiter);
app.use(cors());
app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SECRET));

app.get("/", (req, res) => {
  res.send("App is running perfectly");
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/items", itemRouter);
app.use("/orders", orderRouter);
app.use("/sales", saleRouter);
app.use(notFound);
app.use(errorHandler);

const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`App is running on port ${PORT}...`);
    });
  } catch (error) {
    console.log(
      `An error occurred while starting application.\n Error: ${error}`
    );
  }
};

start();
