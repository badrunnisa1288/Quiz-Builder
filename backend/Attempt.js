
const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },
  userId: {
    type: String,
    default: null
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  score: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  submitted: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  submitTime: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("Attempt", attemptSchema);
