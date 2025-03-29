var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "StackUnderflow | Less answers, more confusion!",
    section1Title: "Welcome to StackUnderflow",
    section1Content:
      "StackUnderflow is a Q&A platform where you can ask questions and get answers from the community. However, be prepared for confusion and less clarity!",
  });
});

module.exports = router;
