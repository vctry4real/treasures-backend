import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { athenticateToken } from "./utils/jwt.js";
import authRoutes from "./routes/authRoutes.js";
import jwtRoutes from "./routes/jwtRoutes.js";
import profileRoute from "./routes/profileRoute.js";
import connectToDb from "./mongodb/db.js";
const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/jwt", jwtRoutes);
app.use("/profile", profileRoute);

app.get("/", athenticateToken, (req, res) => {
  console.log("Hello world");
  res.status(200).json();
});

const PORT = process.env.PORT || 5000;

connectToDb((err) => {
  if (!err) {
    console.log("Database connected...");
    app.listen(PORT, () => console.log("Server started on " + PORT));
  } else {
    console.error("Error connecting to DB!!");
  }
});
