const { User, validateSignUp, validateLogIn } = require("../models/user");
const { Post } = require("../models/post");

const { encrypt, decrypt } = require("../services/common-service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let loggedInUserId = "";

const signUp = async (req, res) => {
  try {
    const { error } = validateSignUp(req.body);
    if (error) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: error.details[0].message,
      });
    }
    req.body.username = req.body.username.toLowerCase();
    req.body.email = req.body.email.toLowerCase();

    const existingUser = await User.findOne({
      username: req.body.username,
    });
    if (existingUser) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: "Username already exists, try something else.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    const body = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      username: req.body.username,
      joinedTime: req.body.joinedTime,
      isFollowing: false,
      profilePic: "",
      backgroundPic: "",
    };
    const user = await User.create(body);
    res.status(200).json({
      Data: "",
      Success: true,
      message: "User created successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const logIn = async (req, res) => {
  try {
    const { error } = validateLogIn(req.body);
    if (error) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: error.details[0].message,
      });
    }
    req.body.username = req.body.username.toLowerCase();

    const existingUser = await User.findOne({
      username: req.body.username,
    });
    if (!existingUser) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: "Incorrect username or password",
      });
    }
    // const decryptedPassword = decrypt(req.body.password);
    const validPassword = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );

    if (!validPassword) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: "Incorrect username or password",
      });
    }
    const token = jwt.sign({ _id: existingUser._id }, "PrivateKey");
    // const token = jwt.sign({ _id: existingUser._id }, 'PrivateKey',{expiresIn:"1h"});
    loggedInUserId = existingUser._id;
    return res.status(200).json({
      Data: {
        id: existingUser._id,
        token: token,
        username: existingUser.username,
        // expiresIn: 3600
      },
      Success: true,
      message: "Logged in successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const checkExistingUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: "Username already exists, try something else.",
      });
    }
    res.status(200).json({
      Data: req.body.username,
      Success: true,
      message: "User does not exist.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      Data: users,
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

const resetPassword = async (req, res) => {
  try {
    const { error } = validateLogIn(req.body);
    if (error) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: error.details[0].message,
      });
    }
    req.body.username = req.body.username.toLowerCase();

    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    const existingUser = await User.findOne({
      username: req.body.username,
    });
    if (!existingUser) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: "Username does not exist.",
      });
    }
    const user = await User.findByIdAndUpdate(existingUser._id, req.body);
    if (!user) {
      return res
        .status(404)
        .json({ Data: "", Success: true, message: "User not found" });
    }

    const updatedUser = await User.findById(existingUser._id);
    return res.status(200).json({
      Data: "",
      Success: true,
      message: "Password changed successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const viewUser = async (req, res) => {
  try {
    req.params.username = req.params.username.toLowerCase();

    const existingUser = await User.findOne({
      username: req.params.username,
    });
    if (!existingUser) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: "Username does not exist.",
      });
    }

    const user = await User.findById(existingUser._id);
    if (!user) {
      return res.status(404).json({ message: `User not found.` });
    }

    const userFollowers = await User.findById(existingUser._id).populate({
      path: "followers following",
      select: "id name username bio profilePic", // Specify the fields you want to include
    });

    const userImages = await User.findById(existingUser._id).populate({
      path: "userPosts",
      select:
        "id caption comments likes image uploadedByUsername uploadedByAvatar uploadedByName uploadedById uploadTime", // Specify the fields you want to include
    });

    res.status(200).json({
      Data: {
        id: user._id,
        name: user.name,
        email: user.email,
        loggedInUserId: loggedInUserId,
        joinedTime: user.joinedTime,
        // password: user.password,
        username: user.username,
        backgroundPic: user.backgroundPic,
        profilePic: user.profilePic,
        bio: user.bio,
        website: user.website,
        isFollowing: user.isFollowing,
        userFollowers: userFollowers.followers,
        userFollowing: userFollowers.following,
        userPosts: userImages.userPosts.reverse(),
      },
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

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
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
    // console.log(req.body);
    if (req.body.imageType != undefined && req.body.profilePic != "") {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
      existingUser.imagePath = imagePath;
      if (req.body.imageType == "Profile") {
        req.body.profilePic = imagePath;
        req.body.backgroundPic = existingUser.backgroundPic;
      } else {
        req.body.profilePic = existingUser.profilePic;
        req.body.backgroundPic = imagePath;
      }
    }
    if (req.body.imageType != undefined && req.body.profilePic == "") {
      if (req.body.imageType == "Profile") {
        req.body.profilePic = "";
        req.body.backgroundPic = existingUser.backgroundPic;
      } else {
        req.body.profilePic = existingUser.profilePic;
        req.body.backgroundPic = "";
      }
    }
    // else {
    //   if (req.body.imageType == "Profile") {
    //     req.body.profilePic = "";
    //     req.body.backgroundPic = existingUser.backgroundPic;
    //   } else {
    //     req.body.profilePic = existingUser.profilePic;
    //     req.body.backgroundPic = "";
    //   }
    // }
    const checkexistingUser = await User.findOne({
      username: req.body.username,
    });
    if (checkexistingUser && req.body.username != existingUser.username) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: "Username already exists, try something else.",
      });
    }

    const user = await User.findByIdAndUpdate(id, req.body);
    if (!user) {
      return res.status(404).json({ message: `User not found.` });
    }
    // console.log(user);
    const updatedUser = await User.findById(id);
    res.status(200).json({
      Data: updatedUser,
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

const getUserPic = async (req, res) => {
  try {
    req.params.username = req.params.username.toLowerCase();

    const existingUser = await User.findOne({
      username: req.params.username,
    });
    if (!existingUser) {
      return res.status(200).json({
        Data: "",
        Success: false,
        message: "Username does not exist.",
      });
    }

    const user = await User.findById(existingUser._id);
    if (!user) {
      return res.status(404).json({ message: `User not found.` });
    }

    res.status(200).json({
      Data: {
        id: user._id,
        name: user.name,
        username: user.username,
        backgroundPic: user.backgroundPic,
        profilePic: user.profilePic,
      },
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

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.body;

    // Find users with the given IDs
    const users = await User.find({ _id: { $in: id } });

    // Prepare the response data with user details
    const userDetails = users.map((user) => ({
      _id: user._id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    }));

    res.status(200).json({
      Data: userDetails,
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

const followUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.id);
    if (!currentUser) {
      return res.status(404).json({ message: `User not found.` });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: `User not found.` });
    }

    if (userToFollow.followers.indexOf(currentUser._id) === -1) {
      // Add the current user to the userToFollow's followers list
      userToFollow.followers.push(currentUser);
      userToFollow.isFollowing = true;
      await userToFollow.save();

      // Add the userToFollow to the current user's following list
      currentUser.following.push(userToFollow);
      await currentUser.save();
    }

    res.status(200).json({
      Data: "",
      Success: true,
      message: "User followed successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.id);
    if (!currentUser) {
      return res.status(404).json({ message: `User not found.` });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: `User not found.` });
    }

    // Remove the current user to the userToFollow's followers list
    userToFollow.followers.pull(currentUser);
    userToFollow.isFollowing = false;
    await userToFollow.save();

    // Remove the userToFollow to the current user's following list
    currentUser.following.pull(userToFollow);
    await currentUser.save();

    res.status(200).json({
      Data: "",
      Success: true,
      message: "User unfollowed successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const getfollowList = async (req, res) => {
  try {
    const { id } = req.params;
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

    // const { id } = req.params;
    const user = await User.findById(existingUser._id);
    if (!user) {
      return res.status(404).json({ message: `User not found.` });
    }
    const userFollowers = await User.findById(existingUser._id).populate({
      path: "followers following",
      select: "id name username bio profilePic", // Specify the fields you want to include
    });

    res.status(200).json({
      Data: {
        followersList: userFollowers.followers,
        followingList: userFollowers.following,
      },
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

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: `User not found.` });
    }
    res.status(200).json({
      Data: user,
      Success: true,
      message: "User deleted successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const deleteAllUsers = async (req, res) => {
  try {
    const user = await User.collection.deleteMany({});
    res.status(200).json({
      Data: user,
      Success: true,
      message: "All users deleted successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const encryptCall = async (req, res) => {
  try {
    res.status(200).json({
      Data: encrypt(req.body.password),
      Success: true,
      message: "User deleted successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const decryptCall = async (req, res) => {
  try {
    res.status(200).json({
      Data: decrypt(req.body.password),
      Success: true,
      message: "User deleted successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

const updateField = async (req, res) => {
  try {
    // const url = req.protocol + "://" + req.get("host");
    // imagePath = url + "/images/" + "noAvatar.png";

    // const user = await Post.updateMany({}, { $set: { likes: "" } }); //To add new field

    // const user = await User.updateMany(
    //   {},
    //   { $unset: { userPost: 1 } },
    //   { multi: true }
    // ); //To delete existing field

    // const user = await User.updateMany(
    //   {},
    //   { $rename: { userPost: "userPosts" } },
    //   { multi: true }
    // ); // To upadte field's name

    // const user = await Post.updateMany(
    //   { comments: [] },
    //   { $set: { comments: { comments: [], commentsCount: 0 } } },
    //   { multi: true }
    // ); //To update conditionally

    // const user = await Post.updateMany(
    //   { comments: { $exists: true, $ne: [] } },
    //   { $set: { "comments.commentsCount": { $size: "$comments.comments" } } },
    //   { multi: true }
    // ); //To update conditional if multiple updates

    // const posts = await Post.find();
    // for (let i = 0; i < posts.length; i++) {
    //   const post = posts[i];

    //   // Update the comments structure
    //   post.comments = {
    //     comments: [],
    //     commentsCount: 0,
    //   };

    //   await post.save();
    // } //To update nested objects in all

    // const posts = await Post.find();
    // for (let i = 0; i < posts.length; i++) {
    //   const post = posts[i];

    //   // Update the comments structure
    //   for (let j = 0; j < post.comments.comments.length; j++) {
    //     const comment = post.comments.comments[j];

    //     // Update the replies structure
    //     comment.replies = {
    //       replies: [],
    //       repliesCount: 0,
    //     };
    //   }

    //   await post.save();
    // } //To update nested nested

    // const user = await Post.deleteMany({}) //To delete all documents

    res.status(200).json({
      Data: posts,
      Success: true,
      message: "Updated successfully.",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
};

module.exports = {
  signUp,
  logIn,
  checkExistingUser,
  allUsers,
  resetPassword,
  viewUser,
  updateUser,
  deleteUser,
  deleteAllUsers,
  encryptCall,
  decryptCall,
  updateField,
  followUser,
  unfollowUser,
  getfollowList,
  getUserPic,
  getUserDetails,
};
