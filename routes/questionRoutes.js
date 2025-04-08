var express = require("express");
var router = express.Router();
var questionController = require("../controllers/questionController.js");

router.get("/questions", questionController.listQuestions);
router.get("/questions/hot", questionController.hotQuestions);
router.get("/questions/:id", questionController.showQuestion);
router.post(
  "/questions",
  ensureAuthenticated,
  questionController.createQuestion
);

module.exports = router;
