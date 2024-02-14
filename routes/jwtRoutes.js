import express from "express";
import { refreshToken } from "../controllers/jwtController.js";

const router = express.Router();

router.post("/refreshToken", refreshToken);

export default router;
