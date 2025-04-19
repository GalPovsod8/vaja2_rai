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
    res.status(500).send("Server Error: Error fetching questions");
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
    const { title, content } = req.body;

    const question = new Question({
      title,
      content,
      author: req.user._id,
    });

    await question.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "stats.questionsAsked": 1 },
      $push: { questions: question._id },
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

exports.voteAjax = async (req, res) => {
  const questionId = req.params.id;
  const userId = req.user._id;
  const { type } = req.body;

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).send("Question not found");
    }

    if (question.voters.includes(userId)) {
      if (type === "down") {
        question.voters = question.voters.filter(
          (voterId) => !voterId.equals(userId)
        );
        if (question.votes > 0) {
          question.votes -= 1;
        }
      } else if (type === "up") {
        question.voters = question.voters.filter(
          (voterId) => !voterId.equals(userId)
        );
        question.votes += 1;
      }
    } else {
      if (type === "up") {
        question.votes += 1;
        question.voters.push(userId);
      } else if (type === "down" && question.votes > 0) {
        question.votes -= 1;
        question.voters.push(userId);
      } else {
        return res.status(400).send("Invalid vote type");
      }
    }

    await question.save();

    res.json({ votes: question.votes });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error voting");
  }
};

exports.postAnswer = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const user = req.user;

  try {
    const answer = await Answer.create({
      content,
      author: user._id,
      createdAt: new Date(),
      votes: 0,
      question: id,
    });

    await Question.findByIdAndUpdate(id, { $push: { answers: answer._id } });

    res.redirect(`/questions/${id}`);
  } catch (err) {
    console.error("Error posting answer:", err);
    res.status(500).send("Error submitting answer");
  }
};
