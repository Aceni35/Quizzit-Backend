const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { genSalt, hash, compare } = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [6, "username requires a minimum of 4 letters or numbers"],
    maxlength: [13, "username requires a maximum of 8 letters or numbers"],
  },
  password: {
    type: String,
    required: true,
  },
  followers: {
    type: Array,
    default: [],
  },
  following: {
    type: Array,
    default: [],
  },
  quizzes: {
    type: Number,
    default: 0,
  },
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

UserSchema.methods.matchPassword = async function (candidate) {
  const isMatch = await compare(candidate, this.password);
  return isMatch;
};

UserSchema.pre("save", async function () {
  const salt = await genSalt(10);
  const crypted = await hash(this.password, salt);
  this.password = crypted;
});

module.exports = mongoose.model("User", UserSchema);
