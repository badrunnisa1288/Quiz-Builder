const Attempt = require("./Attempt");
const Result = require("./Result");
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const Quiz = require("./Quiz");

const app = express();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err.message));

app.use(cors());
app.use(express.json());


// =====================================================
// IN-MEMORY DATABASE
// =====================================================

const users = [];


const attempts = [];
const results = [];

let nextQuizId = 2;
let nextQuestionId = 2;
let nextAttemptId = 1;
let nextResultId = 1;


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
  res.send("Quiz Builder Backend is Running");
});


// =====================================================
// AUTHENTICATION API
// =====================================================

// REGISTER USER
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please fill all fields"
    });
  }

  const existingUser = users.find(
    (user) => user.email === email
  );

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists"
    });
  }

  const user = {
    id: users.length + 1,
    name,
    email,
    password
  };

  users.push(user);

  res.status(201).json({
    message: "Registration successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});


// LOGIN USER
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (user) =>
      user.email === email &&
      user.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});


// USER PROFILE
app.get("/api/auth/profile", (req, res) => {
  res.status(401).json({
    message: "Not logged in"
  });
});


// LOGOUT
app.post("/api/auth/logout", (req, res) => {
  res.json({
    message: "Logout successful"
  });
});


// =====================================================
// QUIZ API
// =====================================================


function formatQuiz(quiz) {
  const data = quiz.toObject();

  return {
    ...data,
    id: data._id.toString(),
    questions: data.questions.map((q) => ({
      ...q,
      id: q.id ?? q._id.toString()
    }))
  };
}

// GET ALL QUIZZES
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes.map(formatQuiz));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ONE QUIZ
app.get("/api/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(formatQuiz(quiz));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE QUIZ
app.post("/api/quizzes", async (req, res) => {
  try {
    const { title, questions, timeLimit } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Quiz title is required" });
    }

    const quiz = await Quiz.create({
      title,
      timeLimit: Number(timeLimit) || 5,
      questions: (questions || []).map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options || [],
        answer: q.answer,
        marks: Number(q.marks) || 1
      }))
    });

    res.status(201).json(formatQuiz(quiz));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE QUIZ
