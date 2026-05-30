const { PDFParse } = require("pdf-parse");
const Resume = require("../models/Resume");
const analyzeResumeWithAI = require("../utils/gemini");

// Upload Resume, Extract Text, Analyze with AI, and Generate Questions
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a file"
            });
        }

        let extractedText = "";

        if (req.file.mimetype === "application/pdf") {
            const parser = new PDFParse({
                url: req.file.path
            });

            const result = await parser.getText();
            extractedText = result.text;

            await parser.destroy();
        }

        if (!extractedText || extractedText.trim().length < 50) {
            return res.status(400).json({
                message: "Could not extract enough text from PDF. Please upload a text-based resume PDF."
            });
        }

        const aiAnalysis = await analyzeResumeWithAI(extractedText);

        const resume = await Resume.create({
            filename: req.file.filename,
            filepath: req.file.path,
            uploadedBy: req.user._id,
            resumeText: extractedText,
            atsScore: aiAnalysis.atsScore,
            strengths: aiAnalysis.strengths,
            weaknesses: aiAnalysis.weaknesses,
            suggestions: aiAnalysis.suggestions,
            interviewQuestions: aiAnalysis.interviewQuestions
        });

        res.status(201).json({
            message: "Resume uploaded, analyzed, and interview questions generated successfully",
            resume: {
                id: resume._id,
                filename: resume.filename,
                filepath: resume.filepath,
                uploadedBy: resume.uploadedBy,
                atsScore: resume.atsScore,
                strengths: resume.strengths,
                weaknesses: resume.weaknesses,
                suggestions: resume.suggestions,
                interviewQuestions: resume.interviewQuestions
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
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