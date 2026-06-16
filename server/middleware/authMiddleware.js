const jwt = require("jsonwebtoken");
const fs = require("fs");
const User = require("../models/User");

const getCookieToken = (req) => {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) return null;

    const tokenCookie = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("token="));

    return tokenCookie ? decodeURIComponent(tokenCookie.split("=")[1]) : null;
};

const cleanupUploadedFile = (req) => {
    if (!req.file?.path) return;

    fs.unlink(req.file.path, () => {});
};

const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            token = getCookieToken(req);
        }

        if (!token && typeof req.body?.authToken === "string") {
            token = req.body.authToken;
        }

        if (!token) {
            cleanupUploadedFile(req);

            return res.status(401).json({
                message: "Not authorized, no token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            cleanupUploadedFile(req);

            return res.status(401).json({
                message: "Not authorized, user not found"
            });
        }

        next();

    } catch (error) {
        cleanupUploadedFile(req);

        return res.status(401).json({
            message: "Not authorized, token failed"
        });
    }
};

module.exports = protect;
