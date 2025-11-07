const express = require("express");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
    handleUserSignup,
    handleUserLogin,
    getCurrentUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    uploadProfilePhoto,
} = require("../controllers/user");

const router = express.Router();

router.post("/signup", handleUserSignup);
router.post("/login", handleUserLogin);
router.get("/me", protect, getCurrentUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, upload.single("profilePhoto"), updateUserProfile);
router.put("/change-password", protect, changePassword);
router.put("/profile-photo", protect, upload.single("profilePhoto"), uploadProfilePhoto);

module.exports = router;