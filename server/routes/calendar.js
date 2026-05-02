const express = require('express');
const xss = require('xss');
const router = express.Router();

// Generate Google Calendar event link
router.post('/create', (req, res) => {
  try {
    const { title, date, description, location } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required.' });
    }

    const sanitizedTitle = xss(title);
    const sanitizedDesc = xss(description || '');
    const sanitizedLocation = xss(location || '');

    // Format date for Google Calendar (YYYYMMDD format)
    const dateStr = date.replace(/-/g, '');

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(sanitizedTitle)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent(sanitizedDesc)}&location=${encodeURIComponent(sanitizedLocation)}`;

    res.json({ url: calendarUrl });
  } catch (error) {
    console.error('Calendar error:', error.message);
    res.status(500).json({ error: 'Failed to create calendar event.' });
  }
});

// Pre-defined election dates
router.get('/dates', (req, res) => {
  const electionDates = [
    {
      id: 1,
      title: 'Voter Registration Deadline',
      date: '2026-08-15',
      description: 'Last date to register as a voter for the upcoming election.',
      icon: '📋'
    },
    {
      id: 2,
      title: 'Campaign Period Begins',
      date: '2026-09-01',
      description: 'Official campaign period starts. Candidates begin public outreach.',
      icon: '📢'
    },
    {
      id: 3,
      title: 'Campaign Period Ends',
      date: '2026-10-10',
      description: 'All campaigning must stop 48 hours before voting day.',
      icon: '🔕'
    },
    {
      id: 4,
      title: 'Voting Day — Phase 1',
      date: '2026-10-15',
      description: 'First phase of voting across designated constituencies.',
      icon: '🗳️'
    },
    {
      id: 5,
      title: 'Voting Day — Phase 2',
      date: '2026-10-22',
      description: 'Second phase of voting across remaining constituencies.',
      icon: '🗳️'
    },
    {
      id: 6,
      title: 'Counting Day',
      date: '2026-10-28',
      description: 'Votes are counted and results are declared.',
      icon: '📊'
    }
  ];

  res.json(electionDates);
});

module.exports = router;
