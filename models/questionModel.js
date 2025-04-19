const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  views: { type: Number, default: 0 },
  votes: { type: Number, default: 0 },
  answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
  acceptedAnswer: { type: Schema.Types.ObjectId, ref: "Answer" },
  hotness: { type: Number, default: 0 },
  votes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// Update hotness score when question is saved
questionSchema.pre("save", function (next) {
  // Calculate hotness based on views, answers and time
  const ageInHours = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  this.hotness =
    (this.views * 0.1 + this.answers.length * 5) / (ageInHours + 1);
  next();
});

module.exports = mongoose.model("Question", questionSchema);
