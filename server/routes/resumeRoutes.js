const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    uploadResume,
    getResumeHistory,
    getResumeById,
    deleteResumeById
} = require("../controllers/resumeController");

router.post("/upload", protect, upload.single("resume"), uploadResume);

router.get("/history", protect, getResumeHistory);

router.get("/:id", protect, getResumeById);

router.delete("/:id", protect, deleteResumeById);

module.exports = router;