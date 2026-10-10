import React, { useState, useEffect } from "react";

function App() {
  // =========================
  // AUTHENTICATION
  // =========================

  const [user, setUser] = useState(null);
  const [loginMode, setLoginMode] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // QUIZ DATA
  // =========================

  const [quizzes, setQuizzes] = useState([]);

  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");

  const [questions, setQuestions] = useState([]);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");

  // Used for editing a question
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);

  // =========================
  // QUIZ ATTEMPT
  // =========================

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [attemptHistory, setAttemptHistory] = useState([]);
  // =========================
  // LOAD QUIZZES
  // =========================

  useEffect(() => {
    checkUser();
    loadQuizzes();
  }, []);

  async function checkUser() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/profile"
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.log("User not logged in");
    }
  }

  async function loadQuizzes() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/quizzes"
      );

      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.log("Backend is not running");
    }
  }

  // =========================
  // REGISTER
  // =========================

  async function registerUser() {
    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Registration successful! Please login.");

      setLoginMode(true);
      setName("");
      setPassword("");
    } catch (error) {
      alert("Backend is not running.");
    }
  }

  // =========================
  // LOGIN
  // =========================

  async function loginUser() {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setUser(data.user);

      setEmail("");
      setPassword("");
    } catch (error) {
      alert("Backend is not running.");
    }
  }

  // =========================
  // LOGOUT
  // =========================

  async function logoutUser() {
    try {
      await fetch(
        "http://localhost:5000/api/auth/logout",
        {
          method: "POST"
        }
      );
    } catch (error) {
      console.log(error);
    }

    setUser(null);
  }

  // =========================
  // QUESTION OPTIONS
  // =========================

  function updateOption(index, value) {
    const updatedOptions = [...options];

    updatedOptions[index] = value;

    setOptions(updatedOptions);
  }

  // =========================
  // ADD / UPDATE QUESTION
  // =========================

  async function addOrUpdateQuestion() {
    if (
      !question ||
      options.some((option) => !option) ||
      !answer
    ) {
      alert("Please complete the question.");
      return;
    }

    const newQuestion = {
      question: question,
      options: options,
      answer: answer
    };

    try {
      // UPDATE QUESTION THROUGH QUESTION API
      if (editingIndex !== null) {
        const selectedQuestion = questions[editingIndex];

        if (editingQuizId && selectedQuestion.id) {
          const response = await fetch(
            `http://localhost:5000/api/quizzes/${editingQuizId}/questions/${selectedQuestion.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(newQuestion)
            }
          );

          const data = await response.json();

          if (!response.ok) {
            alert(data.message);
            return;
          }

          newQuestion.id = selectedQuestion.id;
        }

        const updatedQuestions = [...questions];
        updatedQuestions[editingIndex] = newQuestion;
        setQuestions(updatedQuestions);
        setEditingIndex(null);

        alert("Question updated successfully!");
      }

      // ADD QUESTION THROUGH QUESTION API FOR AN EXISTING QUIZ
      else if (editingQuizId) {
        const response = await fetch(
          `http://localhost:5000/api/quizzes/${editingQuizId}/questions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(newQuestion)
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        setQuestions([...questions, data.question]);
        alert("Question added successfully!");
      }

      // ADD QUESTION LOCALLY WHILE CREATING A NEW QUIZ
      else {
        setQuestions([...questions, newQuestion]);
        alert("Question added successfully!");
      }

      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer("");
    } catch (error) {
      alert("Backend is not running.");
    }
  }

  // =========================
  // EDIT QUESTION
  // =========================

  function editQuestion(index) {
    const selectedQuestion = questions[index];

    setQuestion(selectedQuestion.question);
    setOptions(selectedQuestion.options);
    setAnswer(selectedQuestion.answer);
    setEditingIndex(index);
  }

  // =========================
  // DELETE QUESTION
  // =========================

  async function deleteQuestion(index) {
    const selectedQuestion = questions[index];

    try {
      // DELETE QUESTION THROUGH QUESTION API
      if (editingQuizId && selectedQuestion.id) {
        const response = await fetch(
          `http://localhost:5000/api/quizzes/${editingQuizId}/questions/${selectedQuestion.id}`,
          {
            method: "DELETE"
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }
      }

      const updatedQuestions = questions.filter(
        (_, questionIndex) => questionIndex !== index
      );

      setQuestions(updatedQuestions);

      if (editingIndex === index) {
        setEditingIndex(null);
        setQuestion("");
        setOptions(["", "", "", ""]);
        setAnswer("");
      }

      alert("Question deleted successfully!");
    } catch (error) {
      alert("Backend is not running.");
    }
  }

  // =========================
  // CREATE QUIZ
  // =========================

  async function createQuiz() {
    if (!title) {
      alert("Please enter quiz title.");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    try {
      const url = editingQuizId
        ? `http://localhost:5000/api/quizzes/${editingQuizId}`
        : "http://localhost:5000/api/quizzes";

      const response = await fetch(url, {
        method: editingQuizId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          questions,
          timeLimit
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(editingQuizId ? "Quiz updated successfully!" : "Quiz created successfully!");

      setTitle("");
      setTimeLimit("");
      setQuestions([]);
      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer("");
      setEditingIndex(null);
      setEditingQuizId(null);

      loadQuizzes();
    } catch (error) {
      alert("Backend is not running.");
    }
  }

  // =========================
  // START QUIZ
  // =========================

  async function startQuiz(quiz) {
    try {
      const response = await fetch(
        "http://localhost:5000/api/attempts/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            quizId: quiz.id,
            userId: user?.id || null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setAttemptId(data.attemptId);
      setSelectedQuiz(quiz);
      setSelectedAnswers({});
      setScore(null);
      setSubmitted(false);
      setTimeLeft(
        quiz.timeLimit
          ? Number(quiz.timeLimit) * 60
          : null
      );
    } catch (error) {
      alert("Backend is not running.");
    }
  }

  // =========================
  // QUIZ TIMER
  // =========================

  useEffect(() => {
    if (!selectedQuiz || submitted || timeLeft === null) return;

    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedQuiz, submitted, timeLeft]);

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  // =========================
  // SELECT ANSWER
  // =========================

  function selectAnswer(questionIndex, selectedAnswer) {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: selectedAnswer
    });
  }

  // =========================
  // SUBMIT QUIZ
  // =========================

  async function submitQuiz() {
    if (!selectedQuiz || submitted || !attemptId) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/attempts/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            attemptId,
            answers: selectedAnswers
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setScore(data.score);
      setSubmitted(true);
      setTimeLeft(null);
      const resultResponse = await fetch(
  "http://localhost:5000/api/results",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      attemptId: data.attemptId
    })
  }
);

const resultData = await resultResponse.json();

if (!resultResponse.ok) {
  alert(resultData.message);
  return;
}

      setAttemptHistory((previous) => [
        {
          id: data.attemptId,
          quizTitle: selectedQuiz.title,
          score: data.score,
          total: data.totalMarks,
          date: new Date().toLocaleString()
        },
        ...previous
      ]);

      alert("Quiz submitted successfully!");
    } catch (error) {
      alert("Backend is not running.");
    }
  }

  // =========================
  // DELETE QUIZ
  // =========================

  async function deleteQuiz(id) {
    try {
      await fetch(
        `http://localhost:5000/api/quizzes/${id}`,
        {
          method: "DELETE"
        }
      );

      loadQuizzes();
    } catch (error) {
      alert("Backend is not running.");
    }
  }

  // =====================================================
  // LOGIN / REGISTER SCREEN
  // =====================================================

  if (!user) {
    return (
      <div className="app">

        <header>
          <h1>Quiz Builder</h1>
          <p>Create • Manage • Attempt Quizzes</p>
        </header>

        <main>

          <section className="card">

            <h2>
              {loginMode ? "Login" : "Register"}
            </h2>

            {!loginMode && (
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            )}

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            {loginMode ? (
              <>
                <button onClick={loginUser}>
                  Login
                </button>

                <p>Don't have an account?</p>

                <button
                  onClick={() => setLoginMode(false)}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <button onClick={registerUser}>
                  Register
                </button>

                <p>Already have an account?</p>

                <button
                  onClick={() => setLoginMode(true)}
                >
                  Login
                </button>
              </>
            )}

          </section>

        </main>

        <footer>
          <p>
            Quiz Builder | Web Application Project
          </p>
        </footer>

      </div>
    );
  }

  // =====================================================
  // MAIN QUIZ BUILDER
  // =====================================================

  return (
    <div className="app">

      {/* HEADER */}

      <header>

        <h1>Quiz Builder</h1>

        <p>
          Create • Manage • Attempt Quizzes
        </p>

        <div>
          <p>
            Welcome, <strong>{user.name}</strong>
          </p>

          <button onClick={logoutUser}>
            Logout
          </button>
        </div>

      </header>

      <main>

        {/* =========================================
            1.2 QUIZ MODULE
        ========================================= */}

        <section className="card">

          <h2>Create Quiz</h2>

          {/* QUIZ TITLE */}

          <input
            type="text"
            placeholder="Enter quiz title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          {/* QUIZ TIMER */}

          <h3>Set Quiz Timer</h3>

          <input
            type="number"
            placeholder="Time limit in minutes"
            value={timeLimit}
            min="1"
            onChange={(e) =>
              setTimeLimit(e.target.value)
            }
          />

          {/* QUESTION */}

          <h3>
            {editingIndex !== null
              ? "Edit Question"
              : "Add Question"}
          </h3>

          <input
            type="text"
            placeholder="Enter question"
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
          />

          {/* OPTIONS */}

          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) =>
                updateOption(
                  index,
                  e.target.value
                )
              }
            />
          ))}

          {/* CORRECT ANSWER */}

          <select
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
          >

            <option value="">
              Select correct answer
            </option>

            {options
              .filter((option) => option)
              .map((option, index) => (
                <option
                  key={index}
                  value={option}
                >
                  {option}
                </option>
              ))}

          </select>

          {/* ADD / UPDATE BUTTON */}

          <button
            onClick={addOrUpdateQuestion}
          >
            {editingIndex !== null
              ? "Update Question"
              : "Add Question"}
          </button>

          {/* CANCEL EDIT */}

          {editingIndex !== null && (
            <button
              onClick={() => {
                setEditingIndex(null);
                setQuestion("");
                setOptions(["", "", "", ""]);
                setAnswer("");
              }}
            >
              Cancel Edit
            </button>
          )}

          {/* =====================================
              QUESTIONS ADDED
          ===================================== */}

          {questions.length > 0 && (

            <div className="question-list">

              <h3>
                Questions Added:{" "}
                {questions.length}
              </h3>

              {questions.map(
                (q, index) => (

                  <div
                    key={index}
                    className="quiz-item"
                  >

                    <div>

                      <p>
                        <strong>
                          {index + 1}.
                        </strong>{" "}
                        {q.question}
                      </p>

                    </div>

                    <div>

                      <button
                        onClick={() =>
                          editQuestion(index)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete"
                        onClick={() =>
                          deleteQuestion(index)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

          {/* CREATE QUIZ */}

          <button
            className="create-button"
            onClick={createQuiz}
          >
            {editingQuizId ? "Update Quiz" : "Create Quiz"}
          </button>

        </section>

        {/* =========================================
            AVAILABLE QUIZZES
        ========================================= */}

        <section className="card">

          <h2>Available Quizzes</h2>

          {quizzes.length === 0 && (
            <p>No quizzes available.</p>
          )}

          {quizzes.map((quiz) => (

            <div
              className="quiz-item"
              key={quiz.id}
            >

              <div>

                <h3>{quiz.title}</h3>

                <p>
                  {quiz.questions.length} Questions
                </p>

                {quiz.timeLimit && (
                  <p>
                    Time Limit:{" "}
                    {quiz.timeLimit} minutes
                  </p>
                )}

              </div>

              <div>

                <button
                  onClick={() => {
                    setEditingQuizId(quiz.id);
                    setTitle(quiz.title);
                    setTimeLimit(quiz.timeLimit || "");
                    setQuestions(quiz.questions);
                    setEditingIndex(null);
                    setQuestion("");
                    setOptions(["", "", "", ""]);
                    setAnswer("");
                    window.scrollTo(0, 0);
                  }}
                >
                  Edit Quiz
                </button>

                <button
                  onClick={() =>
                    startQuiz(quiz)
                  }
                >
                  Attempt
                </button>

                <button
                  className="delete"
                  onClick={() =>
                    deleteQuiz(quiz.id)
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </section>

        {/* =========================================
            ATTEMPT QUIZ
        ========================================= */}

        {selectedQuiz && (

          <section className="card">

            <h2>
              {selectedQuiz.title}
            </h2>

            {selectedQuiz.timeLimit && !submitted && timeLeft !== null && (
              <div className="timer-box">
                <strong>Time Left: {formatTime(timeLeft)}</strong>
              </div>
            )}

            {selectedQuiz.questions.map(
              (question, index) => (

                <div
                  className="quiz-question"
                  key={index}
                >

                  <h3>
                    {index + 1}.{" "}
                    {question.question}
                  </h3>

                  {question.options.map(
                    (
                      option,
                      optionIndex
                    ) => (

                      <label
                        key={optionIndex}
                      >

                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={
                            selectedAnswers[
                              index
                            ] === option
                          }
                          onChange={() =>
                            selectAnswer(
                              index,
                              option
                            )
                          }
                        />

                        {option}

                      </label>

                    )
                  )}

                </div>

              )
            )}

            <button
              onClick={submitQuiz}
            >
              Submit Quiz
            </button>

            {score !== null && (
              <>
                <div className="result">
                  <h2>Quiz Result</h2>

                  <p>
                    Your Score: {score} / {selectedQuiz.questions.reduce((total, q) => total + Number(q.marks || 1), 0)}
                  </p>

                  <p>
                    Percentage: {Math.round(
                      (score / selectedQuiz.questions.reduce((total, q) => total + Number(q.marks || 1), 0)) * 100
                    )}%
                  </p>
                </div>

                <div className="answer-review">
                  <h2>Answer Review</h2>

                  {selectedQuiz.questions.map((question, index) => {
                    const userAnswer = selectedAnswers[index] || "Not answered";
                    const isCorrect =
  String(userAnswer).trim().toLowerCase() ===
  String(question.answer).trim().toLowerCase();

                    return (
                      <div className="quiz-question" key={index}>
                        <h3>{index + 1}. {question.question}</h3>
                        <p>
                          <strong>Your Answer:</strong> {userAnswer}
                        </p>
                        <p>
                          <strong>Correct Answer:</strong> {question.answer}
                        </p>
                        <p>
                          {isCorrect ? "✅ Correct" : "❌ Wrong"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </section>

        )}

        {/* =========================================
            PREVIOUS ATTEMPTS
        ========================================= */}

        {attemptHistory.length > 0 && (
          <section className="card">
            <h2>Previous Attempts</h2>

            {attemptHistory.map((attempt) => (
              <div className="quiz-item" key={attempt.id}>
                <div>
                  <h3>{attempt.quizTitle}</h3>
                  <p>Score: {attempt.score} / {attempt.total}</p>
                  <p>Percentage: {Math.round((attempt.score / attempt.total) * 100)}%</p>
                  <p>Date: {attempt.date}</p>
                </div>
              </div>
            ))}
          </section>
        )}

      </main>

      <footer>

        <p>
          Quiz Builder | Web Application Project
        </p>

      </footer>

    </div>
  );
}

export default App;