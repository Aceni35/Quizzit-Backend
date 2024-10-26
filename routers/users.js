const express = require("express");

const router = express.Router();
const { loadProfile, search, follow } = require("../controllers/users");

router.route("/loadProfile").get(loadProfile);
router.route("/search").get(search);
router.route("/follow").post(follow);

module.exports = router;
