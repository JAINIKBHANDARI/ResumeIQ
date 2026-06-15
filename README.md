# ResumeIQ

## AI Resume Reviewer & Interview Assistant

ResumeIQ is a full-stack MERN application that helps students, freshers, and job seekers analyze their resumes using AI. Users can upload a PDF resume and receive an ATS-style score, detailed score breakdown, resume health analysis, strengths, weaknesses, improvement suggestions, job match analysis, and interview questions.

The project includes secure authentication, Google Login, forgot password flow, PDF text extraction, Gemini AI integration, role-based job matching, resume history, report download, protected routes, privacy policy, responsive UI, light/dark mode, mobile bottom navigation, and live deployment.

---

## Live Demo

Frontend: https://resumeiq-review.vercel.app

Backend API: https://resumeiq-backend-fl1v.onrender.com

> Note: The backend is hosted on Render Free, so the first request may take a few seconds if the server was inactive.

---

## Project Overview

ResumeIQ is designed to help users quickly understand how strong their resume is before applying for jobs or internships.

The application allows users to:

* Register and login securely
* Continue with Google Login
* Reset password using email verification
* Upload a resume in PDF format
* Extract text from the uploaded resume
* Analyze resume using Gemini AI
* Generate ATS-style score
* View detailed score breakdown
* Check resume health
* View strengths, weaknesses, and improvement suggestions
* Analyze resume against a target role or job description
* View job match score
* Find matched skills, missing skills, and missing keywords
* Generate technical, project-based, and HR interview questions
* Use read aloud feature
* Download resume analysis report
* View previous resume reports
* Delete old reports
* Use the application in light and dark mode
* Navigate easily on mobile using bottom navigation
* Access protected dashboard routes securely

---

## Why I Built This Project

Many students and freshers are unsure whether their resume is ATS-friendly, well-structured, role-specific, or interview-ready.

ResumeIQ tries to solve this problem by giving AI-powered feedback in a simple and useful format.

The goal was not just to build a basic frontend page, but to create a complete working full-stack application with backend logic, database storage, authentication, file upload, PDF text extraction, AI integration, job match analysis, protected routes, responsive design, deployment, and security improvements.

---

## Key Features

### 1. Secure User Authentication

ResumeIQ supports secure email/password authentication.

* User registration and login
* Passwords are hashed using bcryptjs
* JWT-based authentication
* Protected private routes
* User profile access after login
* Logout clears authentication data

---

### 2. Google Login

Users can sign in using Google.

* Google Login is integrated
* Frontend sends Google credential to backend
* Backend verifies Google token securely
* Google password is never collected or stored
* Only basic profile information such as name, email, profile picture, and Google ID is used

---

### 3. Forgot Password Flow

ResumeIQ includes a secure forgot password system.

* User enters registered email
* Reset password email is sent using Nodemailer
* Reset token is randomly generated
* Reset token is stored as a secure hash
* Reset link expires after a limited time
* Token is single-use
* New password is created only after valid token verification
* Password is never sent through email

---

### 4. Protected Routes

Dashboard, result page, history page, and other private pages are protected.

* Users cannot access private pages without login
* Invalid or missing token redirects user to login
* Logout clears authentication data
* Refresh after logout keeps user logged out

---

### 5. Resume Upload

Users can upload a resume in PDF format.

* File upload is handled using Multer
* PDF files are accepted
* Uploaded file is processed on backend
* Resume text is extracted for AI analysis

---

### 6. PDF Text Extraction

ResumeIQ extracts text from uploaded PDF resumes using pdf-parse.

The extracted text is then passed to the AI analyzer for feedback generation.

---

### 7. AI Resume Analysis

Gemini AI analyzes the extracted resume text and generates useful feedback.

The analysis includes:

* ATS-style score
* Score breakdown
* Resume strengths
* Resume weaknesses
* Improvement suggestions
* Resume health analysis
* Interview questions

---

### 8. Improved ATS Scoring

ResumeIQ uses an improved scoring approach instead of giving a fixed/default score.

The ATS score is evaluated based on:

* Contact information
* Resume sections
* Skills and keywords
* Project or experience quality
* ATS-friendly formatting
* Quantified achievements
* Grammar and professionalism

This helps create better score variation between weak, average, and strong resumes.

The scoring is designed to be more consistent so that the same resume content gives the same score, while changed resume content can naturally produce a different score.

---

### 9. Job Match Analyzer

ResumeIQ includes a Job Match Analyzer feature.

Users can optionally select a target role or paste a job description while uploading their resume.

The feature helps users understand how well their resume matches a specific role or job description.

It can generate:

* Job match score
* Target role analysis
* Matched skills
* Missing skills
* Missing keywords
* Role-specific suggestions
* Resume rewrite tips
* Readiness level
* Job-specific summary

