require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const connectDB = require("./config/db");

const app = express();

connectDB();

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("ResumeIQ Backend is running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            message: "File is too large. Please upload a PDF under 5MB."
        });
    }

    if (error.code === "INVALID_FILE_TYPE") {
        return res.status(400).json({
            message: "Only PDF resume files are supported."
        });
    }

    if (error.message === "Not allowed by CORS") {
        return res.status(403).json({
            message: "This frontend origin is not allowed by the backend CORS settings."
        });
    }

    console.error("Unhandled server error:", error.message);

    return res.status(500).json({
        message: "Server error. Please try again."
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
