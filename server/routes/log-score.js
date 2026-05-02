const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// POST /api/log-score — Log quiz score to Google Sheet
router.post('/', async (req, res) => {
  try {
    const { name, score, total, percentage } = req.body;

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const serviceKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!sheetId || !serviceKey) {
      return res.json({ success: false, message: 'Google Sheets not configured. Score saved locally only.' });
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceKey);
    } catch {
      return res.json({ success: false, message: 'Invalid service account key format.' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const timestamp = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name || 'Anonymous', score, total, `${percentage}%`, timestamp]]
      }
    });

    res.json({ success: true, message: 'Score logged to Google Sheets!' });
  } catch (err) {
    console.error('Sheets API error:', err.message);
    res.json({ success: false, message: 'Could not log score. Saved locally.' });
  }
});

module.exports = router;
