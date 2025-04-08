const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");
const User = require("../models/userModel");

exports.createAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const answer = new Answer({
      content,
      author: req.user._id,
      question: req.params.questionId,
    });

    await answer.save();

    // Dodaj odgovor na vprašanje
    await Question.findByIdAndUpdate(req.params.questionId, {
      $push: { answers: answer._id },
    });

    // Posodobi uporabniške statistike
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "stats.answersGiven": 1 },
    });

    res.redirect(`/questions/${req.params.questionId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.acceptAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    if (!answer) return res.status(404).send("Answer not found");

    const question = await Question.findById(answer.question);
    if (!question) return res.status(404).send("Question not found");

    // Poglej ali je uporabnik avtor vprašanja
    if (!question.author.equals(req.user._id)) {
      return res
        .status(403)
        .send("Only the question author can accept answers");
    }

    // Uporabi odgovor kot sprejet
    answer.isAccepted = true;
    await answer.save();

    // Posodobi uporabniške statistike
    await User.findByIdAndUpdate(answer.author, {
      $inc: { "stats.acceptedAnswers": 1, "stats.reputation": 15 },
    });

    res.redirect(`/questions/${question._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
