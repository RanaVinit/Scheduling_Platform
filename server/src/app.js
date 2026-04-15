const express = require("express");
const cors = require("cors");
require("dotenv").config();

const registerRoutes = require("./routes");
const { HTTP_STATUS } = require("./config/constants");

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
registerRoutes(app);

// Health check
app.get("/", (req, res) => res.json({
    status: "UP",
    timestamp: new Date().toISOString(),
    service: "Scheduling Platform API",
}));

// Catch-all 404 handler for undefined API routes
app.use((req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Route not found" });
});

// Global error handler — catches unhandled errors from any route
app.use((err, req, res, next) => {
    console.error(`${req.method} ${req.url}:`, err.message);
    res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
