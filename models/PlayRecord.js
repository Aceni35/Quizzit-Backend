const mongoose = require("mongoose");

const playRecordSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
  playerId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("playRecord", playRecordSchema);
