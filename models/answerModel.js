const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  votes: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
});

// Posodobi sprejet odgovor na vprašanje
answerSchema.pre("save", function (next) {
  if (this.isModified("isAccepted") && this.isAccepted) {
    mongoose
      .model("Question")
      .findByIdAndUpdate(
        this.question,
        { $set: { acceptedAnswer: this._id } },
        next
      );
  } else {
    next();
  }
});

module.exports = mongoose.model("Answer", answerSchema);
