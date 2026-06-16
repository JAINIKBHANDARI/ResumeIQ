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

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
    const hasPdfExtension = path.extname(file.originalname).toLowerCase() === ".pdf";
    const allowedMimeTypes = [
        "application/pdf",
        "application/x-pdf",
        "application/octet-stream"
    ];
    const hasPdfMimeType = allowedMimeTypes.includes(file.mimetype);

    if (hasPdfExtension && hasPdfMimeType) {
        return cb(null, true);
    }

    const error = new Error("Only PDF files are allowed");
    error.code = "INVALID_FILE_TYPE";
    cb(error);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_RESUME_SIZE_BYTES
    }
});

module.exports = upload;
