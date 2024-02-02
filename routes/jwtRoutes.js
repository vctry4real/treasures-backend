import express from "express";

const router = express.Router();

router.post("/refreshToken", (req, res) => {
  const refreshToken = req.session.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  const secretKey = process.env.SECRETE_KEY;

  jwt.verify(refreshToken, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    const newAccessToken = jwt.sign(user, secretKey, { expiresIn: "15m" });
    req.session.accessToken = newAccessToken;

    res.json({ accessToken: newAccessToken });
  });
});

export default router;
