const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config/jwt_secret");
const path = require("path");
const fs = require("fs");

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, contactNo: user.contactNo },
        JWT_SECRET,
        { expiresIn: "30d" }
    );
};

async function handleUserSignup(req, res) {
    const { username, contactNo, email, password } = req.body;

    try {
        if (!username || !contactNo || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const formattedContact = `+91-${contactNo}`;

        const userExist = await User.findOne({
            $or: [
                { email },
                { contactNo: formattedContact }
            ]
        });

        if (userExist) {
            return res.status(400).json({ message: "User already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            contactNo: formattedContact,
            email,
            password: hash
        });

        if (user) {
            return res.status(200).json({
                _id: user._id,
                username: user.username,
                contactNo: user.contactNo,
                email: user.email,
                token: generateToken(user),
            });
        } else {
            return res.status(400).json({ message: "Invalid user data." });
        }

    } catch (err) {
        return res.status(500).json({ message: "Server Error: " + err.message });
    }
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return res.status(200).json({
                _id: user._id,
                username: user.username,
                contactNo: user.contactNo,
                email: user.email,
                role: user.role,
                token: generateToken(user),
            });
        } else {
            return res.status(400).json({ message: "Invalid password" });
        }

    } catch (err) {
        return res.status(500).json({ message: "Server Error: " + err.message });
    }
}

function getCurrentUser(req, res) {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    return res.status(200).json({
        _id: user._id,
        username: user.username,
        contactNo: user.contactNo,
        email: user.email,
        role: user.role,
    });
}

async function getUserProfile(req, res) {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let photoUrl = user.profilePhotoUrl;
        if (photoUrl && !photoUrl.startsWith("http")) {
            photoUrl = `https://online-address-book-management.onrender.com${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
        }

        return res.status(200).json({
            user: {
                _id: user._id,
                username: user.username,
                contactNo: user.contactNo,
                email: user.email,
                profilePhotoUrl: photoUrl || "https://online-address-book-management.onrender.com/uploads/profile_photos/default-avatar.png",
            },
        });
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({ message: "Server error" });
    }
}

async function updateUserProfile(req, res) {
    try {
        const userId = req.user._id;
        const { username, contactNo, email } = req.body;
        let profilePhotoUrl;

        if (req.file) {
            profilePhotoUrl = `/uploads/${req.file.filename}`;
        }

        const updatedData = {};
        if (username) updatedData.username = username;
        if (contactNo) updatedData.contactNo = contactNo;
        if (email) updatedData.email = email;
        if (profilePhotoUrl) updatedData.profilePhotoUrl = profilePhotoUrl;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatedData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({ message: "Server error" });
    }
}

async function changePassword(req, res) {
    try {
        const userId = req.user._id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({ message: "Server error" });
    }
}

async function uploadProfilePhoto(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = req.user.id;
        const filePath = req.file.path;

        const photoUrl = `/uploads/profile_photos/${req.file.filename}`;
        const fullUrl = `${req.protocol}://${req.get("host")}${photoUrl}`;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.profilePhotoUrl && user.profilePhotoUrl !== "default-avatar.png") {
            const oldFile = path.join(__dirname, "..", user.profilePhotoUrl);
            if (fs.existsSync(oldFile)) {
                fs.unlinkSync(oldFile);
            }
        }

        user.profilePhotoUrl = fullUrl;
        await user.save();

        return res.status(200).json({
            message: "Profile photo updated successfully",
            user,
        });

    } catch (error) {
        console.error("Error uploading photo:", error);
        return res.status(500).json({ message: "Server error during photo upload" });
    }
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
    getCurrentUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    uploadProfilePhoto,
};