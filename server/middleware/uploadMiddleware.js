const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /pdf|doc|docx/;
    const extname = allowedFileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
        return cb(null, true);
    }

    cb(new Error("Only PDF, DOC, DOCX files are allowed"));
};

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;