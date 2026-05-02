const logger = require("../utils/logger");
const express = require("express");
const rateLimit = require("express-rate-limit");
const xss = require("xss");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(chatLimiter);

const SYSTEM_PROMPT = `You are ElectionIQ, a friendly civic education assistant helping users understand elections in India. Answer in simple language, be non-partisan, focus on process (registration, campaigning, voting, counting, results). Keep answers concise (under 300 words). Use bullet points.`;

// Tracks last generic response to avoid repeats
let lastGenericIndex = -1;

/**
 * Provides static fallback responses for election-related queries based on keyword matching.
 * @param {string} message - The user's query string.
 * @returns {string} The fallback response text.
 */
function getFallbackResponse(message) {
  const lower = (message || "").toLowerCase();

  // --- Greetings ---
  if (/^(hello|hi|hey|namaste|greetings)\b/.test(lower)) {
    return "Hello! 👋 I'm **ElectionIQ**, your civic education assistant.\n\nI can help you with:\n- 🗳️ Voter registration process\n- 📋 Eligibility & documents needed\n- 🏛️ How elections are conducted\n- 📊 Vote counting & EVMs\n- 📅 Election dates & phases\n- 🗺️ Finding polling stations\n- 🆔 Voter ID & EPIC card\n\nWhat would you like to know?";
  }

  // --- Registration ---
  if (
    lower.includes("register") ||
    lower.includes("enrollment") ||
    lower.includes("enrol")
  ) {
    return '**How to Register to Vote in India:**\n\n**Online:**\n1. Visit [voters.eci.gov.in](https://voters.eci.gov.in)\n2. Click "New Voter Registration"\n3. Fill Form 6 with personal details\n4. Upload documents & photo\n5. Submit — you\'ll get an application reference number\n\n**Offline:**\n1. Get Form 6 from your nearest Electoral Registration Office\n2. Fill it and attach passport-size photo\n3. Submit with address & age proof\n\n**Requirements:**\n- Indian citizen, 18+ years on qualifying date (Jan 1)\n- Proof of age (Aadhaar, birth certificate, passport)\n- Proof of address (utility bill, bank statement, Aadhaar)\n\n⏱️ Processing takes approximately 2-4 weeks.';
  }

  // --- Voter ID / EPIC ---
  if (
    lower.includes("voter id") ||
    lower.includes("epic") ||
    lower.includes("voter card") ||
    lower.includes("election card")
  ) {
    return "**Voter ID Card (EPIC):**\n\nThe **Electors Photo Identity Card (EPIC)** is issued by the Election Commission of India.\n\n**How to get it:**\n1. Register to vote (Form 6 at voters.eci.gov.in)\n2. Once approved, your EPIC is generated\n3. Collect from local ERO office or receive by post\n\n**If lost or damaged:**\n- Apply for a duplicate using Form 002\n- Can be done online at voters.eci.gov.in\n\n**Important:** While EPIC is the primary ID for voting, you can also use Aadhaar, Passport, PAN card, or other govt. photo IDs at the polling booth.\n\n**e-EPIC:** You can also download a digital version of your voter ID from the ECI portal.";
  }

  // --- Eligibility ---
  if (
    lower.includes("eligible") ||
    lower.includes("eligibility") ||
    lower.includes("who can vote") ||
    lower.includes("qualify")
  ) {
    return "**Who Can Vote in India?**\n\n✅ **Eligible if you:**\n- Are an Indian citizen\n- Are 18 years or older (on January 1 of the qualifying year)\n- Are a resident of the constituency\n- Are registered on the electoral roll\n- Are of sound mind and not disqualified by law\n\n❌ **Not eligible if you:**\n- Are a non-citizen\n- Are under 18\n- Have been disqualified by court order\n- Are declared of unsound mind\n\n📋 **NRI Voting:** Indian citizens living abroad can also register as overseas electors since 2011.";
  }

  // --- EVM ---
  if (
    lower.includes("evm") ||
    lower.includes("electronic voting") ||
    lower.includes("voting machine")
  ) {
    return "**Electronic Voting Machines (EVMs):**\n\n🔧 **What are EVMs?**\n- Standalone electronic devices used for casting votes\n- Used nationwide in India since 2004\n- Manufactured by Bharat Electronics Ltd (BEL) and ECIL\n\n**How they work:**\n1. **Ballot Unit** — displays candidate names & symbols; voter presses button\n2. **Control Unit** — records and stores votes; operated by polling officer\n3. **VVPAT** — prints a paper slip showing your vote (visible for 7 seconds)\n\n**Security features:**\n- Not connected to any network (no hacking possible)\n- One-time programmable chips\n- Can record max 2,000 votes\n- Battery operated — no power cut issues\n- Sealed with unique IDs before and after voting";
  }

  // --- VVPAT ---
  if (
    lower.includes("vvpat") ||
    lower.includes("paper trail") ||
    lower.includes("paper audit")
  ) {
    return "**VVPAT (Voter Verifiable Paper Audit Trail):**\n\nVVPAT is attached to the EVM and prints a small paper slip after you vote.\n\n**How it works:**\n1. You press the button on the EVM\n2. VVPAT displays a printed slip behind a glass window\n3. Slip shows candidate name, symbol, and serial number\n4. Visible for **7 seconds** before dropping into a sealed box\n\n**Why it matters:**\n- Provides a physical paper record of each vote\n- Allows verification if EVM results are challenged\n- Supreme Court mandated VVPAT matching for 5 random booths per constituency\n\nVVPAT has been used in all general elections since 2019.";
  }

  // --- NOTA ---
  if (
    lower.includes("nota") ||
    lower.includes("none of the above") ||
    lower.includes("reject all")
  ) {
    return "**NOTA (None Of The Above):**\n\nSince 2013, Indian voters have the option to choose **NOTA** on the EVM.\n\n**What it means:**\n- You're exercising your right to vote without supporting any candidate\n- It's the last button on the EVM ballot unit\n\n**Does NOTA affect results?**\n- Currently, NOTA votes are **counted but not decisive**\n- Even if NOTA gets the highest votes, the candidate with most votes wins\n- However, high NOTA counts signal public dissatisfaction\n\n**Symbol:** NOTA has its own ballot symbol — a crossed-out box designed by NID Ahmedabad.";
  }

  // --- Counting ---
  if (
    lower.includes("count") ||
    lower.includes("tally") ||
    lower.includes("how are votes")
  ) {
    return "**How Votes Are Counted in India:**\n\n📊 **Process:**\n1. **Sealing:** After voting ends, EVMs are sealed in the presence of polling agents\n2. **Storage:** Stored in strong rooms under 24/7 CCTV and security\n3. **Counting day:** Usually 3-4 days after the last phase of voting\n4. **Round-wise counting:** Votes counted in rounds of ~14 EVMs each\n5. **VVPAT verification:** 5 random booths per constituency verified against paper slips\n6. **Declaration:** Returning Officer declares results after all rounds\n\n**Who can be present?**\n- Counting agents of candidates\n- Election observers\n- Returning Officer and staff\n\n**Postal ballots** (from service voters, senior citizens, disabled) are counted first.";
  }

  // --- Election Commission ---
  if (
    lower.includes("election commission") ||
    lower.includes("eci") ||
    lower.includes("who conducts")
  ) {
    return "**Election Commission of India (ECI):**\n\n🏛️ The ECI is an **autonomous constitutional body** established under Article 324 of the Constitution.\n\n**Structure:**\n- Chief Election Commissioner (CEC)\n- Two Election Commissioners\n- Appointed by the President of India\n\n**Powers & Functions:**\n- Conducts elections to Parliament, State Legislatures, and President/VP\n- Prepares & updates electoral rolls\n- Registers political parties and allots symbols\n- Enforces Model Code of Conduct\n- Can postpone or cancel elections if needed\n\n**Key principle:** The ECI operates independently of the government to ensure free and fair elections.\n\n🌐 Official website: [eci.gov.in](https://eci.gov.in)";
  }

  // --- Model Code of Conduct ---
  if (
    lower.includes("model code") ||
    lower.includes("code of conduct") ||
    lower.includes("mcc")
  ) {
    return '**Model Code of Conduct (MCC):**\n\nThe MCC is a set of guidelines for political parties and candidates during elections.\n\n**When does it apply?**\n- From the date elections are **announced** until **results** are declared\n\n**Key rules:**\n- 🚫 No appeals based on caste or religion\n- 🚫 No use of government resources for campaigning\n- 🚫 No campaigning 48 hours before voting ("silence period")\n- 📢 Campaign meetings need prior permission\n- 💰 Spending limits enforced for each candidate\n- 🎤 No personal attacks or hate speech\n\n**Enforcement:** The ECI monitors violations and can issue warnings, FIRs, or even defer elections.';
  }

  // --- Phases / Schedule ---
  if (
    lower.includes("phase") ||
    lower.includes("schedule") ||
    lower.includes("how many days") ||
    lower.includes("stages")
  ) {
    return "**Election Phases in India:**\n\nGeneral elections are held in **multiple phases** across the country.\n\n**Why multiple phases?**\n- India has 900+ million voters — impossible to conduct in one day\n- Security forces need to be deployed to each region\n- Ensures peaceful and orderly voting\n\n**Example (2024 General Elections):**\n- 7 phases over ~6 weeks\n- Phase 1: April 19 → Phase 7: June 1\n- Results: June 4\n\n**Each phase covers:**\n- Specific states/constituencies\n- Voting happens on a single day per phase\n- Counting happens after ALL phases are complete\n\nThe Election Commission announces the full schedule well in advance.";
  }

  // --- Postal ballot ---
  if (
    lower.includes("postal") ||
    lower.includes("absentee") ||
    lower.includes("mail ballot") ||
    lower.includes("vote from home")
  ) {
    return "**Postal Ballot Voting:**\n\nCertain voters can cast their vote by post without visiting a polling station.\n\n**Who can use postal ballots?**\n- 🎖️ Armed forces personnel (Service Voters)\n- 👮 Police & election staff on duty\n- 🧓 Senior citizens (80+ years)\n- ♿ Persons with disabilities\n- 🤒 COVID-positive patients (special provisions)\n- 🔒 Preventive detention detainees\n\n**How it works:**\n1. Receive postal ballot at your registered address\n2. Mark your vote in the presence of an approved witness\n3. Seal and send back to the Returning Officer\n4. Postal ballots are counted **before** EVM votes on counting day";
  }

  // --- Deadline ---
  if (
    lower.includes("deadline") ||
    lower.includes("last date") ||
    lower.includes("miss")
  ) {
    return '**Election Deadlines & What Happens If You Miss Them:**\n\n⏰ **Key deadlines:**\n- **Voter registration:** Usually closes ~4-6 weeks before election day\n- **Nomination filing:** 2-3 weeks before voting\n- **Campaign silence period:** 48 hours before voting day\n\n**If you miss voter registration:**\n- ❌ You cannot vote in the current election\n- ✅ You can still register for **future** elections anytime\n\n**If you miss voting day:**\n- ❌ No provision for late voting\n- ✅ Plan ahead — voting hours are typically 7 AM to 6 PM\n\n💡 **Tip:** Use the "Add to Calendar" feature on this site to set reminders!';
  }

  // --- Constituency ---
  if (
    lower.includes("constituency") ||
    lower.includes("how many seats") ||
    lower.includes("lok sabha") ||
    lower.includes("rajya sabha")
  ) {
    return "**Indian Parliament — Constituencies & Seats:**\n\n🏛️ **Lok Sabha (Lower House):**\n- 543 constituencies across India\n- Each constituency elects 1 MP by direct vote\n- Members serve 5-year terms\n\n🏛️ **Rajya Sabha (Upper House):**\n- 245 members (233 elected + 12 nominated)\n- Elected by State Legislature members (not direct public vote)\n- Members serve 6-year terms (1/3 retire every 2 years)\n\n**State Elections:**\n- Each state has its own Legislative Assembly (Vidhan Sabha)\n- Total of ~4,000+ Assembly constituencies across India\n\n**Delimitation:** Constituency boundaries are redrawn by the Delimitation Commission based on Census data.";
  }

  // --- Results / Who wins ---
  if (
    lower.includes("result") ||
    lower.includes("who wins") ||
    lower.includes("majority") ||
    lower.includes("form government")
  ) {
    return "**How Election Results Work:**\n\n🏆 **Who wins a seat?**\n- The candidate with the **most votes** in a constituency wins (First Past The Post system)\n- No minimum vote percentage required\n\n**Who forms the government?**\n- The party/coalition that wins **272+ seats** (majority in 543-seat Lok Sabha) forms the government\n- The leader of the majority party becomes **Prime Minister**\n\n**What if no one gets majority?**\n- A **hung parliament** is declared\n- The President invites the largest party/coalition to form government\n- They must prove majority in a floor test within a set period\n\n📊 Results are displayed live on the ECI website on counting day.";
  }

  // --- Campaigning ---
  if (
    lower.includes("campaign") ||
    lower.includes("rally") ||
    lower.includes("propaganda") ||
    lower.includes("advertising")
  ) {
    return "**Election Campaigning in India:**\n\n📢 **Types of campaigning:**\n- Public rallies and roadshows\n- Door-to-door canvassing\n- TV, newspaper, and radio ads\n- Social media campaigns\n- Posters, banners, and pamphlets\n\n**Rules:**\n- ⏱️ Campaign period ends 48 hours before voting\n- 💰 Spending limits: ₹95 lakh (Lok Sabha), ₹40 lakh (Assembly)\n- 🚫 No religious/caste-based appeals\n- 🚫 No government resources for campaign use\n- 📝 All expenses must be reported to ECI\n\n**Social media rules (since 2019):**\n- All political ads need pre-certification\n- Paid ads must disclose the paying entity\n- Silent period applies to social media too";
  }

  // --- Booth / Polling station ---
  if (
    lower.includes("booth") ||
    lower.includes("polling station") ||
    lower.includes("where do i vote") ||
    lower.includes("where to vote")
  ) {
    return '**Finding Your Polling Station:**\n\n🗺️ **How to find it:**\n1. Visit [voters.eci.gov.in](https://voters.eci.gov.in)\n2. Enter your EPIC number or name\n3. Your assigned polling station will be displayed\n\n**You can also:**\n- Use the **"Find Polling Station"** feature on this page!\n- Call the ECI helpline: **1950**\n- Check the Voter Helpline App (available on Android & iOS)\n\n**At the polling station:**\n- Carry your Voter ID (EPIC) or any approved photo ID\n- Voting hours: typically **7:00 AM to 6:00 PM**\n- Find your name on the voter list at the entrance\n- Get your finger inked → proceed to EVM → cast vote\n\n**Facilities provided:** Ramps for disabled, drinking water, shade.';
  }

  // --- Thank you / bye ---
  if (
    lower.includes("thank") ||
    lower.includes("bye") ||
    lower.includes("goodbye") ||
    lower.includes("see you")
  ) {
    return "You're welcome! 🙏 Remember, every vote counts. Here are some useful links:\n\n- 🌐 [Election Commission of India](https://eci.gov.in)\n- 📋 [Register to Vote](https://voters.eci.gov.in)\n- 📱 Download the **Voter Helpline App**\n- ☎️ Helpline: **1950**\n\nFeel free to come back anytime you have questions about elections!";
  }

  // --- What is ElectionIQ ---
  if (
    lower.includes("what are you") ||
    lower.includes("who are you") ||
    lower.includes("what can you do") ||
    lower.includes("about you")
  ) {
    return '**I\'m ElectionIQ!** 🗳️\n\nI\'m a civic education assistant designed to help you understand how elections work in India.\n\n**I can answer questions about:**\n- Voter registration & eligibility\n- EVMs, VVPAT, and NOTA\n- Election phases and schedule\n- Vote counting process\n- Election Commission & Model Code of Conduct\n- Finding your polling station\n- Postal ballots & absentee voting\n- Lok Sabha, Rajya Sabha & constituencies\n\n**Try asking me:**\n- "How do I register to vote?"\n- "What is NOTA?"\n- "How are votes counted?"\n- "What is the Model Code of Conduct?"';
  }

  // --- Generic fallback (rotates to avoid repetition) ---
  const genericResponses = [
    '**Did you know?** 🗳️\n\nIndia is the world\'s **largest democracy** with over 900 million eligible voters!\n\n**Quick facts:**\n- First general election: 1951-52\n- Voting age was lowered from 21 to 18 in 1989\n- EVMs have been used nationwide since 2004\n- NOTA option available since 2013\n\nTry asking me specific questions like:\n- "How do I get a voter ID?"\n- "What is VVPAT?"\n- "How does the counting process work?"',

    '**Your Voice Matters!** 📢\n\nVoting is both a **right and a responsibility**. Here are things I can help with:\n\n- 📋 **"How to register?"** — Step-by-step registration guide\n- 🆔 **"Voter ID info"** — How to get or replace your EPIC card\n- ⚙️ **"How do EVMs work?"** — Understanding voting machines\n- 📊 **"Vote counting"** — The counting process explained\n- 🗺️ **"Find my polling station"** — Use the Polling Station feature above\n\nJust type your question and I\'ll do my best to help!',

    "**Election Essentials:** 🏛️\n\nHere's a quick overview of the Indian election process:\n\n1. 📋 **Registration** — Enroll on the electoral roll (18+ citizens)\n2. 📢 **Campaigning** — Parties present their agenda (Model Code of Conduct applies)\n3. 🗳️ **Voting** — Cast your vote on EVMs at assigned polling stations\n4. 📊 **Counting** — Votes counted under strict supervision with VVPAT checks\n5. 📣 **Results** — Winners declared, majority party forms government\n\nWhich step would you like to learn more about? You can also explore the **Timeline** section above!",

    '**Common Election Questions:** 💡\n\nHere are topics other users frequently ask about:\n\n- 🆔 "What documents do I need to vote?"\n- 🗳️ "What is EVM and how does it work?"\n- 📝 "What is NOTA?"\n- 📮 "Can I vote by post?"\n- 🏛️ "What does the Election Commission do?"\n- ⏰ "What if I miss the registration deadline?"\n\nPick any topic and I\'ll give you a detailed explanation! You can also try the **Quiz** section to test your knowledge. 📝',
  ];

  // Rotate through generic responses
  lastGenericIndex = (lastGenericIndex + 1) % genericResponses.length;
  return genericResponses[lastGenericIndex];
}

