// const connectDB = require("./config/db.js");
// const express = require("express");
// //const bodyParser = require("body-parser");
// const dotenv = require("dotenv");
// dotenv.config();
// const app = express();
// const port = process.env.PORT || 5000;
// const path = require("path");

// const userRoute = require("./routes/user.routes.js");
// const postRoute = require("./routes/post.routes.js");


// //app.use(bodyParser.json()); // for parsing application/json
// //app.use(bodyParser.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET,POST,PATCH,PUT,DELETE,OPTIONS"
//   );
//   next();
// });
// app.use(express.json());
// app.use("/images",express.static(path.join("./images")));


// app.use("/api/user", userRoute);
// app.use("/api/post", postRoute);
// app.use("/", (req, res) => {
//   res.json({
//     Message:"Node is running."
//   })
// });

// connectDB(); // connect to mongodb

// app.listen(port, (req, res) => {
//   console.log(`RUNNING on port ${port}`);
// });













const connectDB = require("./config/db.js");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); // Import CORS middleware
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const path = require("path");

const userRoute = require("./routes/user.routes.js");
const postRoute = require("./routes/post.routes.js");

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use("/images", express.static(path.join("./images")));

app.use("/api/user", userRoute);
app.use("/api/post", postRoute);
app.use("/", (req, res) => {
  res.json({
    Message: "Node is running."
  });
});
app.use("/test", (req, res) => {
  res.json({
    Message: "Node is running."
  });
});

connectDB(); // connect to mongodb

app.listen(port, () => {
  console.log(`RUNNING on port ${port}`);
});