app.put("/api/quizzes/:id", async (req, res) => {
  try {
    const { title, questions, timeLimit } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (title !== undefined) quiz.title = title;
    if (timeLimit !== undefined) quiz.timeLimit = Number(timeLimit);

    if (questions !== undefined) {
      quiz.questions = questions.map((q, index) => ({
        id: q.id || index + 1,
        question: q.question,
        options: q.options || [],
        answer: q.answer,
        marks: Number(q.marks) || 1
      }));
    }

    await quiz.save();
    res.json(formatQuiz(quiz));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE QUIZ
app.delete("/api/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD QUESTION
app.post("/api/quizzes/:quizId/questions", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const { question, options, answer, marks } = req.body;

    quiz.questions.push({
      id: quiz.questions.reduce((max, q) => Math.max(max, q.id || 0), 0) + 1,
      question,
      options: options || [],
      answer,
      marks: Number(marks) || 1
    });

    await quiz.save();
    res.status(201).json(formatQuiz(quiz));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET QUESTIONS
app.get("/api/quizzes/:quizId/questions", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.json(formatQuiz(quiz).questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE QUESTION
app.put("/api/quizzes/:quizId/questions/:questionId", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const question = quiz.questions.find(
      q => String(q.id) === String(req.params.questionId)
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const { question: text, options, answer, marks } = req.body;

    if (text !== undefined) question.question = text;
    if (options !== undefined) question.options = options;
    if (answer !== undefined) question.answer = answer;
    if (marks !== undefined) question.marks = Number(marks);

    await quiz.save();
    res.json(formatQuiz(quiz));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE QUESTION
app.delete("/api/quizzes/:quizId/questions/:questionId", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const question = quiz.questions.find(
      q => String(q.id) === String(req.params.questionId)
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    quiz.questions = quiz.questions.filter(
      q => String(q.id) !== String(req.params.questionId)
    );

    await quiz.save();
    res.json(formatQuiz(quiz));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =====================================================
// ATTEMPT API
// =====================================================

/* ================= ATTEMPT API ================= */

// START QUIZ
app.post("/api/attempts/start", async (req, res) => {
  try {
    const { quizId, userId } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const attempt = await Attempt.create({
      quizId: quiz._id,
      userId: userId ? String(userId) : null
    });

    res.status(201).json({
      message: "Quiz started successfully",
      attemptId: attempt._id.toString(),
      quizId: quiz._id.toString(),
      startTime: attempt.startTime
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/attempts/start", async (req, res) => {
  try {
    const { quizId, userId } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const attempt = await Attempt.create({
      quizId: quiz._id,
      userId: userId || "guest",
      answers: {},
      score: 0,
      totalMarks: 0,
      submitted: false,
      startTime: new Date()
    });

    res.status(201).json({
      message: "Quiz started successfully",
      attemptId: attempt._id.toString(),
      quizId: quiz._id.toString(),
      startTime: attempt.startTime
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


 // SUBMIT QUIZ
app.post("/api/attempts/submit", async (req, res) => {
  try {
    const { attemptId, answers = {} } = req.body;

    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const quiz = await Quiz.findById(attempt.quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (attempt.submitted) {
      return res.status(400).json({ message: "Quiz already submitted" });
    }

    let score = 0;
    let totalMarks = 0;

    quiz.questions.forEach((question, index) => {
      const marks = Number(question.marks) || 1;
      totalMarks += marks;

      const questionId = String(question.id ?? index);
      const userAnswerByIndex = answers[index];
const userAnswer = userAnswerByIndex ?? answers[String(questionId)];

      if (
        userAnswer !== undefined &&
        String(userAnswer).trim().toLowerCase() ===
          String(question.answer ?? "").trim().toLowerCase()
      ) {
        score += marks;
      }
    });

    attempt.answers = answers;
    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.submitted = true;
    attempt.submitTime = new Date();

    await attempt.save();

    res.json({
      message: "Quiz submitted successfully",
      attemptId: attempt._id.toString(),
      score,
      totalMarks,
      percentage: totalMarks > 0
        ? Math.round((score / totalMarks) * 100)
        : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ONE ATTEMPT
app.get("/api/attempts/:id", async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id);

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL ATTEMPTS
app.get("/api/attempts", async (req, res) => {
  try {
    const attempts = await Attempt.find().sort({ startTime: -1 });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ================= RESULT API ================= */

// SAVE RESULT
app.post("/api/results", async (req, res) => {
  try {
    const { attemptId } = req.body;

    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (!attempt.submitted) {
      return res.status(400).json({
        message: "Quiz is not submitted yet"
      });
    }

    const existingResult = await Result.findOne({
      attemptId: attempt._id
    });

    if (existingResult) {
      return res.json({
        message: "Result already saved",
        result: existingResult
      });
    }

    const quiz = await Quiz.findById(attempt.quizId);

    const percentage = attempt.totalMarks > 0
      ? Math.round((attempt.score / attempt.totalMarks) * 100)
      : 0;

    const result = await Result.create({
      attemptId: attempt._id,
      quizId: attempt.quizId,
      quizTitle: quiz ? quiz.title : "Unknown Quiz",
      userId: attempt.userId,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage,
      date: attempt.submitTime
    });

    res.status(201).json({
      message: "Result saved successfully",
      result
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET RESULT BY ATTEMPT ID
app.get("/api/results/:attemptId", async (req, res) => {
  try {
    const result = await Result.findOne({
      attemptId: req.params.attemptId
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET USER'S RESULT HISTORY
app.get("/api/results/user/:userId", async (req, res) => {
  try {
    const results = await Result.find({
      userId: String(req.params.userId)
    }).sort({ date: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});