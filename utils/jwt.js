import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.SECRETE_KEY;

export const athenticateToken = (req, res, next) => {
  const accessToken = req.headers.authorization;

  if (!accessToken) return res.sendStatus(401);

  const token = accessToken.split(" ")[1];

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
};

export const authenticateUser = (userData) => {
  const accessToken = jwt.sign(userData, secretKey, {
    expiresIn: "2m",
  });
  const refreshToken = jwt.sign(userData, secretKey, {
    expiresIn: "15m",
  });

  return { accessToken, refreshToken };
};
