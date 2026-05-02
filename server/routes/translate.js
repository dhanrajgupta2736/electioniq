const express = require('express');
const xss = require('xss');
const router = express.Router();

const translations = {
  en: {
    title: 'ElectionIQ', subtitle: 'Your Smart Election Guide',
    nav_timeline: 'Timeline', nav_chat: 'Ask AI', nav_polling: 'Polling Station',
    nav_dates: 'Dates', nav_quiz: 'Quiz', nav_news: 'News',
    hero_title: 'Understand Democracy,<br/><span class="gradient-text">One Step at a Time</span>',
    hero_desc: 'Learn how elections work — from registration to results — with interactive guides, AI chat, and quizzes.',
    hero_cta: 'Explore the Timeline →',
    timeline_title: 'Election Timeline', chat_title: 'Ask ElectionIQ',
    quiz_title: 'Test Your Knowledge', poll_title: 'Find Your Polling Station',
    calendar_title: 'Election Dates', news_title: 'Election Resources',
    lang_label: 'Language', send_btn: 'Send',
    chat_placeholder: 'Ask about elections...',
    chat_welcome: 'Hello! I\'m <strong>ElectionIQ</strong>. Ask me anything about elections — registration, voting, counting, and more!',
    poll_placeholder_text: 'Enter your city or pincode above to find nearby polling stations.',
    footer_text: '🗳️ ElectionIQ — Empowering citizens through civic education.',
    footer_note: 'This is an educational tool. For official information, visit <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">eci.gov.in</a>',
    step_registration: 'Voter Registration', step_campaigning: 'Campaigning',
    step_voting: 'Voting Day', step_counting: 'Vote Counting', step_results: 'Results',
    reg_desc: 'Citizens register on the electoral roll to become eligible voters. You need to be 18+ and an Indian citizen. Visit voters.eci.gov.in or submit Form 6.',
    camp_desc: 'Political parties and candidates campaign to win voters. The Election Commission enforces a Model Code of Conduct to ensure fair play.',
    vote_desc: 'On voting day, registered voters go to their assigned polling station and cast their vote using EVMs (Electronic Voting Machines).',
    count_desc: 'After voting ends, EVMs are sealed and transported to counting centers. Votes are counted under strict supervision with VVPAT verification.',
    result_desc: 'The Returning Officer declares results for each constituency. The party or coalition with majority seats forms the government.',
    read_aloud: 'Read Aloud', next_question: 'Next Question', check_answer: 'Check Answer',
    see_results: 'See Results', restart_quiz: 'Restart Quiz', score_text: 'Your Score',
    add_calendar: 'Add to Calendar', find_station: 'Find Station',
    enter_location: 'Enter your city or pincode'
  },
  hi: {
    title: 'ElectionIQ', subtitle: 'आपका स्मार्ट चुनाव गाइड',
    nav_timeline: 'समयरेखा', nav_chat: 'AI से पूछें', nav_polling: 'मतदान केंद्र',
    nav_dates: 'तिथियाँ', nav_quiz: 'प्रश्नोत्तरी', nav_news: 'समाचार',
    hero_title: 'लोकतंत्र को समझें,<br/><span class="gradient-text">एक कदम एक समय</span>',
    hero_desc: 'जानें चुनाव कैसे काम करते हैं — पंजीकरण से लेकर परिणाम तक — इंटरैक्टिव गाइड, AI चैट और क्विज़ के साथ।',
    hero_cta: 'समयरेखा देखें →',
    timeline_title: 'चुनाव समयरेखा', chat_title: 'ElectionIQ से पूछें',
    quiz_title: 'अपना ज्ञान परखें', poll_title: 'अपना मतदान केंद्र खोजें',
    calendar_title: 'चुनाव तिथियाँ', news_title: 'चुनाव संसाधन',
    lang_label: 'भाषा', send_btn: 'भेजें',
    chat_placeholder: 'चुनाव के बारे में पूछें...',
    chat_welcome: 'नमस्ते! मैं <strong>ElectionIQ</strong> हूँ। मुझसे चुनाव के बारे में कुछ भी पूछें — पंजीकरण, मतदान, मतगणना और बहुत कुछ!',
    poll_placeholder_text: 'नज़दीकी मतदान केंद्र खोजने के लिए ऊपर अपना शहर या पिनकोड दर्ज करें।',
    footer_text: '🗳️ ElectionIQ — नागरिक शिक्षा के माध्यम से नागरिकों को सशक्त बनाना।',
    footer_note: 'यह एक शैक्षिक उपकरण है। आधिकारिक जानकारी के लिए <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">eci.gov.in</a> पर जाएं',
    step_registration: 'मतदाता पंजीकरण', step_campaigning: 'प्रचार अभियान',
    step_voting: 'मतदान दिवस', step_counting: 'मतगणना', step_results: 'परिणाम',
    reg_desc: 'नागरिक मतदाता सूची में पंजीकरण करते हैं। 18+ भारतीय नागरिक होना आवश्यक है। voters.eci.gov.in पर जाएं या फॉर्म 6 जमा करें।',
    camp_desc: 'राजनीतिक दल और उम्मीदवार मतदाताओं को जीतने के लिए प्रचार करते हैं। चुनाव आयोग आचार संहिता लागू करता है।',
    vote_desc: 'मतदान के दिन, पंजीकृत मतदाता अपने मतदान केंद्र पर जाकर EVM से मतदान करते हैं।',
    count_desc: 'मतदान समाप्त होने के बाद, EVM को सील करके गणना केंद्रों में ले जाया जाता है। VVPAT सत्यापन के साथ मतगणना होती है।',
    result_desc: 'रिटर्निंग ऑफिसर प्रत्येक निर्वाचन क्षेत्र के परिणाम घोषित करता है। बहुमत वाला दल सरकार बनाता है।',
    read_aloud: 'पढ़कर सुनाएं', next_question: 'अगला प्रश्न', check_answer: 'उत्तर जाँचें',
    see_results: 'परिणाम देखें', restart_quiz: 'फिर से शुरू करें', score_text: 'आपका स्कोर',
    add_calendar: 'कैलेंडर में जोड़ें', find_station: 'केंद्र खोजें',
    enter_location: 'अपना शहर या पिनकोड दर्ज करें'
  }
};

router.get('/:lang', (req, res) => {
  const lang = xss(req.params.lang);
  const data = translations[lang] || translations.en;
  res.json(data);
});

router.get('/', (req, res) => {
  res.json({ available: Object.keys(translations) });
});

module.exports = router;
module.exports.translations = translations;
