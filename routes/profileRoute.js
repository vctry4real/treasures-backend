import { express } from "express";
import { getProfileByEmail } from "../controllers/profileController";

const router = express.Router();

//get profileById
router.get("/:email", getProfileByEmail);

//update profile
router.put("/:email", getProfileByEmail);

export default router;
