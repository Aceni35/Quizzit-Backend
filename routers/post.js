const express = require("express");
const {
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
} = require("../controllers/post");
const router = express.Router();

router.route("/textPost").post(textPost);
router.route("/quizPost").post(postQuiz);
router.route("/likePost").post(likePost);
router.route("/comment").post(commentPost);
router.route("/getFyp").get(getFyp);
router.route("/getQuizzes").get(getUserQuizzes);
router.route("/updateQuiz").patch(updateQuiz);
router.route("/getSingleQuiz").get(getSingleQuiz);
router.route("/deleteQuiz").delete(deleteQuiz);
router.route("/sendPlay").patch(sendPlay);

module.exports = router;
