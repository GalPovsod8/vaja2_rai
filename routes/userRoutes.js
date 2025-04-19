var express = require("express");
var authController = require("../controllers/authController.js");
var router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth.js");

router.get("/users/:id", authController.showProfile);
router.post("/users/:id", ensureAuthenticated, authController.updateProfile);

module.exports = router;
