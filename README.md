# ResumeIQ

**AI Resume Reviewer & Interview Assistant**

ResumeIQ is a full-stack MERN project that helps users upload a PDF resume and receive an AI-generated analysis including an ATS score, strengths, weaknesses, improvement suggestions, and interview questions.

I built this project step by step with consistent testing, debugging, UI improvements, and deployment. It was a challenging but valuable learning experience because it includes real backend APIs, authentication, file upload, PDF text extraction, AI integration, database storage, frontend routing, responsive design, and live deployment.

Any suggestions, feedback, or ideas for improvement are always welcome.

---

## Live Demo

**Frontend:** https://resumeiq-review.vercel.app  
**Backend API:** https://resumeiq-backend-fl1v.onrender.com

> Note: The backend is hosted on Render Free, so the first request may take a few seconds if the server was inactive.

---

## Project Overview

ResumeIQ is designed for students, freshers, and job seekers who want quick feedback on their resumes before applying for jobs or internships.

The application allows a user to:

- Register and login securely
- Upload a resume in PDF format
- Extract text from the uploaded resume
- Analyze the resume using Gemini AI
- Generate an ATS score
- View strengths, weaknesses, and improvement suggestions
- Generate technical, project-based, and HR interview questions
- View previous resume reports
- Delete old reports
- Use the application in both light and dark mode

---

## Why I Built This Project

Many students and freshers are not sure whether their resume is clear, ATS-friendly, or interview-ready. ResumeIQ tries to solve this by giving simple and useful feedback in one place.

The goal was not just to build a basic frontend page, but to create a complete working full-stack application with backend logic, database storage, AI integration, protected routes, and deployment.

---

## Tech Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- CSS3
- Responsive UI design
- Light and dark theme support

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs
- Multer
- pdf-parse
- Gemini API using `@google/genai`

### Deployment

- Frontend deployed on Vercel
- Backend deployed on Render
- Database hosted on MongoDB Atlas

### Tools Used

- Git and GitHub
- Postman
- MongoDB Atlas Dashboard
- Render Dashboard
- Vercel Dashboard

---

## Main Features

### 1. User Authentication

Users can register and login securely. Passwords are hashed using bcryptjs and authentication is handled using JWT tokens.

### 2. Protected Routes

Dashboard, upload page, history page, and result page are protected. Users cannot access them without logging in.

### 3. Resume Upload

Users can upload a PDF resume. The file is handled using Multer on the backend.

### 4. PDF Text Extraction

The backend extracts text from the uploaded resume using pdf-parse. This extracted text is then sent for AI analysis.

### 5. AI Resume Analysis

Gemini AI analyzes the resume and returns:

- ATS score
- Strengths
- Weaknesses
- Improvement suggestions
- Interview questions

### 6. Interview Question Generator

The application generates interview questions in three categories:

- Technical questions
- Project-based questions
- HR questions

### 7. Resume History

Users can view their previously uploaded resume reports.

### 8. Delete Report

Users can delete old resume analysis reports from their history.

### 9. Light and Dark Mode

The application includes a light/dark theme switch. The selected theme is stored locally so it remains after refresh.

### 10. Responsive UI

The UI is designed to work on both desktop and mobile screens.

---

## Folder Structure

```text
ResumeIQ
├── client
│   ├── public
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── pages
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vercel.json
│
└── server
    ├── config
    ├── controllers
    ├── middleware
    ├── models
    ├── routes
    ├── uploads
    ├── utils
    ├── app.js
    └── package.json
```

---

## API Routes

### Auth Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get logged-in user profile |

### Resume Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload and analyze resume |
| GET | `/api/resume/history` | Get user's resume history |
| GET | `/api/resume/:id` | Get a single resume report |
| DELETE | `/api/resume/:id` | Delete a resume report |

---

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/JAINIKBHANDARI/ResumeIQ.git
cd ResumeIQ
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Create backend `.env` file

Inside the `server` folder, create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start backend

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

### 6. Create frontend `.env` file if needed

Inside the `client` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

### 7. Start frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT authentication |
| `GEMINI_API_KEY` | Gemini API key for resume analysis |
| `PORT` | Backend server port |

### Frontend

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## Deployment Notes

The project is deployed using:

- Vercel for frontend
- Render for backend
- MongoDB Atlas for database

The backend is currently hosted on a free Render instance. Because of this, the server may sleep after inactivity and take a few seconds to wake up on the first request.

---

## Current Status

The project is currently working with:

- Authentication
- Resume upload
- AI analysis
- Result page
- History page
- Delete report feature
- Responsive frontend
- Light/dark mode
- Live deployment

---

## Future Improvements

Some features I would like to add later:

- Download report as PDF
- Job description matching
- Resume improvement checklist
- Better dashboard analytics
- Email verification
- Forgot password flow
- Admin dashboard
- Cloud file storage for uploaded resumes
- More detailed ATS analysis
- Better AI prompt tuning

---

## What I Learned

While building ResumeIQ, I learned how to connect multiple parts of a real full-stack application:

- Building REST APIs using Express
- Connecting MongoDB Atlas with Mongoose
- Creating authentication with JWT
- Handling file uploads with Multer
- Extracting text from PDF resumes
- Integrating Gemini AI into a backend workflow
- Connecting React frontend with backend APIs
- Managing protected routes
- Building responsive UI
- Deploying frontend and backend separately
- Debugging real deployment issues

---

## Feedback

This project was built with hard work, testing, and continuous improvements. I am still learning and improving it further.

If you have any suggestions, improvements, or feedback, I would be happy to hear them.

---

## Author

**Jainik Bhandari**  
GitHub: https://github.com/JAINIKBHANDARI

---

## License

This project is created for learning, portfolio, and academic purposes.
