var UserModel = require("../models/userModel.js");

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {
  /**
   * userController.list()
   */
  list: function (req, res) {
    UserModel.find(function (err, users) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting user.",
          error: err,
        });
      }

      return res.json(users);
    });
  },

  /**
   * userController.show()
   */
  show: function (req, res) {
    const id = req.params.id;

    UserModel.findById(id)
      .populate("questions")
      .populate({
        path: "answers",
        populate: {
          path: "question",
          select: "title",
        },
      })
      .exec(function (err, user) {
        if (err) {
          return res.status(500).json({
            message: "Error when getting user.",
            error: err,
          });
        }

        if (!user) {
          return res.status(404).json({
            message: "No such user",
          });
        }

        return res.render("auth/profile", {
          title: `${user.username}'s Profile`,
          user: user,
        });
      });
  },

  /**
   * userController.create()
   */
  create: function (req, res) {
    var user = new UserModel({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    user.save(function (err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error when creating user",
          error: err,
        });
      }

      return res.status(201).json(user);
    });
  },

  /**
   * userController.update()
   */
  update: function (req, res) {
    var id = req.params.id;

    UserModel.findOne({ _id: id }, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting user",
          error: err,
        });
      }

      if (!user) {
        return res.status(404).json({
          message: "No such user",
        });
      }

      user.username = req.body.username ? req.body.username : user.username;
      user.email = req.body.email ? req.body.email : user.email;
      user.password = req.body.password ? req.body.password : user.password;

      user.save(function (err, user) {
        if (err) {
          return res.status(500).json({
            message: "Error when updating user.",
            error: err,
          });
        }

        return res.json(user);
      });
    });
  },

  /**
   * userController.remove()
   */
  remove: function (req, res) {
    var id = req.params.id;

    UserModel.findByIdAndRemove(id, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error when deleting the user.",
          error: err,
        });
      }

      return res.status(204).json();
    });
  },
};
