var express = require("express");
var router = express.Router();
var { ensureAuthenticated } = require("../middleware/auth");
var questionController = require("../controllers/questionController");

router.get("/", questionController.listQuestions);

router.get("/ask", ensureAuthenticated, (req, res) => {
  res.render("questions/create");
});

router.post("/:id/answers", ensureAuthenticated, questionController.postAnswer);

router.post("/:id/vote/ajax", ensureAuthenticated, questionController.voteAjax);

router.get("/hot", questionController.hotQuestions);

router.get("/:id", questionController.showQuestion);

router.post("/", ensureAuthenticated, questionController.createQuestion);

module.exports = router;
