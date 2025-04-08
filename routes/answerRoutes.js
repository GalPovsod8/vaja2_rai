var express = require("express");
var router = express.Router();
var answersController = require("../controllers/answersController.js");

router.post(
  "/questions/:questionId/answers",
  ensureAuthenticated,
  answersController.createAnswer
);
router.post(
  "/answers/:answerId/accept",
  ensureAuthenticated,
  answersController.acceptAnswer
);

module.exports = router;
