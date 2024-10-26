const mongoose = require("mongoose");

const partySchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
  },
  players: {
    type: Array,
    default: [],
  },
  code: {
    type: String,
    required: true,
  },
  started: {
    type: Boolean,
    default: false,
  },
  gameId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Party", partySchema);
