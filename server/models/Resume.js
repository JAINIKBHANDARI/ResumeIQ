const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        filename: {
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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Resume", resumeSchema);