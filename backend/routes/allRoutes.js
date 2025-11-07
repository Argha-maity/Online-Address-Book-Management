const express = require("express");
const userRoutes = require("./user");
const contactRoutes = require("./contact");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/contact", contactRoutes);

module.exports = router;