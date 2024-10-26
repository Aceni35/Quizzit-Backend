const express = require("express");
const {
  createParty,
  getParty,
  recordPlay,
  getPlayRecords,
} = require("../controllers/play");
const router = express.Router();

router.route("/createParty").post(createParty);
router.route("/getParty").post(getParty);
router.route("/leaveParty").post(getParty);
router.route("/recordPlay").post(recordPlay).get(getPlayRecords);

module.exports = router;
