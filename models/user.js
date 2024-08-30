const mongoose = require("mongoose");
const Joi = require("joi");
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    joinedTime: { type: String },
    profilePic: {
      type: String,
    },
    backgroundPic: {
      type: String,
    },
    bio: {
      type: String,
    },
    website: {
      type: String,
    },
    isFollowing: {
      type: Boolean,
    },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    userPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  },
  {
    timestamps: true,
  }
);

function validateSignUp(user) {
  const schema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    joinedTime: Joi.string().required(),
  });
  return schema.validate(user);
}

function validateLogIn(user) {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  return schema.validate(user);
}

const User = mongoose.model("User", userSchema);
module.exports = {
  User,
  validateSignUp,
  validateLogIn,
};
