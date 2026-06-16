require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const connectDB = require("./config/db");

const app = express();

connectDB();

const allowedOrigins = [
    ...(process.env.CLIENT_URL || "").split(","),
    "https://resumeiq-review.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
].map((origin) => origin.trim()).filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        const isAllowedVercelPreview = origin?.endsWith(".vercel.app");

        if (!origin || allowedOrigins.includes(origin) || isAllowedVercelPreview) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "ResumeIQ Backend is running"
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "API is healthy"
    });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

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
