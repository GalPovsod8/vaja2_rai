const passport = require("passport");
const User = require("../models/userModel");
const Question = require("../models/questionModel");
const multer = require("multer");
const path = require("path");

// Konfiguracija za shranjevanje slik - Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images m8!"));
  },
}).single("profileImage");

exports.showRegister = (req, res) => {
  res.render("auth/register");
};

exports.register = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log("to je problem");
      return res.render("auth/register", { error: err.message });
    }

    const { username, email, password } = req.body;
    const profileImage = req.file
      ? `/uploads/${req.file.filename}`
      : "/uploads/default.png";

    try {
      const user = new User({ username, email, password, profileImage });
      await user.save();

      req.login(user, (err) => {
        if (err) throw err;
        res.redirect("/");
      });
    } catch (err) {
      res.render("auth/register", {
        error: "Registration failed. Username or email may already be taken.",
        username,
        email,
      });
    }
  });
};

exports.showLogin = (req, res) => {
  res.render("auth/login");
};

exports.login = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: "questions",
        options: { sort: { createdAt: -1 }, limit: 5 },
      })
      .populate({
        path: "answers",
        populate: {
          path: "question",
          select: "title",
        },
        options: { sort: { createdAt: -1 }, limit: 5 },
      });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("auth/profile", {
      title: `${user.username}'s Profile`,
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.updateProfile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.render("auth/profile", { error: err.message });
    }

    try {
      const updates = {};
      if (req.body.username) updates.username = req.body.username;
      if (req.body.email) updates.email = req.body.email;
      if (req.file) updates.profileImage = `/uploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
      });
      res.redirect(`/users/${user._id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  });
};
