/* ===== ElectionIQ — Frontend App ===== */

(function () {
  'use strict';

  // ===== STATE =====
  let currentLang = 'en';
  let translations = {};
  let chatHistory = [];
  let quizState = { current: 0, score: 0, answered: false };

  // ===== QUIZ DATA (25 questions, 5 shown per session) =====
  const allactiveQuiz = [
    { q:'What is the minimum age to vote in India?', options:['16 years','18 years','21 years','25 years'], answer:1, explanation:'Every citizen 18+ on the qualifying date is eligible to vote.' },
    { q:'Which body conducts elections in India?', options:['Supreme Court','Parliament','Election Commission of India','President\'s Office'], answer:2, explanation:'The ECI is an autonomous constitutional body for administering elections.' },
    { q:'What does EVM stand for?', options:['Electronic Vote Machine','Electronic Voting Machine','Electric Voting Mechanism','Electoral Vote Manager'], answer:1, explanation:'EVM stands for Electronic Voting Machine, used nationwide since 2004.' },
    { q:'What is VVPAT?', options:['Voter Verified Paper Audit Trail','Virtual Voting Paper Authentication','Verified Vote Processing','Voter Validation Protocol'], answer:0, explanation:'VVPAT provides a paper receipt to verify your vote was recorded correctly.' },
    { q:'What is the Model Code of Conduct?', options:['A law by Parliament','Guidelines for voters','Rules for parties during elections','Constitution amendments'], answer:2, explanation:'MCC is guidelines by ECI for parties and candidates during elections.' },
    { q:'How many Lok Sabha seats are there?', options:['435','500','543','600'], answer:2, explanation:'India has 543 Lok Sabha constituencies, each electing one MP.' },
    { q:'What is NOTA?', options:['New Online Tabulation','None Of The Above','National Organization','No Official Tally'], answer:1, explanation:'NOTA lets voters reject all candidates. Available since 2013.' },
    { q:'When was the first general election in India?', options:['1947','1950','1951-52','1957'], answer:2, explanation:'India\'s first general election was held in 1951-52.' },
    { q:'Who appoints the Chief Election Commissioner?', options:['Prime Minister','Parliament','President of India','Supreme Court'], answer:2, explanation:'The CEC is appointed by the President of India.' },
    { q:'What is the qualifying date for voter registration?', options:['March 31','January 1','October 1','December 31'], answer:1, explanation:'You must be 18+ as of January 1 of the qualifying year.' },
    { q:'Which form is used for new voter registration?', options:['Form 2','Form 6','Form 8','Form 10'], answer:1, explanation:'Form 6 is used for new voter registration in India.' },
    { q:'What is the symbol for NOTA on EVM?', options:['Red cross','Blank box','Crossed ballot box','Question mark'], answer:2, explanation:'NOTA has a crossed-out ballot box symbol designed by NID Ahmedabad.' },
    { q:'How long is a Lok Sabha term?', options:['4 years','5 years','6 years','7 years'], answer:1, explanation:'A Lok Sabha term is 5 years unless dissolved earlier.' },
    { q:'What is the campaign silence period?', options:['24 hours','48 hours','72 hours','1 week'], answer:1, explanation:'No campaigning is allowed 48 hours before voting day.' },
    { q:'What color ink is used to mark voter\'s finger?', options:['Blue','Black','Purple/Indelible','Red'], answer:2, explanation:'Indelible ink (purple) is applied to prevent duplicate voting.' },
    { q:'Rajya Sabha members serve for how many years?', options:['4 years','5 years','6 years','Life'], answer:2, explanation:'Rajya Sabha members serve 6-year terms, with 1/3 retiring every 2 years.' },
    { q:'What is the ECI helpline number?', options:['100','1800','1950','112'], answer:2, explanation:'The ECI voter helpline number is 1950.' },
    { q:'Which article of the Constitution establishes ECI?', options:['Article 21','Article 324','Article 356','Article 370'], answer:1, explanation:'Article 324 establishes the Election Commission of India.' },
    { q:'Voting age was lowered from 21 to 18 in which year?', options:['1985','1989','1991','1996'], answer:1, explanation:'The 61st Amendment in 1989 lowered voting age from 21 to 18.' },
    { q:'What is the spending limit for Lok Sabha candidates?', options:['₹40 lakh','₹70 lakh','₹95 lakh','₹1 crore'], answer:2, explanation:'The current spending limit for Lok Sabha candidates is ₹95 lakh.' },
    { q:'How many members does the Rajya Sabha have?', options:['200','230','245','250'], answer:2, explanation:'Rajya Sabha has 245 members (233 elected + 12 nominated).' },
    { q:'What is postal ballot used for?', options:['Online voting','Voting by post for eligible voters','Counting votes','Voter registration'], answer:1, explanation:'Postal ballots allow armed forces, disabled, and 80+ voters to vote by post.' },
    { q:'EVMs can record a maximum of how many votes?', options:['1000','1500','2000','5000'], answer:2, explanation:'Each EVM can record a maximum of 2,000 votes.' },
    { q:'Who declares election results for a constituency?', options:['Governor','Chief Minister','Returning Officer','District Collector'], answer:2, explanation:'The Returning Officer declares the result after counting all votes.' },
    { q:'How many phases were there in 2024 Lok Sabha elections?', options:['5','6','7','8'], answer:2, explanation:'The 2024 general elections were held in 7 phases.' }
  ];
  let activeQuiz = [];
  function shuffleQuiz() {
    const shuffled = [...allactiveQuiz].sort(() => Math.random() - 0.5);
    activeQuiz = shuffled.slice(0, 5);
  }
  shuffleQuiz();

  // ===== TIMELINE DATA =====
  const timelineSteps = [
    { num: 1, key: 'registration', icon: '📋', titleKey: 'step_registration', descKey: 'reg_desc' },
    { num: 2, key: 'campaigning', icon: '📢', titleKey: 'step_campaigning', descKey: 'camp_desc' },
    { num: 3, key: 'voting', icon: '🗳️', titleKey: 'step_voting', descKey: 'vote_desc' },
    { num: 4, key: 'counting', icon: '📊', titleKey: 'step_counting', descKey: 'count_desc' },
    { num: 5, key: 'results', icon: '📣', titleKey: 'step_results', descKey: 'result_desc' }
  ];

  // ===== POLLING STATION DATA (15 cities + pincodes) =====
  const mockStations = {
    'mumbai': [
      { name: 'Shivaji Park Municipal School', address: 'Dadar West, Mumbai 400028', type: 'Municipal School', timing: '7 AM – 6 PM', booth: 'Booth 12-18' },
      { name: 'Andheri East Govt. School', address: 'Andheri East, Mumbai 400069', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 42-50' },
      { name: 'Bandra Community Hall', address: 'Hill Road, Bandra West, Mumbai 400050', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 5-11' }
    ],
    '400028': [{ name: 'Shivaji Park Municipal School', address: 'Dadar West, Mumbai 400028', type: 'Municipal School', timing: '7 AM – 6 PM', booth: 'Booth 12-18' }],
    'delhi': [
      { name: 'Sarvodaya Vidyalaya, CP', address: 'Connaught Place, New Delhi 110001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' },
      { name: 'Dwarka Sector 12 Center', address: 'Sector 12, Dwarka, Delhi 110078', type: 'Community Center', timing: '7 AM – 6 PM', booth: 'Booth 22-30' },
      { name: 'Rohini Sector 3 School', address: 'Sector 3, Rohini, Delhi 110085', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 55-62' }
    ],
    'new delhi': [
      { name: 'Sarvodaya Vidyalaya', address: 'CP, New Delhi 110001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' },
      { name: 'Lodhi Road KV', address: 'Lodhi Road, New Delhi 110003', type: 'Kendriya Vidyalaya', timing: '7 AM – 6 PM', booth: 'Booth 9-15' }
    ],
    '110001': [{ name: 'Sarvodaya Vidyalaya', address: 'CP, New Delhi 110001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' }],
    'pune': [
      { name: 'Savitribai Phule Vidyalaya', address: 'Shaniwar Peth, Pune 411030', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 20-28' },
      { name: 'Kothrud Community Hall', address: 'Paud Road, Kothrud, Pune 411038', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 33-40' }
    ],
    'bangalore': [
      { name: 'Govt. School, Koramangala', address: '5th Block, Koramangala, Bangalore 560095', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 14-20' },
      { name: 'Indiranagar Community Hall', address: '100 Feet Rd, Indiranagar, Bangalore 560038', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 5-12' }
    ],
    'bengaluru': [
      { name: 'Govt. School, Koramangala', address: '5th Block, Koramangala, Bengaluru 560095', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 14-20' },
      { name: 'Whitefield Community Center', address: 'Whitefield, Bengaluru 560066', type: 'Community Center', timing: '7 AM – 6 PM', booth: 'Booth 31-38' }
    ],
    'hyderabad': [
      { name: 'Govt. School, Charminar', address: 'Near Charminar, Hyderabad 500002', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 3-10' },
      { name: 'Jubilee Hills Community Hall', address: 'Rd No. 36, Jubilee Hills, Hyderabad 500033', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 22-28' }
    ],
    'chennai': [
      { name: 'Corporation School, T. Nagar', address: 'Pondy Bazaar, Chennai 600017', type: 'Corporation School', timing: '7 AM – 6 PM', booth: 'Booth 8-15' },
      { name: 'Adyar Community Hall', address: 'Gandhi Nagar, Adyar, Chennai 600020', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 41-48' }
    ],
    'kolkata': [
      { name: 'Ballygunge Govt. School', address: 'Gariahat Road, Kolkata 700019', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 6-12' },
      { name: 'Salt Lake Community Center', address: 'Sector V, Salt Lake, Kolkata 700091', type: 'Community Center', timing: '7 AM – 6 PM', booth: 'Booth 30-38' }
    ],
    'ahmedabad': [
      { name: 'Navrangpura Municipal School', address: 'CG Road, Ahmedabad 380009', type: 'Municipal School', timing: '7 AM – 6 PM', booth: 'Booth 10-18' },
      { name: 'Satellite Community Hall', address: 'Jodhpur Cross Road, Ahmedabad 380015', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 25-32' }
    ],
    'jaipur': [
      { name: 'Govt. School, MI Road', address: 'MI Road, Jaipur 302001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' },
      { name: 'Malviya Nagar Center', address: 'Malviya Nagar, Jaipur 302017', type: 'Community Center', timing: '7 AM – 6 PM', booth: 'Booth 15-22' }
    ],
    'lucknow': [
      { name: 'Hazratganj Govt. School', address: 'Hazratganj, Lucknow 226001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 4-10' },
      { name: 'Gomti Nagar Hall', address: 'Gomti Nagar, Lucknow 226010', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 20-28' }
    ],
    'nagpur': [
      { name: 'Dharampeth Municipal School', address: 'Dharampeth, Nagpur 440010', type: 'Municipal School', timing: '7 AM – 6 PM', booth: 'Booth 6-12' },
      { name: 'Sadar Community Hall', address: 'Sadar, Nagpur 440001', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 18-24' }
    ],
    'chandigarh': [
      { name: 'Govt. Model School, Sec 17', address: 'Sector 17, Chandigarh 160017', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-6' },
      { name: 'Sector 35 Center', address: 'Sector 35, Chandigarh 160022', type: 'Community Center', timing: '7 AM – 6 PM', booth: 'Booth 12-18' }
    ],
    'bhopal': [
      { name: 'Govt. School, New Market', address: 'TT Nagar, Bhopal 462003', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 8-14' },
      { name: 'Arera Colony Hall', address: 'Arera Colony, Bhopal 462016', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 22-28' }
    ],
    'noida': [
      { name: 'Sector 62 Govt. School', address: 'Sector 62, Noida 201309', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-10' },
      { name: 'Sector 15A Community Center', address: 'Sector 15A, Noida 201301', type: 'Community Center', timing: '7 AM – 6 PM', booth: 'Booth 11-18' }
    ],
    'gurgaon': [
      { name: 'Govt. School, Sector 14', address: 'Sector 14, Gurgaon 122001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' },
      { name: 'DLF Phase 3 Community Hall', address: 'DLF Phase 3, Gurgaon 122002', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 15-22' }
    ],
    'gurugram': [
      { name: 'Govt. School, Sector 14', address: 'Sector 14, Gurugram 122001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' },
      { name: 'Cyber City Community Center', address: 'DLF Cyber City, Gurugram 122002', type: 'Community Center', timing: '7 AM – 6 PM', booth: 'Booth 15-22' }
    ],
    'indore': [
      { name: 'Govt. School, Palasia', address: 'Palasia Square, Indore 452001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' },
      { name: 'Vijay Nagar Community Hall', address: 'Vijay Nagar, Indore 452010', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 14-20' }
    ],
    'patna': [
      { name: 'Govt. School, Boring Road', address: 'Boring Road, Patna 800001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' },
      { name: 'Kankarbagh Community Hall', address: 'Kankarbagh, Patna 800020', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 12-18' }
    ],
    'kochi': [
      { name: 'Govt. School, MG Road', address: 'MG Road, Kochi 682011', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-6' },
      { name: 'Kakkanad Community Center', address: 'Kakkanad, Kochi 682030', type: 'Community Center', timing: '7 AM – 6 PM', booth: 'Booth 10-16' }
    ],
    'coimbatore': [
      { name: 'Corporation School, RS Puram', address: 'RS Puram, Coimbatore 641002', type: 'Corporation School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' },
      { name: 'Gandhipuram Community Hall', address: 'Gandhipuram, Coimbatore 641012', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 14-20' }
    ],
    'thane': [
      { name: 'Municipal School, Naupada', address: 'Naupada, Thane 400602', type: 'Municipal School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' },
      { name: 'Ghodbunder Road Center', address: 'Ghodbunder Road, Thane 400607', type: 'Community Center', timing: '7 AM – 6 PM', booth: 'Booth 12-20' }
    ],
    'guwahati': [
      { name: 'Govt. School, Panbazar', address: 'Panbazar, Guwahati 781001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-6' },
      { name: 'GS Road Community Hall', address: 'GS Road, Guwahati 781005', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 10-16' }
    ],
    '411030': [{ name: 'Savitribai Phule Vidyalaya', address: 'Shaniwar Peth, Pune 411030', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 20-28' }],
    '560095': [{ name: 'Govt. School, Koramangala', address: 'Bengaluru 560095', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 14-20' }],
    '600017': [{ name: 'Corporation School, T. Nagar', address: 'Chennai 600017', type: 'Corporation School', timing: '7 AM – 6 PM', booth: 'Booth 8-15' }],
    '700019': [{ name: 'Ballygunge Govt. School', address: 'Kolkata 700019', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 6-12' }],
    '302001': [{ name: 'Govt. School, MI Road', address: 'Jaipur 302001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 1-8' }],
    '226001': [{ name: 'Hazratganj Govt. School', address: 'Lucknow 226001', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 4-10' }],
    'default': [
      { name: 'Ward Community Hall', address: 'Near Municipal Office, Main Road', type: 'Community Hall', timing: '7 AM – 6 PM', booth: 'Booth 1-8' },
      { name: 'Govt. Primary School', address: 'Near Bus Stand, Ward 12', type: 'Govt. School', timing: '7 AM – 6 PM', booth: 'Booth 9-16' },
      { name: 'Panchayat Bhawan', address: 'Panchayat Office Road, Ward 18', type: 'Panchayat Office', timing: '7 AM – 6 PM', booth: 'Booth 17-24' }
    ]
  };

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupTheme();
    loadTranslations('en');
    renderTimeline();
    renderQuiz();
    loadCalendarDates();
    loadNews();
    setupChat();
    setupChatSuggestions();
    setupPolling();
    setupLanguage();
    setupNavigation();
    setupScrollReveal();
  }

  // ===== THEME TOGGLE =====
  function setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('electioniq-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply saved theme, or respect OS preference, defaulting to dark
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('electioniq-theme', next);
    });
  }

  // ===== LANGUAGE =====
  async function loadTranslations(lang) {
    try {
      const res = await fetch(`/api/translate/${lang}`);
      if (!res.ok) throw new Error('Translation fetch failed');
      translations = await res.json();
      currentLang = lang;
      applyTranslations();
    } catch (e) {
      console.warn('Translation fallback:', e.message);
    }
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) el.textContent = translations[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (translations[key]) el.innerHTML = translations[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) el.placeholder = translations[key];
    });
    // Re-render all dynamic content
    renderTimeline();
    renderQuiz();
    setupChatSuggestions();
    // Update chat welcome if present
    const welcome = document.querySelector('.chat-bubble.bot');
    if (welcome && translations.chat_welcome) welcome.innerHTML = translations.chat_welcome;
  }

  function setupLanguage() {
    const dropdown = document.getElementById('lang-dropdown');
    dropdown.addEventListener('change', (e) => {
      loadTranslations(e.target.value);
    });
  }

  // ===== NAVIGATION =====
  function setupNavigation() {
    const pills = document.querySelectorAll('.nav-pill');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('-section', '');
          pills.forEach(p => p.classList.toggle('active', p.dataset.section === id));
        }
      });
    }, { threshold: 0.3, rootMargin: '-100px 0px 0px 0px' });

    document.querySelectorAll('.section').forEach(s => observer.observe(s));
  }

  // ===== TIMELINE =====
  function renderTimeline() {
    const container = document.getElementById('timeline');
    container.innerHTML = '';

    timelineSteps.forEach((step, i) => {
      const title = translations[step.titleKey] || getDefaultTitle(step.key);
      const desc = translations[step.descKey] || getDefaultDesc(step.key);

      const el = document.createElement('div');
      el.className = 'timeline-step';
      el.setAttribute('role', 'listitem');
      el.setAttribute('aria-label', `Step ${step.num}: ${title}`);
      el.setAttribute('tabindex', '0');
      el.style.animationDelay = `${i * 0.12}s`;

      el.innerHTML = `
        <div class="step-header">
          <div class="step-number">${step.num}</div>
          <div class="step-title">${step.icon} ${title}</div>
        </div>
        <div class="step-details" id="step-detail-${step.num}">
          <p>${desc}</p>
          <button class="step-read-btn" aria-label="Read aloud: ${title}" data-text="${desc}" data-i18n="read_aloud">${translations.read_aloud || 'Read Aloud'} 🔊</button>
        </div>
      `;

      el.addEventListener('click', () => toggleStep(step.num));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStep(step.num); } });

      const readBtn = el.querySelector('.step-read-btn');
      readBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        readAloud(desc, currentLang);
      });

      container.appendChild(el);
    });
  }

  function getDefaultTitle(key) {
    const map = { registration: 'Voter Registration', campaigning: 'Campaigning', voting: 'Voting Day', counting: 'Vote Counting', results: 'Results' };
    return map[key] || key;
  }

  function getDefaultDesc(key) {
    const map = {
      registration: 'Citizens register on the electoral roll to become eligible voters. You need to be 18+ and an Indian citizen.',
      campaigning: 'Political parties and candidates campaign to win voters. The Election Commission enforces a Model Code of Conduct.',
      voting: 'On voting day, registered voters go to their assigned polling station and cast their vote using EVMs.',
      counting: 'After voting ends, EVMs are sealed and transported to counting centers. Votes are counted under supervision.',
      results: 'The Returning Officer declares results for each constituency. The majority party forms the government.'
    };
    return map[key] || '';
  }

  function toggleStep(num) {
    const detail = document.getElementById(`step-detail-${num}`);
    if (detail) detail.classList.toggle('open');
  }

  // ===== TEXT-TO-SPEECH =====
  function readAloud(text, lang) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  // ===== CHAT =====
  function setupChat() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = input.value.trim();
      if (!msg) return;

      addChatBubble(msg, 'user');
      chatHistory.push({ role: 'user', text: msg });
      input.value = '';
      sendBtn.disabled = true;

      showTypingIndicator();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, history: chatHistory })
        });

        removeTypingIndicator();

        if (!res.ok) {
          const err = await res.json();
          addChatBubble(err.error || 'Something went wrong. Please try again.', 'bot');
          return;
        }

        const data = await res.json();
        addChatBubble(data.reply, 'bot');
        chatHistory.push({ role: 'model', text: data.reply });
      } catch (err) {
        removeTypingIndicator();
        addChatBubble('Network error. Please check your connection and try again.', 'bot');
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    });
  }

  function addChatBubble(text, role) {
    const container = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;

    const avatar = role === 'bot' ? '🤖' : '👤';
    // Simple markdown-like rendering for bold text
    const rendered = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

    bubble.innerHTML = `
      <span class="chat-avatar">${avatar}</span>
      <div class="chat-text">${rendered}</div>
    `;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'chat-bubble bot';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <span class="chat-avatar">🤖</span>
      <div class="chat-text">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  // ===== POLLING =====
  function setupPolling() {
    const btn = document.getElementById('poll-find-btn');
    const input = document.getElementById('poll-location-input');

    btn.addEventListener('click', () => findStation());
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') findStation(); });
  }

  function findStation() {
    const input = document.getElementById('poll-location-input');
    const loc = input.value.trim().toLowerCase();
    if (!loc) return;

    const results = document.getElementById('poll-results');
    const mapDiv = document.getElementById('poll-map');
    const iframe = document.getElementById('map-iframe');

    const stations = mockStations[loc] || mockStations['default'];

    let html = '';
    stations.forEach(s => {
      html += `
        <div class="poll-station-card">
          <h4>🏛️ ${s.name}</h4>
          <p>📍 ${s.address}</p>
          <p>🏢 Type: ${s.type}</p>
          <p>🕐 Timing: ${s.timing || '7 AM – 6 PM'}</p>
          <p>🔢 ${s.booth || 'Check voter slip for booth number'}</p>
        </div>
      `;
    });
    html += '<p style="margin-top:1rem;font-size:0.82rem;color:var(--text-secondary)">📞 ECI Helpline: <strong>1950</strong> | 🌐 <a href="https://voters.eci.gov.in" target="_blank" style="color:var(--accent-blue)">voters.eci.gov.in</a></p>';
    results.innerHTML = html;

    // Show Google Maps embed
    const query = encodeURIComponent(`polling station near ${input.value.trim()}, India`);
    iframe.src = `https://www.google.com/maps?q=${query}&output=embed`;
    mapDiv.style.display = 'block';
  }

  // ===== CALENDAR =====
  async function loadCalendarDates() {
    const grid = document.getElementById('calendar-grid');
    try {
      const res = await fetch('/api/calendar/dates');
      if (!res.ok) throw new Error('Failed to load dates');
      const dates = await res.json();

      grid.innerHTML = '';
      dates.forEach((d, i) => {
        const card = document.createElement('div');
        card.className = 'calendar-card';
        card.setAttribute('role', 'listitem');
        card.style.animationDelay = `${i * 0.1}s`;

        const dateStr = d.date.replace(/-/g, '');
        const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(d.title)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent(d.description)}`;

        const formattedDate = new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        card.innerHTML = `
          <div class="cal-icon">${d.icon}</div>
          <div class="cal-title">${d.title}</div>
          <div class="cal-date">${formattedDate}</div>
          <div class="cal-desc">${d.description}</div>
          <a href="${calUrl}" target="_blank" rel="noopener noreferrer" class="cal-add-btn" data-i18n="add_calendar">${translations.add_calendar || 'Add to Calendar'} 📅</a>
        `;
        grid.appendChild(card);
      });
    } catch (e) {
      grid.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">Could not load election dates.</p>';
    }
  }

  // ===== QUIZ =====
  function renderQuiz() {
    const card = document.getElementById('quiz-card');
    const q = activeQuiz[quizState.current];
    quizState.answered = false;

    let progressHTML = '<div class="quiz-progress">';
    activeQuiz.forEach((_, i) => {
      let cls = 'quiz-dot';
      if (i < quizState.current) cls += ' done';
      if (i === quizState.current) cls += ' active';
      progressHTML += `<div class="${cls}"></div>`;
    });
    progressHTML += '</div>';

    let optionsHTML = '';
    q.options.forEach((opt, i) => {
      optionsHTML += `<button class="quiz-option" data-index="${i}" aria-label="Option: ${opt}">${opt}</button>`;
    });

    const isLast = quizState.current === activeQuiz.length - 1;
    const btnText = isLast ? (translations.see_results || 'See Results') : (translations.next_question || 'Next Question');

    card.innerHTML = `
      ${progressHTML}
      <div class="quiz-question">${quizState.current + 1}. ${q.q}</div>
      <div class="quiz-options">${optionsHTML}</div>
      <div id="quiz-feedback"></div>
      <button class="quiz-btn" id="quiz-next-btn" disabled>${btnText}</button>
    `;

    // Option click handlers
    card.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => handleQuizAnswer(parseInt(btn.dataset.index)));
    });

    document.getElementById('quiz-next-btn').addEventListener('click', nextQuestion);
  }

  function handleQuizAnswer(selected) {
    if (quizState.answered) return;
    quizState.answered = true;

    const q = activeQuiz[quizState.current];
    const options = document.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('quiz-next-btn');

    options.forEach((opt, i) => {
      opt.disabled = true;
      if (i === q.answer) opt.classList.add('correct');
      if (i === selected && i !== q.answer) opt.classList.add('incorrect');
      if (i === selected) opt.classList.add('selected');
    });

    // Update progress dots
    const dots = document.querySelectorAll('.quiz-dot');
    if (selected === q.answer) {
      quizState.score++;
      dots[quizState.current].classList.add('done');
    } else {
      dots[quizState.current].classList.add('wrong');
    }

    feedback.innerHTML = `<div class="quiz-explanation">💡 ${q.explanation}</div>`;
    nextBtn.disabled = false;
  }

  function nextQuestion() {
    if (quizState.current < activeQuiz.length - 1) {
      quizState.current++;
      renderQuiz();
    } else {
      showQuizResults();
    }
  }

  function showQuizResults() {
    const card = document.getElementById('quiz-card');
    const total = activeQuiz.length;
    const score = quizState.score;
    const pct = Math.round((score / total) * 100);

    let msg = '';
    if (pct === 100) msg = '🏆 Perfect! You\'re a democracy expert!';
    else if (pct >= 60) msg = '👏 Great job! You know your elections well.';
    else msg = '📚 Keep learning! Explore the timeline above for more info.';

    card.innerHTML = `
      <div class="quiz-score">
        <div class="score-circle">${score}/${total}</div>
        <div class="score-label">${translations.score_text || 'Your Score'}</div>
        <div class="score-msg">${msg}</div>
        <button class="quiz-btn" id="quiz-restart-btn">${translations.restart_quiz || 'Restart Quiz'} 🔄</button>
      </div>
    `;

    document.getElementById('quiz-restart-btn').addEventListener('click', () => {
      quizState = { current: 0, score: 0, answered: false };
      shuffleQuiz();
      renderQuiz();
    });
  }

  // ===== NEWS =====
  async function loadNews() {
    const grid = document.getElementById('news-grid');
    try {
      const res = await fetch('/api/search/news');
      if (!res.ok) throw new Error('Failed to load news');
      const data = await res.json();

      grid.innerHTML = '';
      data.results.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.setAttribute('role', 'listitem');
        card.innerHTML = `
          <h4><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h4>
          <p>${item.snippet}</p>
          <span class="news-source">${item.source}</span>
        `;
        grid.appendChild(card);
      });
    } catch (e) {
      grid.innerHTML = '<p style="text-align:center;color:var(--text-secondary);grid-column:1/-1;">Could not load resources.</p>';
    }
  }
  // ===== CHAT SUGGESTION BUTTONS =====
  function setupChatSuggestions() {
    const container = document.getElementById('chat-suggestions');
    if (!container) return;
    const suggestions = [
      'How to register as voter?', 'What is EVM?', 'What is NOTA?',
      'How does counting work?', 'What is VVPAT?', 'Polling station timings?',
      'What is Model Code of Conduct?', 'Who is the CEC?',
      'How to check voter ID status?', 'What are election phases?'
    ];
    container.innerHTML = '';
    suggestions.forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'chat-suggest-btn';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        const input = document.getElementById('chat-input');
        input.value = text;
        document.getElementById('chat-form').dispatchEvent(new Event('submit'));
      });
      container.appendChild(btn);
    });
  }

  // ===== SCROLL REVEAL =====
  function setupScrollReveal() {
    document.querySelectorAll('.section').forEach(s => s.classList.add('reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

})();
