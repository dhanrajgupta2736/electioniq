const request = require('supertest');
const app = require('../server/index'); // Make sure server/index.js exports `app` without listening

describe('ElectionIQ API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return status ok and a timestamp', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/chat', () => {
    it('should reject requests without a message', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ history: [] });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Please provide a valid message.');
    });

    it('should reject messages that are too long', async () => {
      const longMessage = 'a'.repeat(1005);
      const res = await request(app)
        .post('/api/chat')
        .send({ message: longMessage });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Message must be 1-1000 characters.');
    });

    it('should return a fallback response if no GEMINI_API_KEY is available or an election query is matched', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'What is NOTA?' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('reply');
      expect(res.body.reply).toContain('NOTA');
    });
  });

  describe('GET /api/calendar/dates', () => {
    it('should return predefined election dates', async () => {
      const res = await request(app).get('/api/calendar/dates');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('date');
    });
  });

  describe('POST /api/log-score', () => {
    it('should fail validation if score is not a number', async () => {
      const res = await request(app)
        .post('/api/log-score')
        .send({ name: 'Test', score: 'not a number', total: 5, percentage: 100 });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Invalid score or total');
    });

    it('should gracefully save locally if Google Sheets is not configured', async () => {
      const res = await request(app)
        .post('/api/log-score')
        .send({ name: 'Test User', score: 5, total: 5, percentage: 100 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Google Sheets not configured. Score saved locally only.');
    });
  });
});
