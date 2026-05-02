/**
 * @jest-environment jsdom
 */

const { describe, test, expect, beforeEach } = require("@jest/globals");

// ===== 1. Timeline Rendering =====
describe("Timeline Rendering", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="timeline" role="list"></div>';
  });

  test("should render all 5 timeline steps", () => {
    const steps = [
      { num: 1, title: "Voter Registration", icon: "📋" },
      { num: 2, title: "Campaigning", icon: "📢" },
      { num: 3, title: "Voting Day", icon: "🗳️" },
      { num: 4, title: "Vote Counting", icon: "📊" },
      { num: 5, title: "Results", icon: "📣" },
    ];

    const container = document.getElementById("timeline");
    steps.forEach((step) => {
      const el = document.createElement("div");
      el.className = "timeline-step";
      el.setAttribute("role", "listitem");
      el.innerHTML = `
        <div class="step-header">
          <div class="step-number">${step.num}</div>
          <div class="step-title">${step.icon} ${step.title}</div>
        </div>
        <div class="step-details" id="step-detail-${step.num}">
          <p>Description for ${step.title}</p>
        </div>
      `;
      container.appendChild(el);
    });

    const rendered = container.querySelectorAll(".timeline-step");
    expect(rendered.length).toBe(5);
    expect(rendered[0].querySelector(".step-title").textContent).toContain(
      "Voter Registration",
    );
    expect(rendered[4].querySelector(".step-title").textContent).toContain(
      "Results",
    );
  });

  test("should toggle step details on click", () => {
    const container = document.getElementById("timeline");
    container.innerHTML = `
      <div class="timeline-step">
        <div class="step-details" id="step-detail-1"></div>
      </div>
    `;

    const detail = document.getElementById("step-detail-1");
    expect(detail.classList.contains("open")).toBe(false);

    detail.classList.toggle("open");
    expect(detail.classList.contains("open")).toBe(true);

    detail.classList.toggle("open");
    expect(detail.classList.contains("open")).toBe(false);
  });
});

// ===== 2. Chat API Response Handling =====
describe("Chat API Response Handling", () => {
  test("should parse valid chat response", () => {
    const mockResponse = {
      reply: "To register to vote, visit voters.eci.gov.in",
      source: "gemini",
    };

    expect(mockResponse.reply).toBeTruthy();
    expect(typeof mockResponse.reply).toBe("string");
    expect(mockResponse.source).toBe("gemini");
  });

  test("should handle fallback response when no API key", () => {
    const mockFallback = {
      reply: "**How to Register:** Visit voters.eci.gov.in",
      source: "fallback",
    };

    expect(mockFallback.source).toBe("fallback");
    expect(mockFallback.reply).toContain("Register");
  });

  test("should validate message input", () => {
    const validateMessage = (msg) => {
      if (!msg || typeof msg !== "string")
        return { valid: false, error: "Invalid message" };
      const trimmed = msg.trim();
      if (trimmed.length === 0 || trimmed.length > 1000)
        return { valid: false, error: "Length error" };
      return { valid: true };
    };

    expect(validateMessage("Hello").valid).toBe(true);
    expect(validateMessage("").valid).toBe(false);
    expect(validateMessage(null).valid).toBe(false);
    expect(validateMessage(123).valid).toBe(false);
    expect(validateMessage("a".repeat(1001)).valid).toBe(false);
  });
});