/**
 * Communicates with the Google Gemini API.
 * @param {string} apiKey - The Gemini API key.
 * @param {string} message - Sanitized user message.
 * @param {Array} history - Array of previous chat entries.
 * @returns {Promise<string>} The response text from Gemini.
 */
async function getGeminiResponse(apiKey, message, history) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const chatHistory = [];
  if (Array.isArray(history)) {
    for (const entry of history.slice(-10)) {
      if (entry.role && entry.text) {
        chatHistory.push({
          role: entry.role === "user" ? "user" : "model",
          parts: [{ text: xss(entry.text) }],
        });
      }
    }
  }

  const chat = model.startChat({
    history: chatHistory,
    systemInstruction: SYSTEM_PROMPT,
  });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

/**
 * Route handler for chat completion.
 */
router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Please provide a valid message." });
    }
    const sanitizedMessage = xss(message.trim());
    if (sanitizedMessage.length === 0 || sanitizedMessage.length > 1000) {
      return res
        .status(400)
        .json({ error: "Message must be 1-1000 characters." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return res.json({
        reply: getFallbackResponse(sanitizedMessage),
        source: "fallback",
      });
    }

    const reply = await getGeminiResponse(apiKey, sanitizedMessage, history);
    res.json({ reply, source: "gemini" });
  } catch (error) {
    logger.error("Chat error:", error.message);
    if (error.message?.includes("API_KEY")) {
      return res.json({
        reply: getFallbackResponse(req.body?.message || ""),
        source: "fallback",
      });
    }
    res
      .status(500)
      .json({ error: "Failed to get a response. Please try again." });
  }
});

module.exports = router;
module.exports.getFallbackResponse = getFallbackResponse;
