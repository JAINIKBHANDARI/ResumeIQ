const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /pdf|doc|docx/;

    const extname = allowedFileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
        return cb(null, true);
    } else {
        cb("Only PDF, DOC, DOCX files are allowed");
    }
};

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;