const Post = require("../models/Post");
const Quiz = require("../models/Quiz");
const User = require("../models/User");

const search = async (req, res) => {
  const { topic: term } = req.query;
  const { username: name } = req.user;
  let users = await User.find({
    username: { $regex: new RegExp(term, "i") },
  });
  users = users.filter((user) => user.username != name);
  const quizzes = await Quiz.find({
    name: { $regex: new RegExp(term, "i") },
    completed: true,
  });
  res.status(200).json({ users, quizzes });
};

const loadProfile = async (req, res) => {
  const { name, count } = req.query;
  const number = Number(count);
  const { username, userId } = req.user;
  if (!name) {
    throw new BadRequestError("please provide user name");
  }
  const giveLike = (arr) =>
    arr.map((post) => {
      const { _doc: info } = post;
      if (post.likes.includes(userId)) {
        return { ...info, hasLiked: true };
      } else {
        return { ...info, hasLiked: false };
      }
    });
  const userProfile = await User.findOne({ username: name });
  let noPosts = await Post.find({ from: name });
  const canLoadMore = noPosts.length > number * 10 + 10 ? true : false;
  noPosts = noPosts.reverse().splice(10 * number, number * 10 + 10);
  const userPosts = giveLike(noPosts);
  res.status(201).json({ userProfile, userPosts, username, canLoadMore });
};

const follow = async (req, res) => {
  const { username } = req.user;
  const { user } = req.body;
  const user1 = await User.findOne({ username });
  const user2 = await User.findOne({ username: user });
  if (user1.following.includes(user)) {
    user1.following = user1.following.filter((x) => x != user);
    user2.followers = user2.followers.filter((x) => x != username);
    await user1.save();
    await user2.save();
  } else {
    user1.following = [...user1.following, user];
    user2.followers = [...user2.followers, username];
    await user1.save();
    await user2.save();
  }
  res
    .status(201)
    .json({ newFollowers1: user1.following, newFollowers2: user2.followers });
};

module.exports = { search, loadProfile, follow };
