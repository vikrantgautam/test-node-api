const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, "PrivateKey"); 
    next();
  } catch (e) {
    console.log(e.message);
    res.status(401).json({
      message: e.message,
    });
  }
};

module.exports = {
  checkAuth,
};
