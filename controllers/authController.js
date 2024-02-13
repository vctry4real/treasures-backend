import mongoose from "mongoose";
import verifySocialAuth from "../utils/googleAuth.js";
import { authenticateUser } from "../utils/jwt.js";
import bcrypt from "bcrypt";
import USER from "../mongodb/userSchema.js";
import PROFILE from "../mongodb/profileSchema.js";

import { check, validationResult } from "express-validator";

export const googleAuth = async (req, res) => {
  const { credential, registrationData } = req.body;
  console.log("registrationData", registrationData);
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

        const { _id, __v, exp, authProvider, createdAt, ...userData } =
          userExists.toObject();

        const { accessToken, refreshToken } = authenticateUser(userData);
        console.log("exists");

        return res.status(200).json({
          msg: "User Authenticated!",
          accessToken,
          refreshToken,
          ...userData,
        });
      } else {
        //add user to document
        const newUser = await USER.createUser({
          email: payload.email,
          firstName: payload.given_name,
          lastName: payload.family_name,
          authProvider: "google",
        });
        newUser.save({ session });
        await PROFILE.createProfile({
          email: newUser.email,
          fullName: `${newUser.firstName} ${newUser.lastName}`,
        });

        console.log("User added: ", newUser);

        const { _id, __v, exp, authProvider, createdAt, ...userData } =
          newUser.toObject();
        const { accessToken, refreshToken } = authenticateUser(userData);

        return res.status(201).json({
          msg: "User Created!",
          ...userData,
          accessToken,
          refreshToken,
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.endSession();
  }
};

export const signup = async (req, res) => {
  const {
    email: inputEmail,
    password: inputPassword,
    firstName,
    lastName,
  } = req.body;

  if (!inputEmail || !inputPassword || !firstName || !lastName) {
    console.error("Email and password is required!");
    return res.status(401).json({ msg: "Email and password is required!" });
  }
  const session = await mongoose.startSession();

  try {
    //check if user already exists
    const userExists = await USER.userExist(inputEmail);
    if (userExists) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    await session.withTransaction(async () => {
      // Hash the password before storing it
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(inputPassword, salt);

      //add user to document
      const newUser = await USER.createUser({
        email: inputEmail,
        firstName,
        lastName,
        password: hashPassword,
      });

      newUser.save({ session });
      await PROFILE.createProfile({
        email: newUser.email,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
      });

      console.log("User added: ", newUser);
      const { _id, __v, password, ...userData } = newUser.toObject();
      const { accessToken, refreshToken } = authenticateUser(userData);

      return res.status(201).json({ msg: "User Created!" });
      // .json({ accessToken, refreshToken });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  } finally {
    session.endSession();
  }
};

export const signin = async (req, res) => {
  const { email: inputEmail, password: inputPassword } = req.body;

  if (!inputEmail || !inputPassword) {
    console.error("Email and password is required!");

    return res.status(401).json({ msg: "Email and password is required!" });
  }

  try {
    //check if user already exists
    const userExists = await USER.userExist(inputEmail);
    if (!userExists || !userExists.password) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Compare the entered password with the stored hashed password
    const passwordMatch = await bcrypt.compare(
      inputPassword,
      userExists.password
    );

    if (!passwordMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const { _id, __v, password, ...userData } = userExists.toObject();

    const { accessToken, refreshToken } = authenticateUser(userData);

    return res.status(200).json({
      msg: "User Authenticated!",
      ...userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
