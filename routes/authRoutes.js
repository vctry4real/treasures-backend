import express from "express";

import { googleAuth, signin, signup } from "../controllers/authController.js";

const router = express.Router();

router.get("/google/callback", (req, res) => {
  res.status(200).send("Hello google");
});
router.post("/google", googleAuth);

router.post("/signup", signup);

// router.post("/signin", signin);
export default router;
