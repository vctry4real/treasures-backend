import express from "express";
import mongoose from "mongoose";
import verifySocialAuth from "../utils/googleAuth.js";
import { authenticateUser } from "../utils/jwt.js";
import USER from "../mongodb/userSchema.js";
import PROFILE from "../mongodb/profileSchema.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { check, validationResult } from "express-validator";

dotenv.config();
const router = express.Router();

router.post("/google", async (req, res) => {
  const { credential } = req.body;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const {
        isValidIss,
        isValidAud,
        isEmailVerified,
        isTokenNotExpired,
        payload,
      } = await verifySocialAuth(credential, process.env.CLIENT_ID);

      // Perform the checks
      if (
        !isValidIss ||
        !isValidAud ||
        !isEmailVerified ||
        !isTokenNotExpired
      ) {
        console.error("Token is not valid.");

        return res.sendStatus(401);
      }

      //check if user already exists
      const userExists = await USER.userExist(payload.email);

      if (userExists) {
        //proceed to create session

        console.log("exists");
        const { _id, __v, ...userData } = userExists;

        const { accessToken, refreshToken } = authenticateUser(req, userData);

        return res.status(200).json({ accessToken, refreshToken });
      } else {
        //add user to document

        const newUser = await USER.createUser({
          email: payload.email,
          fullName: payload.name,
          authProvider: "google",
        });
        newUser.save({ session });
        await PROFILE.createProfile({
          email: newUser.email,
          fullName: newUser.fullName,
          user: newUser._id,
        });

        console.log("User added: ", newUser);

        const { _id, __v, ...userData } = newUser.toObject();
        const { accessToken, refreshToken } = authenticateUser(req, userData);

        return res
          .status(201)
          .json({ msg: "User Authenticated!", accessToken, refreshToken });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.endSession();
  }
});

router.post("/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    console.error("Email and password is required!");
    return res.status(401).json({ msg: "Email and password is required!" });
  }
  const session = await mongoose.startSession();

  try {
    //check if user already exists
    const userExists = await USER.userExist(email);
    if (userExists) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    console.log(userExists);
    await session.withTransaction(async () => {
      // Hash the password before storing it
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      //add user to document
      const newUser = await USER.createUser({
        email,
        fullName,
        password: hashPassword,
      });

      newUser.save({ session });
      await PROFILE.createProfile({
        email: newUser.email,
        fullName: newUser.fullName,
        user: newUser._id,
      });

      console.log("User added: ", newUser);
      const { _id, __v, ...userData } = newUser.toObject();
      const { accessToken, refreshToken } = authenticateUser(req, userData);

      return res.status(201).json({ accessToken, refreshToken });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.error("Email and password is required!");

    return res.status(401).json({ msg: "Email and password is required!" });
  }

  try {
    //check if user already exists
    const userExists = await USER.userExist(email);
    if (!userExists || !userExists.password) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Compare the entered password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, userExists.password);

    if (!passwordMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    console.log(userExists);
    const { _id, __v, ...userData } = userExists;
    const { accessToken, refreshToken } = authenticateUser(req, userData);

    return res
      .status(200)
      .json({ msg: "User Authenticated!", accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});
export default router;
