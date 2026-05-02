const logger = require("../utils/logger");
const express = require("express");
const xss = require("xss");
const router = express.Router();

/**
 * Generates a Google Calendar event URL.
 * @param {string} title - The event title.
 * @param {string} date - The event date in YYYY-MM-DD format.
 * @param {string} description - The event description.
 * @param {string} location - The event location.
 * @returns {string} The formatted Google Calendar URL.
 */
function generateCalendarUrl(title, date, description, location) {
  const sanitizedTitle = xss(title);
  const sanitizedDesc = xss(description || "");
  const sanitizedLocation = xss(location || "");
  const dateStr = date.replace(/-/g, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(sanitizedTitle)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent(sanitizedDesc)}&location=${encodeURIComponent(sanitizedLocation)}`;
}

/**
 * Returns the list of predefined election dates.
 * @returns {Array} Array of election date objects.
 */
function getElectionDates() {
  return [
    {
      id: 1,
      title: "Voter Registration Deadline",
      date: "2026-08-15",
      description:
        "Last date to register as a voter for the upcoming election.",
      icon: "📋",
    },
    {
      id: 2,
      title: "Campaign Period Begins",
      date: "2026-09-01",
      description:
        "Official campaign period starts. Candidates begin public outreach.",
      icon: "📢",
    },
    {
      id: 3,
      title: "Campaign Period Ends",
      date: "2026-10-10",
      description: "All campaigning must stop 48 hours before voting day.",
      icon: "🔕",
    },
    {
      id: 4,
      title: "Voting Day — Phase 1",
      date: "2026-10-15",
      description: "First phase of voting across designated constituencies.",
      icon: "🗳️",
    },
    {
      id: 5,
      title: "Voting Day — Phase 2",
      date: "2026-10-22",
      description: "Second phase of voting across remaining constituencies.",
      icon: "🗳️",
    },
    {
      id: 6,
      title: "Counting Day",
      date: "2026-10-28",
      description: "Votes are counted and results are declared.",
      icon: "📊",
    },
  ];
}

/**
 * Route to generate a calendar event link.
 */
router.post("/create", (req, res) => {
  try {
    const { title, date, description, location } = req.body;
    if (
      !title ||
      !date ||
      typeof title !== "string" ||
      typeof date !== "string"
    ) {
      return res
        .status(400)
        .json({ error: "Valid title and date are required." });
    }
    const calendarUrl = generateCalendarUrl(title, date, description, location);
    res.json({ url: calendarUrl });
  } catch (error) {
    logger.error("Calendar create error:", error.message);
    res.status(500).json({ error: "Failed to create calendar event." });
  }
});

/**
 * Route to get predefined election dates.
 */
router.get("/dates", (req, res) => {
  try {
    const dates = getElectionDates();
    res.json(dates);
  } catch (error) {
    logger.error("Calendar dates error:", error.message);
    res.status(500).json({ error: "Failed to fetch dates." });
  }
});

module.exports = router;
