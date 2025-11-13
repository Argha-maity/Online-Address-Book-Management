require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

app.use(cors({
  origin: "https://address-book-management.netlify.app",  
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

connectDB();

const allRoutes = require("./routes/allRoutes");
app.use("/api", allRoutes);

app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "../frontend/landingPage/index.html"));
});

const port = process.env.PORT || 8001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});