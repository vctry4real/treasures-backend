import express from "express";
import { getProfileByEmail } from "../controllers/profileController.js";

const router = express.Router();

//get profileById
router.get("/:email", getProfileByEmail);

//update profile
router.put("/:email", getProfileByEmail);

export default router;
