import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user-router.js";
import categoryRouter from "./routes/category-router.js";
import productRouter from "./routes/product-router.js";
import itemRouter from "./routes/item-router.js";
import orderRouter from "./routes/order-router.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("App is running perfectly");
});

app.use("/users", userRouter);
app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/items", itemRouter);
app.use("/orders", orderRouter);

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
