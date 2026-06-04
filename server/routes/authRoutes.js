const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    googleLoginUser,
    logoutUser,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLoginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "Protected profile accessed",
        user: req.user
    });
});

module.exports = router;
