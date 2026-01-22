const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const matchRoutes = require("./routes/match");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", matchRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Cupid Pudding API is running!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
