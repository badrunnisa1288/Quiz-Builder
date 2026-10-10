# Quiz Builder

A full-stack quiz application built using React.js, Node.js, Express.js, and MongoDB.

## About the Project

Quiz Builder is a web application that allows users to register, log in, create quizzes, manage questions, and attempt quizzes. It calculates scores and displays results after submission.

## Features

- User registration and login
- Quiz creation and management
- Add, edit, and delete questions
- Multiple-choice questions
- Quiz attempts and answer submission
- Automatic score calculation
- Result display with percentage
- MongoDB database integration

## Tech Stack

**Frontend**
- React.js
- Vite
- CSS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB

## Project Structure

```text
Quiz-Builder/
├── frontend/
├── backend/
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/badrunnisa1288/Quiz-Builder.git
cd Quiz-Builder
```

### 2. Configure environment variables

Create a `.env` file in the backend folder and add your own database connection string and port.

Example:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Never upload real credentials or passwords to GitHub.

### 3. Start the backend

Open a terminal:

```bash
cd backend
npm install
npm start
```

If your backend uses a different start script, use the command specified in `backend/package.json`.

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:5173`.

## Future Improvements

- Quiz timers
- Quiz categories and difficulty levels
- Leaderboards
- Improved responsive design
- Deployment for public access

## Author

**Badrunnisa Mohammed**

GitHub: [badrunnisa1288](https://github.com/badrunnisa1288)