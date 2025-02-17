const { BadRequestError } = require("../errors/index");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const checkAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new BadRequestError("Authorization Invalid");
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = await User.findById({ _id: payload.userId });
    req.user = { userId: payload.userId, username: username };
    next();
  } catch (error) {
    throw new BadRequestError("JWT authorization Invalid");
  }
};

module.exports = checkAuth;
