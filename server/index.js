const logger = require("./utils/logger");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");

const chatRouter = require("./routes/chat");
const translateRouter = require("./routes/translate");
const calendarRouter = require("./routes/calendar");
const searchRouter = require("./routes/search");
const logScoreRouter = require("./routes/log-score");

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);
const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://electioniq-1071759571350.asia-south1.run.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) === -1 &&
        !origin.endsWith(".run.app")
      ) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
app.use(compression()); // Compress all responses for efficiency
app.use(express.json({ limit: "10kb" }));

// Serve static files with efficient browser caching
app.use(
  express.static(path.join(__dirname, "..", "public"), {
    maxAge: "1d", // Cache static assets for 1 day
    etag: true,
  }),
);

// API routes
app.use("/api/chat", chatRouter);
app.use("/api/translate", translateRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/search", searchRouter);
app.use("/api/log-score", logScoreRouter);

// Config endpoint — passes public API keys to frontend safely
app.get("/api/config", (req, res) => {
  res.json({
    GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID || "",
    FIREBASE_CONFIG: {
      apiKey: process.env.FIREBASE_API_KEY || "",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.FIREBASE_APP_ID || "",
    },
    GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Health check (Cloud Run specific)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Server error:", err.message);
  res
    .status(500)
    .json({ error: "Internal server error. Please try again later." });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(
      `\n🗳️  ElectionIQ server running at http://localhost:${PORT}\n`,
    );
  });
}

module.exports = app;
