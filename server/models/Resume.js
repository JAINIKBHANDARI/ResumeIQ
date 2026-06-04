const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true
        },

        originalName: {
            type: String,
            required: true
        },

        filepath: {
            type: String,
            required: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resumeText: {
            type: String
        },

        atsScore: {
            type: Number
        },

        scoreBreakdown: {
            contactInformation: { type: Number, default: 0 },
            resumeSections: { type: Number, default: 0 },
            skillsAndKeywords: { type: Number, default: 0 },
            experienceProjectsQuality: { type: Number, default: 0 },
            atsFormatting: { type: Number, default: 0 },
            quantificationImpact: { type: Number, default: 0 },
            grammarProfessionalism: { type: Number, default: 0 }
        },

        strengths: {
            type: [String],
            default: []
        },

        weaknesses: {
            type: [String],
            default: []
        },

        suggestions: {
            type: [String],
            default: []
        },

        missingKeywords: {
            type: [String],
            default: []
        },

        resumeHealth: {
            sectionCompleteness: { type: String, default: "" },
            formattingQuality: { type: String, default: "" },
            keywordStrength: { type: String, default: "" },
            projectImpact: { type: String, default: "" },
            quantifiedAchievements: { type: String, default: "" },
            contactInfoStatus: { type: String, default: "" }
        },

        actionPlan: {
            priorityFixes: { type: [String], default: [] },
            keywordSuggestions: { type: [String], default: [] },
            projectImprovements: { type: [String], default: [] },
            estimatedImprovement: { type: String, default: "" }
        },
        interviewQuestions: {
            technical: {
                type: [String],
                default: []
            },
            project: {
                type: [String],
                default: []
            },
            hr: {
                type: [String],
                default: []
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Resume", resumeSchema);