If the user does not provide a role or job description, ResumeIQ continues with normal general resume analysis.

---

### 10. Resume Health Analysis

ResumeIQ checks important resume health indicators such as:

* Section completeness
* Formatting quality
* Keyword strength
* Project impact
* Quantified achievements
* Contact information status

---

### 11. Interview Question Generator

ResumeIQ generates interview questions based on resume content.

Questions are categorized into:

* Technical questions
* Project-based questions
* HR questions

This helps users prepare for interviews according to their own resume.

---

### 12. Resume History

Users can view previously analyzed resume reports.

* Each user has separate resume history
* Previous reports can be opened again
* Resume reports are stored in MongoDB

---

### 13. Delete Report

Users can delete old resume analysis reports from their history.

This helps users keep their dashboard clean and organized.

---

### 14. Download Report

Users can download their resume analysis report for future reference.

The report includes:

* ATS score
* Resume feedback
* Strengths
* Weaknesses
* Improvement suggestions
* Job match analysis, if available
* Interview questions

---

### 15. Read Aloud Feature

ResumeIQ includes a read aloud feature that allows users to listen to generated resume feedback.

This improves accessibility and gives users another way to review suggestions.

---

### 16. Light and Dark Mode

The application supports both light and dark themes.

* Users can switch between themes
* Selected theme is saved locally
* Theme remains after page refresh
* Theme toggle uses clean light/dark icons

---

### 17. Responsive UI

ResumeIQ is designed to work on different screen sizes.

* Desktop-friendly layout
* Tablet responsive
* Mobile responsive
* Clean dashboard-style UI
* Mobile bottom navigation for better small-screen usability

---

### 18. Mobile Bottom Navigation

For mobile users, ResumeIQ includes a bottom navigation layout.

It gives quick access to important pages such as:

* Dashboard
* Upload
* History
* More options

The More menu includes secondary actions such as theme toggle and logout.

---

### 19. Privacy Policy

ResumeIQ includes a privacy-focused approach.

* Google password is never collected
* Gmail, Google Drive, Calendar, or other Google services are not accessed
* Uploaded resumes are used only for resume analysis features
* User data is not sold

---

## Tech Stack

### Frontend

* React.js
* Vite
* React Router DOM
* Axios
* CSS3
* Responsive UI
* Light/Dark mode

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcryptjs
* Multer
* pdf-parse
* Nodemailer
* Google OAuth
* Gemini API using @google/genai

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

### Tools Used

* Git
* GitHub
* Postman
* MongoDB Atlas Dashboard
* Render Dashboard
* Vercel Dashboard
* Google Cloud Console

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
│   │   ├── utils
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

| Method | Route                             | Description                |
| ------ | --------------------------------- | -------------------------- |
| POST   | `/api/auth/register`              | Register a new user        |
| POST   | `/api/auth/login`                 | Login user                 |
| POST   | `/api/auth/google`                | Login with Google          |
| POST   | `/api/auth/forgot-password`       | Send password reset email  |
| POST   | `/api/auth/reset-password/:token` | Reset user password        |
| GET    | `/api/auth/profile`               | Get logged-in user profile |

---

### Resume Routes

| Method | Route                 | Description                |
| ------ | --------------------- | -------------------------- |
| POST   | `/api/resume/upload`  | Upload and analyze resume  |
| GET    | `/api/resume/history` | Get user's resume history  |
| GET    | `/api/resume/:id`     | Get a single resume report |
| DELETE | `/api/resume/:id`     | Delete a resume report     |

---

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/JAINIKBHANDARI/ResumeIQ.git
cd ResumeIQ
```

---

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

### 3. Create Backend Environment File

Inside the `server` folder, create a `.env` file.

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

GOOGLE_CLIENT_ID=your_google_oauth_client_id
CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=ResumeIQ <your_email@gmail.com>
```

---

### 4. Start Backend Server

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

---

### 5. Install Frontend Dependencies

Open another terminal and run:

```bash
cd client
npm install
```

---

### 6. Create Frontend Environment File

Inside the `client` folder, create a `.env` file.

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

### 7. Start Frontend Server

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend Environment Variables

| Variable         | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| PORT             | Backend server port                            |
| MONGO_URI        | MongoDB Atlas connection string                |
| JWT_SECRET       | Secret key for JWT authentication              |
| GEMINI_API_KEY   | Gemini API key for resume analysis             |
| GOOGLE_CLIENT_ID | Google OAuth client ID                         |
| CLIENT_URL       | Frontend URL for CORS and password reset links |
| SMTP_HOST        | Email SMTP host                                |
| SMTP_PORT        | Email SMTP port                                |
| SMTP_SECURE      | SMTP secure setting                            |
| SMTP_USER        | Email account used to send reset emails        |
| SMTP_PASS        | Email app password                             |
| EMAIL_FROM       | Sender name shown in reset emails              |

