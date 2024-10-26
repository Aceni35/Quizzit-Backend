const { BadRequestError } = require("../errors/index");
const User = require("../models/User");

const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new BadRequestError("please provide all the credentials");
  }
  const exists = await User.findOne({ username: username });
  if (exists != null) {
    throw new BadRequestError("please provide a unique username");
  }
  const newUser = await User.create({ username, password });
  const token = newUser.createJWT();
  res.status(201).json({ username, token });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new BadRequestError("please provide all the credentials");
  }
  const user = await User.findOne({ username: username });
  if (!user) {
    throw new BadRequestError("please provide correct credentials");
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new BadRequestError("please provide correct password");
  }
  const token = user.createJWT();
  res.status(200).json({ username, token });
};

module.exports = { register, login };
