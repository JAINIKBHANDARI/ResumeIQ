const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: false
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
        },

        googleId: {
            type: String,
            trim: true,
            sparse: true
        },

        avatar: {
            type: String,
            trim: true
        },

        passwordResetToken: {
            type: String
        },

        passwordResetExpires: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
