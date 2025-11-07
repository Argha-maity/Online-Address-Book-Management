const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    contactNo: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    profession: {
        type: String,
    },
    groups: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);