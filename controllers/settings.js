const { genSalt, hash } = require("bcryptjs");
const { BadRequestError } = require("../errors");
const User = require("../models/User");

const ChangePassword = async (req, res) => {
  const { userId } = req.user;
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById({ _id: userId });
  if (!newPassword || !oldPassword) {
    throw new BadRequestError("Please provide the correct info");
  }
  if (newPassword.length < 8) {
    throw new BadRequestError("Password must be longer than 8 characters");
  }
  const isMatch = await user.matchPassword(oldPassword);
  if (!isMatch) {
    throw new BadRequestError("Old password does not match");
  }
  const salt = await genSalt(10);
  const cryptedPassword = await hash(newPassword, salt);
  await User.findByIdAndUpdate({ _id: userId }, { password: cryptedPassword });
  res.status(200).json({ msg: "Password Updated" });
};

const getFollowers = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findById({ _id: userId });
  res.status(200).json({ followers: user.followers });
};

const getFollowing = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findById({ _id: userId });
  res.status(200).json({ following: user.following });
};

const removeFollower = async (req, res) => {
  const { userId } = req.user;
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("Please provide name");
  }
  const user = await User.findById({ _id: userId });
  user.followers = user.followers.filter((x) => x != name);
  await user.save();
  res.status(200).json({ msg: "success" });
};

const removeFollowing = async (req, res) => {
  const { userId } = req.user;
  const { name } = req.body;
  console.log(name);

  if (!name) {
    throw new BadRequestError("Please provide name");
  }
  const user = await User.findById({ _id: userId });
  user.following = user.following.filter((x) => x != name);
  await user.save();
  const user2 = await User.findOne({ username: name });
  user2.followers = user2.followers.filter((x) => x != user.username);
  await user2.save();
  res.status(200).json({ msg: "success" });
};

module.exports = {
  ChangePassword,
  getFollowers,
  getFollowing,
  removeFollower,
  removeFollowing,
};
