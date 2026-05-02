const express = require('express');
const xss = require('xss');
const router = express.Router();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // Cache news for 1 hour

// Google Custom Search for election news
router.get('/news', async (req, res) => {
  const cachedNews = cache.get('electionNews');
  if (cachedNews) return res.json(cachedNews);
  try {
    const query = xss(req.query.q || 'India election process');
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || apiKey === 'your_google_search_api_key_here') {
      return res.json({ results: getFallbackNews(), source: 'fallback' });
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query + ' election India')}&num=5`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.items) {
      const results = data.items.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: item.displayLink
      }));
      res.json({ results, source: 'google' });
    } else {
      res.json({ results: getFallbackNews(), source: 'fallback' });
    }
  } catch (error) {
    console.error('Search error:', error.message);
    res.json({ results: getFallbackNews(), source: 'fallback' });
  }
});

function getFallbackNews() {
  return [
    {
      title: 'Election Commission of India — Official Portal',
      link: 'https://eci.gov.in',
      snippet: 'The official website of the Election Commission of India with voter services, election schedules, and results.',
      source: 'eci.gov.in'
    },
    {
      title: 'National Voters\' Service Portal',
      link: 'https://voters.eci.gov.in',
      snippet: 'Register to vote, check your voter ID status, and find your polling station.',
      source: 'voters.eci.gov.in'
    },
    {
      title: 'How Elections Work in India — A Complete Guide',
      link: 'https://eci.gov.in/about/about-eci/',
      snippet: 'Learn about the multi-phase election process, EVM voting, and the role of the Election Commission.',
      source: 'eci.gov.in'
    }
  ];
}

module.exports = router;
