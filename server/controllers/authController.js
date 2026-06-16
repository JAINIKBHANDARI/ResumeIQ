const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

const sendAuthResponse = (res, statusCode, message, user, token) => {
    res.cookie("token", token, getCookieOptions());

    return res.status(statusCode).json({
        message,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            authProvider: user.authProvider
        }
    });
};

const hashResetToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

const getClientUrl = () => {
    return process.env.CLIENT_URL || "http://localhost:5173";
};

const isStrongEnoughPassword = (password) => {
    return typeof password === "string" && password.length >= 8;
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = generateToken(user._id);

        return sendAuthResponse(res, 201, "User registered successfully", user, token);

    } catch (error) {
        console.error("Register failed:", error.message);

        return res.status(500).json({
            message: "Server error. Please try again."
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.password) {
            return res.status(400).json({
                message: "This account uses Google Sign-In. Please continue with Google."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id);

        return sendAuthResponse(res, 200, "Login successful", user, token);

    } catch (error) {
        console.error("Login failed:", error.message);

        return res.status(500).json({
            message: "Server error. Please try again."
        });
    }
};

const googleLoginUser = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required"
            });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({
                message: "Google login is not configured"
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload?.email || !payload?.sub) {
            return res.status(401).json({
                message: "Invalid Google account"
            });
        }

        // Privacy: only store basic verified profile data. Never store Google ID tokens,
        // Google passwords, or request access to Gmail, Drive, Calendar, or other services.
        const googleProfile = {
            googleId: payload.sub,
            name: payload.name || payload.email.split("@")[0],
            email: payload.email.toLowerCase(),
            avatar: payload.picture
        };

        let user = await User.findOne({ email: googleProfile.email });

        if (user) {
            let shouldSave = false;

            if (!user.googleId) {
                user.googleId = googleProfile.googleId;
                shouldSave = true;
            }

            if (!user.avatar && googleProfile.avatar) {
                user.avatar = googleProfile.avatar;
                shouldSave = true;
            }

            if (user.authProvider !== "google" && !user.password) {
                user.authProvider = "google";
                shouldSave = true;
            }

            if (shouldSave) {
                await user.save();
            }
        } else {
            user = await User.create({
                name: googleProfile.name,
                email: googleProfile.email,
                authProvider: "google",
                googleId: googleProfile.googleId,
                avatar: googleProfile.avatar
            });
        }

        const token = generateToken(user._id);

        return sendAuthResponse(res, 200, "Google login successful", user, token);

    } catch (error) {
        console.error("Google authentication failed:", error.message);

        return res.status(401).json({
            message: "Google authentication failed"
        });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie("token", getCookieOptions());

    return res.status(200).json({
        message: "Logged out successfully"
    });
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Please enter your email"
            });
        }

        const genericMessage = "If an account exists for this email, a password reset link has been sent.";
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(200).json({
                message: genericMessage
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetUrl = `${getClientUrl()}/reset-password/${resetToken}`;

        user.passwordResetToken = hashResetToken(resetToken);
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        try {
            await sendEmail({
                to: user.email,
                subject: "Reset your ResumeIQ password",
                text: `Use this secure link to reset your ResumeIQ password. It expires in 15 minutes: ${resetUrl}`,
                html: `
                    <p>Use this secure link to reset your ResumeIQ password:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>
                `
            });
        } catch (emailError) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            console.error("Password reset email failed:", emailError.message);

            return res.status(200).json({
                message: genericMessage
            });
        }

        return res.status(200).json({
            message: genericMessage
        });

    } catch (error) {
        console.error("Forgot password failed:", error.message);

        return res.status(500).json({
            message: "Server error. Please try again."
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Reset token and new password are required"
            });
        }

        if (!isStrongEnoughPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        const user = await User.findOne({
            passwordResetToken: hashResetToken(token),
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Password reset link is invalid or expired"
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        if (!user.authProvider) {
            user.authProvider = "local";
        }

        await user.save();

        return res.status(200).json({
            message: "Password reset successful. You can now login with your new password."
        });

    } catch (error) {
        console.error("Reset password failed:", error.message);

        return res.status(500).json({
            message: "Server error. Please try again."
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleLoginUser,
    logoutUser,
    forgotPassword,
    resetPassword
};
