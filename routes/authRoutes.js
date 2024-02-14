import express from "express";

import { googleAuth, signin, signup } from "../controllers/authController.js";

const router = express.Router();

router.post("/google", googleAuth);

router.post("/signup", signup);

router.post("/signin", signin);
export default router;
