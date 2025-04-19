var express = require("express");
var authController = require("../controllers/authController.js");
var router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth.js");

router.get("/:id", authController.showProfile);
router.post("/:id", ensureAuthenticated, authController.updateProfile);

module.exports = router;
