# 🗳️ ElectionIQ — Your Smart Election Guide

**ElectionIQ** is an interactive civic education web application that helps users understand the election process, timelines, and steps in a clear and engaging way. Built with a conversational AI assistant, interactive timeline, quizzes, and multi-language support.

## 📋 Chosen Vertical

**Civic Education / Government Transparency** — Empowering citizens with knowledge about democratic processes.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗓️ **Interactive Timeline** | Visual step-by-step election process with expandable details and animations |
| 🤖 **AI Chat Assistant** | Gemini-powered bot with 20+ topic coverage and rotating fallback responses |
| 🗺️ **Polling Station Finder** | 15 major Indian cities + pincode lookup with timing, booth info & Google Maps |
| 📅 **Election Date Reminders** | Add key election dates to Google Calendar with one click |
| 🌐 **Multi-language Support** | Full-page translation in 12 Indian languages via Google Translate |
| 🔊 **Read Aloud** | Text-to-speech for accessibility using Web Speech API |
| 📝 **Knowledge Quiz** | 5-question quiz with instant feedback and scoring |
| 📰 **Election News/Resources** | Real-time election resources via Google Custom Search |
| 🌗 **Light/Dark Theme** | Toggle with animated switch, localStorage persistence & OS preference detection |

---

## 🧱 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js with Express.js
- **AI:** Google Gemini API (gemini-2.0-flash)
- **Security:** Helmet, CORS, XSS sanitization, rate limiting
- **Testing:** Jest with jsdom

---

## 🔌 Google Services Used & Why

| Service | Purpose |
|---------|---------|
| **Gemini API** | Powers the AI chat assistant with contextual election knowledge |
| **Google Custom Search API** | Fetches real-time election news and resources |
| **Google Translate** | Full-page translation into 12 Indian languages |
| **Google Calendar** | Allows users to add election dates as calendar events |
| **Google Maps Embed** | Shows nearby polling stations on an interactive map |
| **Web Speech API** | Browser-native text-to-speech for accessibility |

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+ installed
- (Optional) Google API keys for full functionality

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/electioniq.git
cd electioniq

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env and add your API keys

# 4. Start the server
npm start

# 5. Open in browser
# Visit http://localhost:8080
```

### Running Tests
```bash
npm test
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Optional* | Google Gemini API key for AI chat |
| `GOOGLE_SEARCH_API_KEY` | Optional* | Google Custom Search API key |
| `GOOGLE_SEARCH_ENGINE_ID` | Optional* | Custom Search Engine ID |
| `PORT` | No | Server port (default: 8080) |

*\*The app works without API keys using built-in fallback responses. Add keys for full AI-powered functionality.*

---

## 🧠 Approach & Logic

### Architecture
- **Server-side API proxy:** All API keys are kept on the server. The frontend never sees secrets.
- **Graceful degradation:** Every feature has a fallback. No API key? The app still works with pre-built responses.
- **Rate limiting:** Chat endpoint is limited to 20 requests/minute to prevent abuse.
- **Input sanitization:** All user inputs are sanitized with XSS filtering before processing.

### Design Decisions
- **Dark glassmorphism theme** with a civic color palette (saffron, blue, white, green) for a premium, modern look
- **No login required** — the app is instantly accessible to all visitors
- **Mobile-first responsive design** with smooth animations
- **Static i18n** for Hindi/Marathi labels + **Google Translate** widget for full-page translation in 12 languages
- **Web Speech API** for text-to-speech (browser-native, no API key needed)
- **Light/dark theme toggle** with animated switch and localStorage persistence

### How Features Work
1. **Timeline:** Rendered dynamically with CSS animations. Clicking a step toggles its detail panel.
2. **Chat:** Messages are sent to the Express backend, which forwards them to Gemini with conversation history.
3. **Polling Finder:** Uses mock data for station results + Google Maps embed for the map view.
4. **Calendar:** Generates Google Calendar URLs with pre-filled event details.
5. **Quiz:** Client-side scoring with immediate feedback and explanations.
6. **Language:** Fetches translation strings from the server and updates all `[data-i18n]` elements.

---

## 📌 Assumptions Made

1. The app is focused on the **Indian election system** (ECI, EVMs, VVPAT, etc.)
2. Polling station data uses **mock/sample data** since live data requires government API access
3. Election dates are **sample/placeholder dates** for demonstration purposes
4. The Gemini API is used in **non-streaming mode** for simplicity
5. Static translations are used for Hindi/Marathi instead of real-time Google Translate
6. The app assumes a **modern browser** with ES6+ support and Web Speech API

---

## 📸 Screenshots

*Screenshots will be added after deployment.*

| Page | Description |
|------|-------------|
| Hero Section | Welcome banner with gradient CTA |
| Timeline | Interactive 5-step election process |
| AI Chat | Conversational interface with Gemini |
| Quiz | Knowledge check with scoring |

---

## 📦 Project Structure

```
electioniq/
├── .gitignore
├── .dockerignore
├── .env.example
├── Dockerfile               ← Cloud Run container
├── cloudbuild.yaml           ← Cloud Build pipeline
├── README.md
├── package.json
├── server/
│   ├── index.js              ← Express server
│   └── routes/
│       ├── chat.js            ← Gemini chat route
│       ├── translate.js       ← i18n translations
│       ├── calendar.js        ← Calendar dates & links
│       └── search.js          ← Google Custom Search
├── public/
│   ├── index.html             ← Main page
│   ├── style.css              ← Styles
│   └── app.js                 ← Frontend logic
└── tests/
    └── app.test.js            ← Jest tests
```

---

## ☁️ Deployment (Google Cloud Run)

### Prerequisites
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and authenticated
- A GCP project with billing enabled
- APIs enabled: Cloud Run, Cloud Build, Container Registry

### Option 1 — Deploy with `gcloud` CLI

```bash
# 1. Set your project
gcloud config set project YOUR_PROJECT_ID

# 2. Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com

# 3. Build and deploy in one step
gcloud run deploy electioniq \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=your_key,GOOGLE_SEARCH_API_KEY=your_key,GOOGLE_SEARCH_ENGINE_ID=your_id"
```

### Option 2 — Deploy with Cloud Build pipeline

```bash
# Submit the build using cloudbuild.yaml
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _GEMINI_API_KEY="your_key",_GOOGLE_SEARCH_API_KEY="your_key",_GOOGLE_SEARCH_ENGINE_ID="your_id"
```

### Option 3 — Build and push manually

```bash
# 1. Build the Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/electioniq .

# 2. Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/electioniq

# 3. Deploy to Cloud Run
gcloud run deploy electioniq \
  --image gcr.io/YOUR_PROJECT_ID/electioniq \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=your_key,GOOGLE_SEARCH_API_KEY=your_key,GOOGLE_SEARCH_ENGINE_ID=your_id"
```

> **Note:** Never pass real API keys directly in shell history for production. Use [GCP Secret Manager](https://cloud.google.com/secret-manager) or Cloud Run environment variable settings in the Console instead.

---

## 📄 License

MIT License — Built for civic education and democratic awareness.
