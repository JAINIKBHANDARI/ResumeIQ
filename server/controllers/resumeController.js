const { PDFParse } = require("pdf-parse");
const Resume = require("../models/Resume");

// Upload Resume and Extract Text
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

        const resume = await Resume.create({
            filename: req.file.filename,
            filepath: req.file.path,
            uploadedBy: req.user._id,
            resumeText: extractedText
        });

        res.status(201).json({
            message: "Resume uploaded and text extracted successfully",
            resume: {
                id: resume._id,
                filename: resume.filename,
                filepath: resume.filepath,
                uploadedBy: resume.uploadedBy,
                resumeText: resume.resumeText
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