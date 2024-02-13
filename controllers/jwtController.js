import jwt from "jsonwebtoken";

const secretKey = process.env.SECRETE_KEY;

export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    const { exp, iat, ...userData } = user;
    const newAccessToken = jwt.sign(userData, secretKey, {
      expiresIn: "2m",
    });
    res.json({ accessToken: newAccessToken });
  });
};
