const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send("Access denied. Token missing.");
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).send("Invalid token.");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Invalid or expired token.");
  }
};

module.exports = authMiddleware;
