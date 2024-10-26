const { BadRequestError } = require("../errors");
const Post = require("../models/Post");
const Quiz = require("../models/Quiz");
const User = require("../models/User");

const getSingleQuiz = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    throw new BadRequestError("please provide quiz id");
  }
  const quiz = await Quiz.findById({ _id: id });
  if (!quiz) {
    throw new BadRequestError("Quiz does not exist");
  }
  res.status(200).json({ quiz });
};

const textPost = async (req, res) => {
  const { postType, postText } = req.body;
  const { username } = req.user;
  if (!postType || !postText) {
    throw new BadRequestError("please provide the needed info");
  }
  if (postText.length < 5 || postText.length > 100) {
    throw new BadRequestError(
      "please provide a text that is less than 100 characters but more then 5"
    );
  }
  const date = new Date();
  const created = `${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()}`;
  const newPost = await Post.create({
    from: username,
    postText,
    postType,
    date: created,
  });
  res.status(201).json({ newPost });
};

const postQuiz = async (req, res) => {
  const { questions, info, completed } = req.body;
  const { username } = req.user;
  if (!questions || !info) {
    throw new BadRequestError("please provide the needed info");
  }
  const newQuiz = await Quiz.create({
    name: info.name,
    questions,
    info,
    from: username,
    completed,
  });
  if (completed) {
    const date = new Date();
    const created = `${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}`;
    const newPost = await Post.create({
      postType: "quiz",
      from: username,
      date: created,
      postText: info.desc,
      quizId: newQuiz._id,
    });
  }
  res.status(201).json({ newQuiz });
};

const deleteQuiz = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    throw new BadRequestError("please provide quiz id");
  }
  await Quiz.findByIdAndRemove({ _id: id });
  await Post.findOneAndDelete({ quizId: id });
  res.status(204).json({ success: true });
};

const getFyp = async (req, res) => {
  const { username, userId } = req.user;
  const { count } = req.query;
  const number = Number(count);
  let canLoadMore;
  const user = await User.findOne({ username });
  const following = user.following.map((f) => f.username);
  let posts = await Post.find({});
  const giveLike = (arr) =>
    arr.map((post) => {
      const { _doc: info } = post;
      if (post.likes.includes(userId)) {
        return { ...info, hasLiked: true };
      } else {
        return { ...info, hasLiked: false };
      }
    });
  if (following.length === 0) {
    canLoadMore = posts.length > number * 10 + 10 ? true : false;
    posts = posts.reverse().slice(number * 10, number * 10 + 10);
    posts = giveLike(posts);
    res.status(200).json({ posts, canLoadMore });
    return;
  }
  let yourPosts = posts.filter((p) => {
    if (following.includes(p.username)) {
      return p;
    }
  });
  canLoadMore = yourPosts.length > number * 10 + 10 ? true : false;
  yourPosts = yourPosts.reverse().slice(number * 10, number * 10 + 10);
  yourPosts = giveLike(yourPosts);
  res.status(200).json({ posts: yourPosts, canLoadMore });
};

const likePost = async (req, res) => {
  const { id: postId } = req.body;
  const { userId } = req.user;
  const newPost = await Post.findOne({ _id: postId });
  let newLikes;
  const hasLiked = newPost.likes.includes(userId);
  if (hasLiked) {
    newLikes = newPost.likes.filter((like) => like != userId);
  } else {
    newLikes = [...newPost.likes, userId];
  }
  newPost.likes = newLikes;
  await newPost.save();
  res.status(201).json({ success: true, newPost, hasLiked: !hasLiked });
};

const commentPost = async (req, res) => {
  const { comment, postId } = req.body;
  const { username } = req.user;
  if (!comment) {
    throw new BadRequestError("Please provide the comment");
  }
  const post = await Post.findOne({ _id: postId });
  post.comments = [...post.comments, { from: username, text: comment }];
  await post.save();
  res.status(201).json({ post });
};

const getUserQuizzes = async (req, res) => {
  const { username } = req.user;
  const quizzes = await Quiz.find({ from: username });
  res.status(200).json({ quizzes });
};

const sendPlay = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    throw new BadRequestError("please provide quiz id");
  }
  const quiz = await Quiz.findById({ _id: id });
  quiz.played = quiz.played + 1;
  await quiz.save();
  res.status(201).json({ success: true });
};

const updateQuiz = async (req, res) => {
  const { questions, info, completed, id } = req.body;
  const { username } = req.user;
  if (!questions || !info) {
    throw new BadRequestError("please provide the needed info");
  }
  const oldQuiz = await Quiz.findOne({ _id: id });
  const newQuiz = await Quiz.findOneAndUpdate(
    { _id: id },
    {
      questions,
      info,
      name: info.name,
      completed,
    },
    {
      new: true,
    }
  );
  if (!oldQuiz.completed && completed) {
    const date = new Date();
    const created = `${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}`;
    const newPost = await Post.create({
      postType: "quiz",
      from: username,
      date: created,
    });
  }
  res.status(201).json({ newQuiz });
};

module.exports = {
  textPost,
  postQuiz,
  getFyp,
  likePost,
  commentPost,
  getUserQuizzes,
  updateQuiz,
  getSingleQuiz,
  deleteQuiz,
  sendPlay,
};
