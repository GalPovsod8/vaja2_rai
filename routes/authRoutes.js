var express = require("express");
var authController = require("../controllers/authController");
var router = express.Router();

router.get("/register", authController.showRegister);
router.post("/register", authController.register);
router.get("/login", authController.showLogin);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

module.exports = router;
