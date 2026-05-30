const { PDFParse } = require("pdf-parse");
const Resume = require("../models/Resume");
const analyzeResumeWithAI = require("../utils/gemini");

// Upload Resume, Extract Text, and Analyze with AI
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
            suggestions: aiAnalysis.suggestions
        });

        res.status(201).json({
            message: "Resume uploaded, text extracted, and analyzed successfully",
            resume: {
                id: resume._id,
                filename: resume.filename,
                filepath: resume.filepath,
                uploadedBy: resume.uploadedBy,
                atsScore: resume.atsScore,
                strengths: resume.strengths,
                weaknesses: resume.weaknesses,
                suggestions: resume.suggestions
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    uploadResume
};