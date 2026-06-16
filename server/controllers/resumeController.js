const { PDFParse } = require("pdf-parse");
const path = require("path");
const Resume = require("../models/Resume");
const analyzeResumeWithAI = require("../utils/gemini");

const JOB_DESCRIPTION_LIMIT = 8000;

const sanitizeOptionalText = (value, limit = 120) => {
    if (typeof value !== "string") return "";

    return value.replace(/\s+/g, " ").trim().slice(0, limit);
};

const getJobMatchInput = (body = {}) => {
    const selectedRole = sanitizeOptionalText(body.targetRole);
    const customRole = sanitizeOptionalText(body.customRole);
    const targetRole = customRole
        || (/other\s*\/?\s*custom/i.test(selectedRole) ? "" : selectedRole);
    const jobDescription = sanitizeOptionalText(body.jobDescription, JOB_DESCRIPTION_LIMIT);

    return {
        targetRole,
        jobDescription
    };
};

const logUploadStage = (stage, details = {}) => {
    console.info("[resume-upload]", stage, details);
};

// Upload Resume, Extract Text, Analyze with AI, and Generate Questions
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a file"
            });
        }

        logUploadStage("received", {
            origin: req.headers.origin,
            contentType: req.headers["content-type"],
            userAuthenticated: Boolean(req.user),
            userId: req.user?._id?.toString(),
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        let extractedText = "";
        const isPdfUpload = path.extname(req.file.originalname).toLowerCase() === ".pdf";

        if (!isPdfUpload) {
            return res.status(400).json({
                message: "Only PDF resume files are supported."
            });
        }

        let parser;

        try {
            logUploadStage("extracting-pdf-text", {
                filename: req.file.filename
            });

            parser = new PDFParse({
                url: req.file.path
            });
            const result = await parser.getText();
            extractedText = result.text;
        } finally {
            if (parser) {
                await parser.destroy();
            }
        }

        if (!extractedText || extractedText.trim().length < 50) {
            return res.status(400).json({
                message: "Could not extract enough text from PDF. Please upload a text-based resume PDF."
            });
        }

        const jobMatchInput = getJobMatchInput(req.body);
        logUploadStage("starting-ai-analysis", {
            textLength: extractedText.length,
            hasTargetRole: Boolean(jobMatchInput.targetRole),
            hasJobDescription: Boolean(jobMatchInput.jobDescription)
        });

        const aiAnalysis = await analyzeResumeWithAI(extractedText, jobMatchInput);
        logUploadStage("saving-analysis");

        const resume = await Resume.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            filepath: req.file.path,
            uploadedBy: req.user._id,
            resumeText: extractedText,
            atsScore: aiAnalysis.atsScore,
            scoreBreakdown: aiAnalysis.scoreBreakdown,
            strengths: aiAnalysis.strengths,
            weaknesses: aiAnalysis.weaknesses,
            suggestions: aiAnalysis.improvementSuggestions,
            missingKeywords: aiAnalysis.missingKeywords,
            resumeHealth: aiAnalysis.resumeHealth,
            actionPlan: aiAnalysis.actionPlan,
            interviewQuestions: aiAnalysis.interviewQuestions,
            ...(aiAnalysis.jobMatchAnalysis ? { jobMatchAnalysis: aiAnalysis.jobMatchAnalysis } : {})
        });

        logUploadStage("completed", {
            resumeId: resume._id.toString()
        });

        res.status(201).json({
            message: "Resume uploaded, analyzed, and interview questions generated successfully",
            resume: {
                id: resume._id,
                filename: resume.filename,
                originalName: resume.originalName,
                filepath: resume.filepath,
                uploadedBy: resume.uploadedBy,
                atsScore: resume.atsScore,
                scoreBreakdown: resume.scoreBreakdown,
                strengths: resume.strengths,
                weaknesses: resume.weaknesses,
                suggestions: resume.suggestions,
                missingKeywords: resume.missingKeywords,
                resumeHealth: resume.resumeHealth,
                actionPlan: resume.actionPlan,
                interviewQuestions: resume.interviewQuestions,
                ...(resume.jobMatchAnalysis ? { jobMatchAnalysis: resume.jobMatchAnalysis } : {})
            }
        });

    } catch (error) {
        console.error("[resume-upload] failed:", error.message);

        res.status(500).json({
            message: "AI analysis failed. Please try again in a few minutes."
        });
    }
};

const getResumeHistory = async (req, res) => {
    try {
        const resumes = await Resume.find({ uploadedBy: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Resume history fetched successfully",
            count: resumes.length,
            resumes
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            uploadedBy: req.user._id
        });

        if (!resume) {
            return res.status(404).json({
                message: "Resume analysis not found"
            });
        }

        res.status(200).json({
            message: "Resume analysis fetched successfully",
            resume
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const deleteResumeById = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            uploadedBy: req.user._id
        });

        if (!resume) {
            return res.status(404).json({
                message: "Resume analysis not found"
            });
        }

        await Resume.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Resume analysis deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    uploadResume,
    getResumeHistory,
    getResumeById,
    deleteResumeById
};
