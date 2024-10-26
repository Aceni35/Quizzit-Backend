const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  postType: {
    type: String,
    required: true,
  },
  postText: {
    type: String,
    default: "",
  },
  from: {
    type: String,
    required: true,
  },
  likes: {
    type: Array,
    default: [],
  },
  comments: {
    type: Array,
  },
  date: {
    type: String,
    required: true,
  },
  quizId: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Post", postSchema);
