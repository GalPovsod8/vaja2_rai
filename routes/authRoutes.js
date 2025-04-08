var express = require("express");
var router = express.Router();
var authController = require("../controllers/authController.js");

router.get("/register", authController.showRegister);
router.post("/register", authController.register);
router.get("/login", authController.showLogin);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

module.exports = router;
