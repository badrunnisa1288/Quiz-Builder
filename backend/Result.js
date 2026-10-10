
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attempt",
    required: true,
    unique: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },
  quizTitle: String,
  userId: {
    type: String,
    default: null
  },
  score: Number,
  totalMarks: Number,
  percentage: Number,
  date: Date
});

module.exports = mongoose.model("Result", resultSchema);
