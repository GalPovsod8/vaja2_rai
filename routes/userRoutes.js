var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController.js");
const { ensureAuthenticated } = require("../middleware/auth.js");
var authController = require("../controllers/authController.js");

router.get("/users/:id", authController.showProfile);
router.post("/users/:id", ensureAuthenticated, authController.updateProfile);

module.exports = router;
