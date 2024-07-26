const express = require("express");

const app = express();

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

app.listen(3000, () => {
  console.log(`RUNNING on port ${3000}`);
});