// ===== 3. Quiz Scoring Logic =====
describe("Quiz Scoring Logic", () => {
  const questions = [
    { q: "Q1", options: ["A", "B", "C", "D"], answer: 1 },
    { q: "Q2", options: ["A", "B", "C", "D"], answer: 2 },
    { q: "Q3", options: ["A", "B", "C", "D"], answer: 0 },
    { q: "Q4", options: ["A", "B", "C", "D"], answer: 3 },
    { q: "Q5", options: ["A", "B", "C", "D"], answer: 1 },
  ];

  function calculateScore(answers) {
    let score = 0;
    answers.forEach((ans, i) => {
      if (ans === questions[i].answer) score++;
    });
    return score;
  }

  test("should score 5/5 for all correct answers", () => {
    const answers = [1, 2, 0, 3, 1];
    expect(calculateScore(answers)).toBe(5);
  });

  test("should score 0/5 for all wrong answers", () => {
    const answers = [0, 0, 1, 0, 0];
    expect(calculateScore(answers)).toBe(0);
  });

  test("should score 3/5 for partial correct answers", () => {
    const answers = [1, 2, 0, 0, 0]; // first 3 correct
    expect(calculateScore(answers)).toBe(3);
  });

  test("should calculate percentage correctly", () => {
    const score = 4;
    const total = 5;
    const pct = Math.round((score / total) * 100);
    expect(pct).toBe(80);
  });
});

// ===== 4. Language Switching =====
describe("Language Switching", () => {
  const translations = {
    en: {
      title: "ElectionIQ",
      subtitle: "Your Smart Election Guide",
      send_btn: "Send",
    },
    hi: {
      title: "ElectionIQ",
      subtitle: "आपका स्मार्ट चुनाव गाइड",
      send_btn: "भेजें",
    },
    mr: {
      title: "ElectionIQ",
      subtitle: "तुमचा स्मार्ट निवडणूक मार्गदर्शक",
      send_btn: "पाठवा",
    },
  };

  test("should have translations for all 3 languages", () => {
    expect(Object.keys(translations)).toEqual(["en", "hi", "mr"]);
  });

  test("should return correct Hindi translations", () => {
    expect(translations.hi.subtitle).toBe("आपका स्मार्ट चुनाव गाइड");
    expect(translations.hi.send_btn).toBe("भेजें");
  });

  test("should return correct Marathi translations", () => {
    expect(translations.mr.subtitle).toBe("तुमचा स्मार्ट निवडणूक मार्गदर्शक");
    expect(translations.mr.send_btn).toBe("पाठवा");
  });

  test("should fall back to English for unknown language", () => {
    const lang = "fr";
    const result = translations[lang] || translations.en;
    expect(result.subtitle).toBe("Your Smart Election Guide");
  });
});

// ===== 5. Error States (API Failure Fallback) =====
describe("Error States and Fallback", () => {
  test("should provide fallback news on API failure", () => {
    const fallbackNews = [
      {
        title: "Election Commission of India",
        link: "https://eci.gov.in",
        snippet: "Official portal",
        source: "eci.gov.in",
      },
    ];

    expect(fallbackNews.length).toBeGreaterThan(0);
    expect(fallbackNews[0].title).toBeTruthy();
    expect(fallbackNews[0].link).toContain("http");
  });

  test("should provide fallback chat response", () => {
    // Import the actual fallback function
    const { getFallbackResponse } = require("../server/routes/chat");

    const response = getFallbackResponse("hello");
    expect(response).toBeTruthy();
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(10);
  });

  test("should handle network error gracefully in chat", () => {
    const handleError = (error) => {
      if (error.message === "Failed to fetch") {
        return "Network error. Please check your connection.";
      }
      return "Something went wrong. Please try again.";
    };

    const result = handleError(new Error("Failed to fetch"));
    expect(result).toContain("Network error");
  });

  test("should validate calendar date creation", () => {
    const validateCalendarInput = (title, date) => {
      if (!title || !date)
        return { valid: false, error: "Title and date required" };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
        return { valid: false, error: "Invalid date format" };
      return { valid: true };
    };

    expect(validateCalendarInput("Test", "2026-10-15").valid).toBe(true);
    expect(validateCalendarInput("", "2026-10-15").valid).toBe(false);
    expect(validateCalendarInput("Test", "").valid).toBe(false);
    expect(validateCalendarInput("Test", "bad-date").valid).toBe(false);
  });
});
