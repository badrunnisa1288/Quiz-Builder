
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  id: Number,
  question: String,
  options: [String],
  answer: String,
  marks: {
    type: Number,
    default: 1
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  timeLimit: {
    type: Number,
    default: 5
  },
  questions: [questionSchema]
});

module.exports = mongoose.model("Quiz", quizSchema);
