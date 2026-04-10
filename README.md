# 📝 Examination Module

A full-stack web application for managing and conducting online exams, built with **Node.js (Express)**, **MySQL (Sequelize ORM)**, and **React**.

---

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js, Express.js                 |
| Database   | MySQL + Sequelize ORM               |
| Frontend   | React, React Router v6, Axios       |
| Auth       | JWT (JSON Web Tokens) + bcryptjs    |
| Validation | express-validator                   |

---

## 📁 Project Structure

```
exam-module/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize MySQL connection
│   ├── controllers/
│   │   ├── authController.js    # Register, Login, GetMe
│   │   ├── examController.js    # Exam CRUD
│   │   ├── questionController.js# Question CRUD
│   │   └── resultController.js  # Submit exam, results, analytics
│   ├── middleware/
│   │   └── auth.js              # JWT authenticate + authorizeAdmin
│   ├── models/
│   │   ├── User.js
│   │   ├── Exam.js
│   │   ├── Question.js
│   │   └── ExamResult.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── exams.js
│   │   └── misc.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js   # Global auth state
    │   ├── pages/
    │   │   ├── AuthPage.js      # Login / Register
    │   │   ├── StudentDashboard.js
    │   │   ├── TakeExam.js      # Exam with timer
    │   │   ├── AdminDashboard.js
    │   │   ├── CreateExam.js
    │   │   └── ManageQuestions.js
    │   ├── services/
    │   │   └── api.js           # Axios API calls
    │   ├── App.js               # Routes + Protected routes
    │   └── index.js
    └── package.json
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js v16+
- MySQL running locally

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/exam-module.git
cd exam-module
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run dev
```

### 3. Create MySQL Database
```sql
CREATE DATABASE exam_module;
```
> Tables are auto-created by Sequelize on first run (`sync: alter`).

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```

App runs at: **http://localhost:3000**  
API runs at: **http://localhost:5000**

---

## 🔐 Authentication

JWT-based authentication. Include the token in every protected request:
```
Authorization: Bearer <token>
```

Two roles:
- **admin** — Create exams, manage questions, view all results & analytics
- **student** — View & take exams, view own results

---

## 📡 API Endpoints

### Auth
| Method | Endpoint             | Access | Description        |
|--------|----------------------|--------|--------------------|
| POST   | /api/auth/register   | Public | Register user      |
| POST   | /api/auth/login      | Public | Login              |
| GET    | /api/auth/me         | Auth   | Get current user   |

### Exams
| Method | Endpoint             | Access | Description        |
|--------|----------------------|--------|--------------------|
| GET    | /api/exams           | Auth   | List all exams     |
| GET    | /api/exams/:id       | Auth   | Get exam details   |
| POST   | /api/exams           | Admin  | Create exam        |
| PUT    | /api/exams/:id       | Admin  | Update exam        |
| DELETE | /api/exams/:id       | Admin  | Delete exam        |

### Questions
| Method | Endpoint                          | Access | Description        |
|--------|-----------------------------------|--------|--------------------|
| GET    | /api/exams/:examId/questions      | Auth   | Get questions      |
| POST   | /api/exams/:examId/questions      | Admin  | Add question       |
| PUT    | /api/questions/:id                | Admin  | Update question    |
| DELETE | /api/questions/:id                | Admin  | Delete question    |

### Results
| Method | Endpoint                    | Access  | Description             |
|--------|-----------------------------|---------|-------------------------|
| POST   | /api/exams/:examId/submit   | Student | Submit exam (auto-score) |
| GET    | /api/results/my             | Student | Own results             |
| GET    | /api/results                | Admin   | All results             |
| GET    | /api/results/analytics      | Admin   | Analytics dashboard     |

---

## ✨ Features

- ✅ JWT Authentication with role-based access (Admin / Student)
- ✅ Full CRUD for Exams and Questions
- ✅ **Auto score calculation** on exam submission
- ✅ Countdown timer with auto-submit
- ✅ Pass/Fail determination based on passing marks
- ✅ Admin analytics dashboard (total exams, students, pass rate)
- ✅ Input validation on all API endpoints
- ✅ Duplicate submission prevention
- ✅ Clean, responsive React UI

---

## 🗄️ Database Design

```
users          → id, name, email, password, role
exams          → id, title, description, duration, totalMarks, passingMarks, isActive, createdBy
questions      → id, examId, questionText, optionA-D, correctAnswer, marks
exam_results   → id, userId, examId, score, totalMarks, percentage, passed, answers (JSON)
```
