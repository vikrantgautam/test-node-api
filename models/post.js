const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  path: { type: String },
  filename: { type: String },
});

const replySchema = new mongoose.Schema(
  {
    commentText: { type: String, required: true },
    commentedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentedByUsername: { type: String },
    commentedByAvatar: { type: String },
    commentedByName: { type: String },
    commentUploadTime: { type: String, required: true },
    commentUpdateTime: { type: String, default: "" },
    isEdited: { type: Boolean, default: false },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likes: {
      users: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          likedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    commentText: { type: String, required: true },
    commentedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentedByUsername: { type: String },
    commentedByAvatar: { type: String },
    commentedByName: { type: String },
    commentUploadTime: { type: String, required: true },
    commentUpdateTime: { type: String, default: "" },
    isEdited: { type: Boolean, default: false },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replies: {
      replies: [replySchema],
      repliesCount: {
        type: Number,
        default: 0,
      },
    },
    likes: {
      users: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          likedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

const postSchema = mongoose.Schema(
  {
    image: [imageSchema],
    caption: { type: String },
    likes: {
      users: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          likedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      count: {
        type: Number,
        default: 0,
      },
    },
    comments: {
      comments: [commentSchema],
      commentsCount: {
        type: Number,
        default: 0,
      },
    },
    uploadTime: { type: String },
    uploadedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedByUsername: { type: String },
    uploadedByName: { type: String },
    uploadedByAvatar: { type: String },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
module.exports = {
  Post,
};
