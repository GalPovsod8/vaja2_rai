const passport = require("passport");
const User = require("../models/userModel");
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

exports.login = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
});

exports.logout = (req, res) => {
  req.logout();
  res.redirect("/");
};

exports.showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "questions",
        select: "title createdAt",
        options: { limit: 5, sort: { createdAt: -1 } },
      })
      .populate({
        path: "answers",
        select: "content createdAt question",
        populate: { path: "question", select: "title" },
        options: { limit: 5, sort: { createdAt: -1 } },
      });

    if (!user) return res.status(404).send("User not found");

    res.render("auth/profile", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
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
