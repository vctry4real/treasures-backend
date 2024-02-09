import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.SECRETE_KEY;

export const athenticateToken = (req, res, next) => {
  const accessToken = req.session.accessToken;

  if (!accessToken) return res.sendStatus(401);

  jwt.verify(accessToken, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
};

export const authenticateUser = (req, userData) => {
  const accessToken = jwt.sign(userData, secretKey, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(userData, secretKey);

  req.session.refreshToken = refreshToken;
  req.session.accessToken = accessToken;

  return { accessToken, refreshToken };
};
