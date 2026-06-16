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

const logUploadRequest = (req, res, next) => {
    console.info("[resume-upload] request-reached-backend", {
        origin: req.headers.origin,
        contentType: req.headers["content-type"]
    });

    next();
};

router.post("/upload", logUploadRequest, upload.single("resume"), protect, uploadResume);

router.get("/history", protect, getResumeHistory);

router.get("/:id", protect, getResumeById);

router.delete("/:id", protect, deleteResumeById);

module.exports = router;
