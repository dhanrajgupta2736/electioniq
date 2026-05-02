const logger = require("../utils/logger");
const express = require("express");
const xss = require("xss");
const router = express.Router();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); // Cache news for 1 hour

/**
 * Fetches election news from Google Custom Search API.
 * @param {string} query - The search query.
 * @param {string} apiKey - Google Search API Key.
 * @param {string} searchEngineId - Google Search Engine ID.
 * @returns {Promise<Array>} Array of news result objects.
 */
async function fetchGoogleNews(query, apiKey, searchEngineId) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query + " election India")}&num=5`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Search API error: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.items) {
    return [];
  }
  return data.items.map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    source: item.displayLink,
  }));
}

/**
 * Returns fallback news items if the API fails or is unavailable.
 * @returns {Array} Array of fallback news objects.
 */
function getFallbackNews() {
  return [
    {
      title: "Election Commission of India — Official Portal",
      link: "https://eci.gov.in",
      snippet:
        "The official website of the Election Commission of India with voter services, election schedules, and results.",
      source: "eci.gov.in",
    },
    {
      title: "National Voters' Service Portal",
      link: "https://voters.eci.gov.in",
      snippet:
        "Register to vote, check your voter ID status, and find your polling station.",
      source: "voters.eci.gov.in",
    },
    {
      title: "How Elections Work in India — A Complete Guide",
      link: "https://eci.gov.in/about/about-eci/",
      snippet:
        "Learn about the multi-phase election process, EVM voting, and the role of the Election Commission.",
      source: "eci.gov.in",
    },
  ];
}

/**
 * Route handler for fetching election news.
 */
router.get("/news", async (req, res) => {
  try {
    const rawQuery = req.query.q;
    if (rawQuery && typeof rawQuery !== "string") {
      return res.status(400).json({ error: "Invalid query parameter" });
    }

    const query = xss(rawQuery || "India election process");
    const cachedNews = cache.get(`electionNews_${query}`);
    if (cachedNews) {
      return res.json(cachedNews);
    }

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (
      !apiKey ||
      apiKey === "your_google_search_api_key_here" ||
      !searchEngineId
    ) {
      return res.json({ results: getFallbackNews(), source: "fallback" });
    }

    const results = await fetchGoogleNews(query, apiKey, searchEngineId);

    if (results.length > 0) {
      const responseData = { results, source: "google" };
      cache.set(`electionNews_${query}`, responseData);
      res.json(responseData);
    } else {
      res.json({ results: getFallbackNews(), source: "fallback" });
    }
  } catch (error) {
    logger.error("Search error:", error.message);
    res.json({ results: getFallbackNews(), source: "fallback" });
  }
});

module.exports = router;
