const Contact = require("../models/contact");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

async function handleAddContact(req, res) {
    try {
        const { fullName, contactNo, email, address, profession, groups } = req.body;

        if (!fullName || !contactNo || !email || !address) {
            return res.status(400).json({ message: "Please fill in all required fields: Full Name, Contact No, Email, and Address." });
        }

        const newContact = await Contact.create({
            user: req.user.id,
            fullName,
            contactNo,
            email,
            address,
            profession,
            groups,
        });

        res.status(201).json({
            message: "Contact added successfully",
            contact: newContact
        });

    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({
                message: `The ${field} '${error.keyValue[field]}' is already in use.`
            });
        }
        console.error("Error in handleAddContact:", error.message);
        res.status(500).json({ message: "Server error during contact creation." });
    }
}

async function getContactInfo(req, res) {
    try {
        const contacts = await Contact.find({ user: req.user.id }).sort({ fullName: 1 });

        res.status(200).json({
            count: contacts.length,
            contacts,
        });
    } catch (error) {
        console.error("Error in getContactInfo:", error.message);
        res.status(500).json({ message: "Server error while fetching contacts." });
    }
}

async function getSingleContact(req, res) {
    try {
        const contactId = req.params.id;

        const contact = await Contact.findOne({
            _id: contactId,
            user: req.user.id,
        });

        if (!contact) {
            return res.status(404).json({ message: "Contact not found or you do not have permission to view it." });
        }

        res.status(200).json({ contact });

    } catch (error) {
        console.error("Error in getSingleContact:", error.message);
        res.status(500).json({ message: "Server error while fetching contact details." });
    }
}

async function handleUpdateContact(req, res) {
    try {
        const contactId = req.params.id;
        const updates = req.body;

        const updatedContact = await Contact.findOneAndUpdate(
            { _id: contactId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedContact) {
            return res.status(404).json({ message: "Contact not found or you do not have permission to edit it." });
        }

        res.status(200).json({
            message: "Contact updated successfully",
            contact: updatedContact,
        });

    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({
                message: `The ${field} '${error.keyValue[field]}' is already in use by another contact.`
            });
        }
        console.error("Error in handleUpdateContact:", error.message);
        res.status(500).json({ message: "Server error during contact update." });
    }
}

async function handleDeleteContact(req, res) {
    try {
        const contactId = req.params.id;

        const deletedContact = await Contact.findOneAndDelete({
            _id: contactId,
        });

        if (!deletedContact) {
            return res.status(404).json({ message: "Contact not found or you do not have permission to delete it." });
        }

        res.status(200).json({
            message: "Contact deleted successfully",
            deletedId: deletedContact._id,
        });

    } catch (error) {
        console.error("Error in handleDeleteContact:", error.message);
        res.status(500).json({ message: "Server error during contact deletion." });
    }
}

async function handleImportContact(req, res) {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        if (!data.length) {
            return res.status(400).json({ message: "Empty Excel file" });
        }

        const userId = req.user.id;
        const contacts = data.map((item) => ({
            ...item,
            user: userId,
        }));

        await Contact.insertMany(contacts);

        res.status(201).json({ message: `Successfully imported ${contacts.length} contacts!` });
    } catch (error) {
        console.error("Import error:", error);
        res.status(500).json({ message: "Failed to import contacts", error: error.message });
    }
}

async function handleExportContact(req, res) {
    try {
        const userId = req.user.id; 
        const contacts = await Contact.find({ user: userId }).lean();

        if (!contacts || contacts.length === 0) {
            return res.status(404).json({ message: "No contacts found for export" });
        }

        const formattedContacts = contacts.map((c) => ({
            FullName: c.fullName,
            ContactNo: c.contactNo,
            Email: c.email,
            Address: c.address,
            Profession: c.profession || "",
            Groups: c.groups || "",
            CreatedAt: c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(formattedContacts);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

        const fileName = `contacts_export_${userId}_${Date.now()}.xlsx`;
        const exportPath = path.join(__dirname, `../exports/${fileName}`);

        fs.mkdirSync(path.join(__dirname, "../exports"), { recursive: true });

        XLSX.writeFile(workbook, exportPath);

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return res.sendFile(path.resolve(exportPath), (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ message: "Error sending file" });
            } else {
                setTimeout(() => {
                    fs.unlink(exportPath, (unlinkErr) => {
                        if (unlinkErr) console.error("Cleanup error:", unlinkErr);
                    });
                }, 5000);
            }
        });
    } catch (error) {
        console.error("Export error:", error);
        res.status(500).json({
            message: "Failed to export contacts",
            error: error.message,
        });
    }
}

module.exports = {
    handleAddContact,
    getContactInfo,
    handleUpdateContact,
    handleDeleteContact,
    getSingleContact,
    handleImportContact,
    handleExportContact,
};