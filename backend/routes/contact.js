const express = require("express");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const {
    handleAddContact,
    handleUpdateContact,
    handleDeleteContact,
    getContactInfo,
    getSingleContact,
    handleImportContact,
    handleExportContact,
} = require("../controllers/contact");

const router = express.Router();

router.post("/import", protect, upload.single("file"), handleImportContact);
router.get("/export", protect, handleExportContact);
router.post("/add", protect, handleAddContact);
router.get("/", protect, getContactInfo);
router.get("/:id", protect, getSingleContact);
router.delete("/delete/:id", protect, handleDeleteContact);
router.patch("/edit/:id", protect, handleUpdateContact);

module.exports = router;