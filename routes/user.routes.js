const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
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
    // cb(null, "./images");
  },
  filename: (req, file, callback) => {
    // const name = file.originalname;
    const name = file.originalname.toLocaleLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    // path.extname(file.originalname)
    // console.log(file);
    callback(null, name + "-" + Date.now() + ext);
  },
});

router.post("/signUp", UserController.signUp);
router.post("/logIn", UserController.logIn);
router.post("/checkExistingUser", UserController.checkExistingUser);
router.get("/:username/viewUser", checkAuth, UserController.viewUser);
router.get("/:username/getUserPic", checkAuth, UserController.getUserPic);
router.put("/getUserDetails", checkAuth, UserController.getUserDetails);
router.put(
  "/:id/updateUser",
  multer({ storage: storage }).single("profilePic"),
  checkAuth,
  UserController.updateUser
);
router.post("/resetPassword", UserController.resetPassword);
router.post("/:id/followUser", UserController.followUser);
router.post("/:id/unfollowUser", UserController.unfollowUser);
router.get("/:id/getfollowList", UserController.getfollowList);
router.get("/:id/getfollowList", UserController.getfollowList);

router.get("/allUsers", UserController.allUsers);
router.delete("/:id", UserController.deleteUser);
router.delete("/deleteAllUsers/:id", UserController.deleteAllUsers);
router.post("/encrypt", UserController.encryptCall);
router.post("/decrypt", UserController.decryptCall);
router.get("/updateField", UserController.updateField);

module.exports = router;
