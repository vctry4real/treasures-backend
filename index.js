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
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://treasuresf3h.vercel.app",
    "https://treasures-frontend.onrender.com",
    "https://treasure-backendfe.onrender.com",
  ], // Change this to your React app's origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// app.use((req, res, next) => {
//   const allowedOrigins = [
//     "http://localhost:3000",
//     "https://treasure-backendfe.onrender.com",
//   ];
//   const origin = req.headers.origin;

//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//   }

//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   next();
// });
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/jwt", jwtRoutes);
app.use("/profile", athenticateToken, profileRoute);

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