---

### Frontend Environment Variables

| Variable              | Purpose                             |
| --------------------- | ----------------------------------- |
| VITE_API_URL          | Backend API base URL                |
| VITE_GOOGLE_CLIENT_ID | Google OAuth client ID for frontend |

---

## Important Environment Safety

Real `.env` files should not be pushed to GitHub.

The project should keep only `.env.example` files in GitHub.

```text
.env = real secret values
.env.example = sample/template values
```

Sensitive values such as MongoDB URI, JWT secret, Gemini API key, Google Client ID, and SMTP password should always remain private.

---

## Deployment Notes

ResumeIQ is deployed using:

* Vercel for frontend
* Render for backend
* MongoDB Atlas for database

The backend is hosted on a free Render instance. Because of this, the server may sleep after inactivity and take a few seconds to wake up on the first request.

For deployment, environment variables must be added manually in:

* Vercel project settings for frontend variables
* Render project settings for backend variables

---

## Security Highlights

* Passwords are hashed using bcryptjs
* JWT is used for authentication
* Google token is verified on backend
* Google password is never collected or stored
* Forgot password token is hashed before storing
* Reset password token expires and is single-use
* Password is never sent through email
* Environment variables are kept outside GitHub
* Protected routes prevent unauthorized access
* Logout clears authentication data
* Privacy policy is included

---

## Current Status

ResumeIQ is currently working with:

* Email/password authentication
* Google Login
* Forgot Password
* Resume upload
* PDF text extraction
* Gemini AI analysis
* ATS-style scoring
* Score breakdown
* Resume health analysis
* Job Match Analyzer
* Interview question generation
* Read aloud feature
* Report download
* Resume history
* Delete report
* Protected routes
* Privacy Policy
* Responsive frontend
* Mobile bottom navigation
* Light/Dark mode
* Live deployment

---

## Future Improvements

Some features I would like to add later, arranged from highest priority to lower priority:

1. **Email verification for new user accounts**
   Add account verification after signup so that only verified users can access the platform.

2. **Resume improvement checklist**
   Add a checklist where users can track completed resume improvements step by step.

3. **More advanced dashboard analytics**
   Show score trends, previous analysis comparison, improvement history, and user progress.

4. **Cloud storage for uploaded resumes**
   Store uploaded resumes securely using cloud storage instead of temporary/local upload handling.

5. **Email report sharing**
   Allow users to send their resume analysis report directly to their email.

6. **Resume version tracking**
   Let users compare different versions of the same resume after making improvements.

7. **Multiple resume comparison**
   Allow users to compare two or more resumes and identify which one is stronger.

8. **Resume builder**
   Add a resume builder where users can create or improve resumes directly inside the platform.

9. **Cover letter generator**
   Generate role-specific cover letters based on the resume and job description.

10. **LinkedIn profile analyzer**
    Analyze LinkedIn profile text and suggest improvements similar to resume analysis.

11. **Advanced ATS keyword analysis**
    Add deeper keyword density checks and more role-specific keyword suggestions.

12. **More detailed resume formatting suggestions**
    Give more specific suggestions about spacing, section order, bullet structure, and readability.

13. **Role-based recommendations with more job categories**
    Expand role support for more domains, technologies, and job profiles.

14. **Admin dashboard**
    Add an admin panel to view platform usage, users, and reports.

---

## What I Learned

While building ResumeIQ, I learned how to connect multiple parts of a real full-stack application:

* Building REST APIs using Express.js
* Connecting MongoDB Atlas with Mongoose
* Creating authentication with JWT
* Hashing passwords using bcryptjs
* Implementing Google Login
* Building a forgot password system with email reset links
* Handling file uploads with Multer
* Extracting text from PDF resumes
* Integrating Gemini AI into a backend workflow
* Creating protected frontend routes
* Connecting React frontend with backend APIs
* Creating role-based job match analysis
* Improving scoring consistency
* Managing environment variables securely
* Building responsive UI
* Adding light/dark theme support
* Improving mobile navigation
* Deploying frontend and backend separately
* Debugging real deployment issues
* Improving authentication and logout security
* Working with real production deployment problems

---

## Feedback

This project was built with consistent testing, debugging, and continuous improvements.

I am still learning and improving it further. Suggestions, feedback, and ideas for improvement are always welcome.

---

## Author

**Jainik Bhandari**

GitHub: https://github.com/JAINIKBHANDARI

LinkedIn: https://linkedin.com/in/JainikBhandari

---

## License

This project is created for learning, portfolio, internship, and academic purposes.
