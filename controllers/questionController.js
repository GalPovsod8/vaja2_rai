const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");
const User = require("../models/userModel");

exports.listQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("author", "username profileImage")
      .sort({ createdAt: -1 });
    res.render("questions/list", { questions });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: napaka pri pridobivanju vprašanj");
  }
};

exports.showQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("author", "username profileImage stats")
      .populate({
        path: "answers",
        populate: { path: "author", select: "username profileImage stats" },
      })
      .populate("acceptedAnswer");

    if (!question) return res.status(404).send("Question not found");

    // Sortitanej odgovorov
    question.answers.sort((a, b) => {
      if (a._id.equals(question.acceptedAnswer)) return -1;
      if (b._id.equals(question.acceptedAnswer)) return 1;
      return b.votes - a.votes || b.createdAt - a.createdAt;
    });

    res.render("questions/show", { question });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const question = new Question({
      title,
      content,
      author: req.user._id,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    });

    await question.save();

    // Posodobi uporabniški statistiko
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "stats.questionsAsked": 1 },
    });

    res.redirect(`/questions/${question._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.hotQuestions = async (req, res) => {
  try {
    const hotQuestions = await Question.find()
      .sort({ hotness: -1, createdAt: -1 })
      .limit(10)
      .populate("author", "username profileImage");

    res.render("questions/hot", { questions: hotQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
