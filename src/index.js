import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user-router.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("App is running perfectly");
});

app.use("/users", userRouter);

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
