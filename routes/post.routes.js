const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post.controller");
const { checkAuth } = require("../middlewares/check-auth");

const multer = require("multer");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Inavlid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "./images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLocaleLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];

    callback(null, name + "-" + Date.now() + ext);
  },
});

router.post(
  "/addPost",
  multer({ storage: storage }).array("image"),
  checkAuth,
  PostController.addPost
);
router.get("/:username/viewPosts", checkAuth, PostController.viewPosts);
router.put("/:id/updatePost", checkAuth, PostController.updatePost);
router.delete("/:id/deletePost", checkAuth, PostController.deletePost);
router.put("/:postId/deleteImage", checkAuth, PostController.deleteImage);
router.put("/:postId/likePost", checkAuth, PostController.likePost);
router.post("/:postId/addComment", checkAuth, PostController.addComment);
router.put("/:postId/updateComment", checkAuth, PostController.updateComment);
router.delete(
  "/:postId/:commentId/deleteComment",
  checkAuth,
  PostController.deleteComment
);
router.post("/:postId/:commentId/addReply", checkAuth, PostController.addReply);
router.delete(
  "/:postId/:commentId/:replyId/deleteReply",
  checkAuth,
  PostController.deleteReply
);
router.put(
  "/:postId/:commentId/likeComment",
  checkAuth,
  PostController.likeComment
);
router.put(
  "/:postId/:commentId/:replyId/likeReply",
  checkAuth,
  PostController.likeReply
);

module.exports = router;
