const logger = require("../utils/logger");
const express = require("express");
const { google } = require("googleapis");
const router = express.Router();

/**
 * Appends a row to a Google Sheet.
 * @param {string} sheetId - The Google Sheet ID.
 * @param {string} serviceKey - JSON string of the service account credentials.
 * @param {Array} rowData - The row data to append.
 * @returns {Promise<void>}
 */
async function appendToGoogleSheet(sheetId, serviceKey, rowData) {
  const credentials = JSON.parse(serviceKey);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [rowData],
    },
  });
}

/**
 * POST /api/log-score — Log quiz score to Google Sheet
 */
router.post("/", async (req, res) => {
  try {
    const { name, score, total, percentage } = req.body;

    if (typeof score !== "number" || typeof total !== "number") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid score or total" });
    }

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const serviceKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!sheetId || !serviceKey) {
      return res.json({
        success: false,
        message: "Google Sheets not configured. Score saved locally only.",
      });
    }

    const timestamp = new Date().toISOString();
    const rowData = [
      name || "Anonymous",
      score,
      total,
      `${percentage}%`,
      timestamp,
    ];

    await appendToGoogleSheet(sheetId, serviceKey, rowData);

    res.json({ success: true, message: "Score logged to Google Sheets!" });
  } catch (err) {
    logger.error("Sheets API error:", err.message);
    res.json({
      success: false,
      message: "Could not log score. Saved locally.",
    });
  }
});

module.exports = router;
