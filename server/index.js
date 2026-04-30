require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const chatRouter = require('./routes/chat');
const translateRouter = require('./routes/translate');
const calendarRouter = require('./routes/calendar');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware — CSP disabled to allow Google Translate full-page translation
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/chat', chatRouter);
app.use('/api/translate', translateRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/search', searchRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error. Please try again later.' });
});

app.listen(PORT, () => {
  console.log(`\n🗳️  ElectionIQ server running at http://localhost:${PORT}\n`);
});

module.exports = app;
