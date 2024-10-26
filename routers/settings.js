const express = require("express");
const {
  ChangePassword,
  getFollowers,
  getFollowing,
  removeFollower,
  removeFollowing,
} = require("../controllers/settings");
const router = express.Router();

router.route("/changePassword").post(ChangePassword);
router.route("/getFollowers").get(getFollowers);
router.route("/getFollowing").get(getFollowing);
router.route("/removeFollower").post(removeFollower);
router.route("/removeFollowing").post(removeFollowing);

module.exports = router;
