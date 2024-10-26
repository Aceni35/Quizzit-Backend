const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: "UnNamed quizz",
  },
  from: {
    type: String,
    required: true,
  },
  info: {
    type: Object,
    required: true,
  },
  played: {
    type: Number,
    default: 0,
  },
  questions: {
    type: Array,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Quiz", QuizSchema);
