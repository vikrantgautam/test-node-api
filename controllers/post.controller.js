const { Post } = require("../models/post");
const { User } = require("../models/user");

const addPost = async (req, res) => {
  try {
    const { id, caption, uploadTime } = req.body;

    const existingUser = await User.findOne({
      _id: id,
    });

    if (!existingUser) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: "User does not exist.",
      });
    }

    const url = req.protocol + "://" + req.get("host");
    const images = req.files.map((file) => ({
      path: req.body.image != "" ? url + "/images/" + file.filename : "",
      filename: file.filename,
    }));

    const newPost = new Post({
      image: images,
      caption: caption,
      uploadedById: id,
      uploadedByUsername: existingUser.username,
      uploadedByName: existingUser.name,
      uploadedByAvatar: existingUser.profilePic,
      uploadTime: uploadTime,
    });

    newPost.save();

    const currentUser = await User.findById(req.body.id);
    currentUser.userPosts.push(newPost);
    await currentUser.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "Posted successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const viewPosts = async (req, res) => {
  try {
    req.params.username = req.params.username.toLowerCase();

    const existingUser = await User.findOne({
      username: req.params.username,
    });
    if (!existingUser) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: "User does not exist.",
      });
    }

    const user = await User.findById(existingUser._id);
    if (!user) {
      return res.status(404).json({ message: `User not found.` });
    }

    // Get the IDs of the users the current user follows
    const followingIds = existingUser.following.map((user) => user._id);

    // Find posts created by the users the current user follows
    const posts = await Post.find({ uploadedById: { $in: followingIds } }).sort(
      "-createdAt"
    );

    const formattedPosts = posts.map((post) => ({
      _id: post._id,
      caption: post.caption,
      uploadTime: post.uploadTime,
      uploadedById: post.uploadedById,
      uploadedByName: post.uploadedByName,
      uploadedByUsername: post.uploadedByUsername,
      uploadedByAvatar: post.uploadedByAvatar,
      image: post.image,
      likes: post.likes,
      comments: post.comments,
    }));

    res.status(200).json({
      Data: formattedPosts,
      Success: true,
      message: "Executed successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the post by ID
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Update the post properties
    post.caption = req.body.caption;

    // Save the updated post
    const updatedPost = await post.save();
    res.status(200).json({
      Data: "",
      Success: true,
      message: "Post updated successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Post.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: `Post not found.` });
    }
    res.status(200).json({
      Data: "",
      Success: true,
      message: "Post deleted successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { postId } = req.params;
    const { imageId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Iterate over the imageIds array and remove the corresponding images from the post's image array
    imageId.forEach((id) => {
      const imageIndex = post.image.findIndex(
        (image) => image._id.toString() === id
      );

      if (imageIndex !== -1) {
        post.image.splice(imageIndex, 1);
      }
    });

    // Save the updated post
    await post.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "Image deleted successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const likeIndex = post.likes.users.findIndex(
      (user) => user._id.toString() === userId
    );

    if (likeIndex !== -1) {
      // User has already liked the post, so unlike it
      post.likes.users.splice(likeIndex, 1);
      post.likes.count = post.likes.users.length;
    } else {
      // User is liking the post,isLiked add their like
      post.likes.users.push(userId);
      post.likes.count = post.likes.users.length;
    }

    // Save the updated post
    await post.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "Executed successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const addComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { commentText, commentedByUserId, commentUploadTime } = req.body;

    const user = await User.findById(commentedByUserId);
    if (!user) {
      return res.status(404).json({ message: `User not found.` });
    }

    const commentedByUsername = user.username;
    const commentedByName = user.name;
    const commentedByAvatar = user.profilePic;

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create the new comment
    const newComment = {
      commentText,
      commentedByUserId,
      commentedByUsername,
      commentedByAvatar,
      commentedByName,
      commentUploadTime,
    };

    // Add the comment to the post
    post.comments.comments.push(newComment);
    post.comments.commentsCount++;

    // Save the updated post
    await post.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "Comment added successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const updateComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { commentText, commentId, commentUpdateTime } = req.body;

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the comment to be edited
    const comment = post.comments.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Update the comment text
    comment.commentText = commentText;
    comment.isEdited = true;
    comment.commentUpdateTime = commentUpdateTime;

    // Save the updated post
    await post.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "Comment updated successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the index of the comment in the comments array
    const commentIndex = post.comments.comments.findIndex((comment) =>
      comment._id.equals(commentId)
    );

    if (commentIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const comment = post.comments.comments[commentIndex];

    // Decrement the repliesCount for the parent comment
    const repliesCount = comment.replies.repliesCount;
    post.comments.commentsCount -= repliesCount + 1;

    // Remove the comment from the comments array
    post.comments.comments.splice(commentIndex, 1);

    post.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "Comment deleted successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const addReply = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { commentText, commentedByUserId, commentUploadTime } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.comments.find(
      (comment) => comment._id.toString() === commentId
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const user = await User.findById(commentedByUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const commentedByAvatar = user.profilePic;
    const commentedByName = user.name;
    const commentedByUsername = user.username;

    const newReply = {
      commentText,
      commentedByUserId,
      commentedByUsername,
      commentedByAvatar,
      commentedByName,
      commentUploadTime,
    };

    comment.replies.replies.push(newReply);
    comment.replies.repliesCount++;
    // Increment the commentsCount
    post.comments.commentsCount++;

    await post.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "Reply added successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.comments.find(
      (comment) => comment._id.toString() === commentId
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const replyIndex = comment.replies.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Remove the reply from the replies array
    comment.replies.replies.splice(replyIndex, 1);

    // Decrement the repliesCount
    comment.replies.repliesCount--;

    post.comments.commentsCount--;

    await post.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "Reply deleted successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const likeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.comments.find(
      (comment) => comment._id.toString() === commentId
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user has already liked the post
    const likeIndex = comment.likes.users.findIndex(
      (user) => user._id.toString() === userId
    );

    if (likeIndex !== -1) {
      // User has already liked the comment, so unlike it
      comment.likes.users.splice(likeIndex, 1);
      comment.likes.count = comment.likes.users.length;
    } else {
      // User is liking the comment,isLiked add their like
      comment.likes.users.push(userId);
      comment.likes.count = comment.likes.users.length;
    }

    // Save the updated post
    await post.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "Executed successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const likeReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.comments.find(
      (comment) => comment._id.toString() === commentId
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = comment.replies.replies.find(
      (reply) => reply._id.toString() === replyId
    );
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check if the user has already liked the post
    const likeIndex = reply.likes.users.findIndex(
      (user) => user._id.toString() === userId
    );

    if (likeIndex !== -1) {
      // User has already liked the reply, so unlike it
      reply.likes.users.splice(likeIndex, 1);
      reply.likes.count = reply.likes.users.length;
    } else {
      // User is liking the reply,isLiked add their like
      reply.likes.users.push(userId);
      reply.likes.count = reply.likes.users.length;
    }

    // Save the updated post
    await post.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "Executed successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

module.exports = {
  addPost,
  viewPosts,
  updatePost,
  deletePost,
  deleteImage,
  likePost,
  addComment,
  updateComment,
  deleteComment,
  addReply,
  deleteReply,
  likeComment,
  likeReply,
};
