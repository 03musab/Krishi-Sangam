import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { getLand, getEquipment, getLabour, getProduce } from '../lib/api';
import Icon from './Icon';

// ── FAQ data ──────────────────────────────────────────────
// Each entry can have:
//   q, a            — translation keys for question & answer
//   keywords        — array of search keywords (lowercase)
//   action?         — { labelKey, view } for a CTA button
//   followups?      — array of { q, a, action? } for follow-up questions
//   liveData?       — function that returns dynamic data appended to the answer
//   context?        — array of view names where this FAQ should be prioritized

const FAQS = [
  {
    q: 'chatbot.faq1_q', a: 'chatbot.faq1_a',
    keywords: ['krishi sangam', 'what is', 'platform', 'about']
  },
  {
    q: 'chatbot.faq2_q', a: 'chatbot.faq2_a',
    keywords: ['free', 'cost', 'price', 'pricing', 'pay', 'payment']
  },
  {
    q: 'chatbot.faq3_q', a: 'chatbot.faq3_a',
    keywords: ['lease', 'land', 'rent land', 'farm land'],
    action: { labelKey: 'chatbot.actionLand', view: 'land-leasing' },
    context: ['land-leasing', 'list-land']
  },
  {
    q: 'chatbot.faq4_q', a: 'chatbot.faq4_a',
    keywords: ['equipment', 'tractor', 'machine', 'rent equipment', 'harvester'],
    action: { labelKey: 'chatbot.actionEquip', view: 'equipment-rental' },
    context: ['equipment-rental', 'list-equipment']
  },
  {
    q: 'chatbot.faq5_q', a: 'chatbot.faq5_a',
    keywords: ['labour', 'worker', 'hire', 'farm worker', 'labourer', 'mazdoor'],
    action: { labelKey: 'chatbot.actionLabour', view: 'labour' },
    context: ['labour', 'list-labour']
  },
  {
    q: 'chatbot.faq6_q', a: 'chatbot.faq6_a',
    keywords: ['escrow', 'transaction', 'secure', 'payment', 'protected', 'trust', 'deposit', 'safety'],
    followups: [
      { q: 'chatbot.faq6_f1_q', a: 'chatbot.faq6_f1_a' },
      { q: 'chatbot.faq6_f2_q', a: 'chatbot.faq6_f2_a' }
    ]
  },
  {
    q: 'chatbot.faq7_q', a: 'chatbot.faq7_a',
    keywords: ['sell', 'produce', 'crop', 'market', 'sell crop'],
    action: { labelKey: 'chatbot.actionProduce', view: 'list-produce' },
    context: ['produce', 'list-produce']
  },
  {
    q: 'chatbot.faq8_q', a: 'chatbot.faq8_a',
    keywords: ['buy', 'produce', 'fresh', 'crop purchase', 'shop'],
    action: { labelKey: 'chatbot.actionProduce', view: 'produce' }
  },
  {
    q: 'chatbot.faq9_q', a: 'chatbot.faq9_a',
    keywords: ['sign up', 'account', 'register', 'create account', 'join'],
    action: { labelKey: 'chatbot.actionSignup', view: 'signup' }
  },
  {
    q: 'chatbot.faq10_q', a: 'chatbot.faq10_a',
    keywords: ['privacy', 'safe', 'data', 'personal', 'secure', 'information']
  },
  {
    q: 'chatbot.faq11_q', a: 'chatbot.faq11_a',
    keywords: ['contact', 'support', 'phone', 'email', 'reach', 'help', 'call'],
    followups: [
      { q: 'chatbot.faq11_f1_q', a: 'chatbot.faq11_f1_a' }
    ]
  },
  {
    q: 'chatbot.faq12_q', a: 'chatbot.faq12_a',
    keywords: ['booking', 'cancel', 'my booking', 'status'],
    action: { labelKey: 'chatbot.actionBookings', view: 'bookings' }
  },
  {
    q: 'chatbot.faq13_q', a: 'chatbot.faq13_a',
    keywords: ['list land', 'post land', 'add land'],
    action: { labelKey: 'chatbot.actionListLand', view: 'list-land' }
  },
  {
    q: 'chatbot.faq14_q', a: 'chatbot.faq14_a',
    keywords: ['list equipment', 'post equipment', 'add equipment', 'rent out'],
    action: { labelKey: 'chatbot.actionListEquip', view: 'list-equipment' }
  }
];

const GREETING = 'chatbot.greeting';
const SUGGESTION = 'chatbot.suggestion';
const TYPING_DELAY = 600; // ms
const NOTIF_FIRST_DELAY = 2500;   // ms before the first bubble
const NOTIF_REPEAT = 3 * 60 * 1000; // reappear every 3 minutes
const NOTIF_VISIBLE_MS = 12000;   // how long each bubble stays

// ── Helper: get a human-readable listing count from the API ──
async function fetchListingCounts() {
  try {
    const [land, equip, lab, prod] = await Promise.all([
      getLand().catch(() => ({ listings: [] })),
      getEquipment().catch(() => ({ listings: [] })),
      getLabour().catch(() => ({ listings: [] })),
      getProduce().catch(() => ({ listings: [] }))
    ]);
    return {
      land: land.listings?.length || 0,
      equipment: equip.listings?.length || 0,
      labour: lab.listings?.length || 0,
      produce: prod.listings?.length || 0
    };
  } catch {
    return null;
  }
}

// ── Soft two-tone notification chime (Web Audio, no asset needed) ──
// Autoplay policies may block it until the user interacts with the page;
// in that case it fails silently and the visual bubble still shows.
function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [880, 1318.5]; // A5 → E6, a friendly "ding-ding"
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + i * 0.18;
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.1, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1400);
  } catch { /* blocked or unsupported — ignore */ }
}

export default function Chatbot() {
  const { t } = useLanguage();
  const { navigate, view } = useNav();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showFaqs, setShowFaqs] = useState(true);
  const [input, setInput] = useState('');
  const [faqFilter, setFaqFilter] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const engagedRef = useRef(false); // user opened the chat — stop reminding

  // ── Greeting ──
  useEffect(() => {
    if (open && messages.length === 0) {
      const isLoggedIn = !!user;
      const greetingText = isLoggedIn
        ? t('chatbot.greetingLoggedIn', { name: user.username || user.full_name || '' })
        : t(GREETING);
      setMessages([
        { role: 'bot', text: greetingText },
        { role: 'bot', text: t(SUGGESTION) }
      ]);
    }
  }, [open, messages.length, t, user]);

  // ── "I'm a chatbot" notification ──
  // Pops up shortly after the page loads (if the chat isn't open), plays a
  // soft chime, auto-hides after a while, and reappears every few minutes
  // until the user opens the chat or clicks the bubble.
  useEffect(() => {
    if (open) return;
    let hideTimer = null;

    const show = () => {
      if (engagedRef.current) return;
      setNotifVisible(true);
      playChime();
      hideTimer = setTimeout(() => setNotifVisible(false), NOTIF_VISIBLE_MS);
    };

    const showTimer = setTimeout(show, NOTIF_FIRST_DELAY);
    const repeatTimer = setInterval(show, NOTIF_REPEAT);

    return () => {
      clearTimeout(showTimer);
      clearInterval(repeatTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [open]);

  const dismissNotif = () => {
    engagedRef.current = true;
    setNotifVisible(false);
  };

  const handleToggle = () => {
    const next = !open;
    if (next) dismissNotif();
    setOpen(next);
  };

  const openFromNotif = () => {
    dismissNotif();
    setOpen(true);
  };

  // Scroll to bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // ── Context-aware suggestions: boost FAQs relevant to the current page ──
  const getContextBoostedFaqs = useCallback(() => {
    if (!view) return FAQS;
    const boosted = [];
    const normal = [];
    for (const faq of FAQS) {
      if (faq.context?.includes(view)) {
        boosted.push(faq);
      } else {
        normal.push(faq);
      }
    }
    return [...boosted, ...normal];
  }, [view]);

  // ── Smart keyword matching ──
  const findBestMatch = useCallback((query) => {
    const lower = query.toLowerCase().trim();
    if (!lower) return null;

    // Score each FAQ by how many keywords match
    let best = null;
    let bestScore = 0;

    for (const faq of FAQS) {
      const question = t(faq.q).toLowerCase();
      const answer = t(faq.a).toLowerCase();
      const keywords = faq.keywords || [];

      let score = 0;

      // Check if the query contains the question (or vice versa)
      if (question.includes(lower) || lower.includes(question)) score += 5;
      if (answer.includes(lower)) score += 2;

      // Check keywords
      for (const kw of keywords) {
        if (lower.includes(kw)) score += 3;
        if (kw.includes(lower)) score += 1;
      }

      // Word-level matching for multi-word queries
      const queryWords = lower.split(/\s+/).filter(Boolean);
      for (const word of queryWords) {
        if (word.length < 3) continue;
        if (question.includes(word)) score += 1;
        if (answer.includes(word)) score += 0.5;
        for (const kw of keywords) {
          if (kw.includes(word)) score += 1;
        }
      }

      // Context boost
      if (faq.context?.includes(view)) score += 2;

      if (score > bestScore) {
        bestScore = score;
        best = faq;
      }
    }

    return best && bestScore >= 2 ? best : null;
  }, [t, view]);

  // ── Send a message ──
  const addBotMessage = useCallback((text, faq = null) => {
    setMessages((prev) => [...prev, { role: 'bot', text, faq }]);
  }, []);

  const handleSend = useCallback(async () => {
    const q = input.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    setShowFaqs(false);
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, TYPING_DELAY));

    const matched = findBestMatch(q);

    if (matched) {
      let answer = t(matched.a);

      // Add listing counts if relevant
      if (matched.keywords?.some((k) => ['land', 'lease', 'equipment', 'tractor', 'labour', 'produce', 'crop'].includes(k))) {
        const counts = await fetchListingCounts();
        if (counts) {
          const relevant = [];
          if (matched.keywords?.some((k) => ['land', 'lease'].includes(k))) relevant.push(`🌾 ${t('chatbot.xListings', { n: counts.land, type: t('nav.land') })}`);
          if (matched.keywords?.some((k) => ['equipment', 'tractor', 'machine'].includes(k))) relevant.push(`🚜 ${t('chatbot.xListings', { n: counts.equipment, type: t('nav.equipment') })}`);
          if (matched.keywords?.some((k) => ['labour', 'worker'].includes(k))) relevant.push(`👷 ${t('chatbot.xListings', { n: counts.labour, type: t('nav.labour') })}`);
          if (matched.keywords?.some((k) => ['produce', 'crop', 'buy', 'sell'].includes(k))) relevant.push(`🌱 ${t('chatbot.xListings', { n: counts.produce, type: t('nav.produce') })}`);
          if (relevant.length > 0) {
            answer += '\n\n' + relevant.join('\n');
          }
        }
      }

      setIsTyping(false);
      addBotMessage(answer, matched);

      // Show follow-up questions if available
      if (matched.followups && matched.followups.length > 0) {
        setTimeout(() => {
          addBotMessage(t('chatbot.followupPrompt'));
          for (const f of matched.followups) {
            addBotMessage(t(f.q), { ...f, isFollowup: true });
          }
        }, 400);
      }
    } else {
      setIsTyping(false);
      addBotMessage(t('chatbot.noMatch'));
    }
  }, [input, findBestMatch, t, addBotMessage, view]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  // ── Pick a FAQ chip (from the quick-pick area or a follow-up) ──
  const pickFaq = useCallback((faq) => {
    setMessages((prev) => [...prev, { role: 'user', text: t(faq.q) }]);
    setShowFaqs(false);
    setFaqFilter('');

    // Simulate thinking
    setIsTyping(true);
    setTimeout(async () => {
      let answer = t(faq.a);

      // Fetch live counts if relevant
      if (faq.keywords?.some((k) => ['land', 'lease', 'equipment', 'tractor', 'labour', 'produce', 'crop', 'buy', 'sell'].includes(k))) {
        const counts = await fetchListingCounts();
        if (counts) {
          const relevant = [];
          if (faq.keywords?.some((k) => ['land', 'lease'].includes(k))) relevant.push(`🌾 ${t('chatbot.xListings', { n: counts.land, type: t('nav.land') })}`);
          if (faq.keywords?.some((k) => ['equipment', 'tractor', 'machine'].includes(k))) relevant.push(`🚜 ${t('chatbot.xListings', { n: counts.equipment, type: t('nav.equipment') })}`);
          if (faq.keywords?.some((k) => ['labour', 'worker'].includes(k))) relevant.push(`👷 ${t('chatbot.xListings', { n: counts.labour, type: t('nav.labour') })}`);
          if (faq.keywords?.some((k) => ['produce', 'crop', 'buy', 'sell'].includes(k))) relevant.push(`🌱 ${t('chatbot.xListings', { n: counts.produce, type: t('nav.produce') })}`);
          if (relevant.length > 0) {
            answer += '\n\n' + relevant.join('\n');
          }
        }
      }

      setIsTyping(false);
      addBotMessage(answer, faq);

      // Show follow-ups
      if (faq.followups && faq.followups.length > 0) {
        setTimeout(() => {
          addBotMessage(t('chatbot.followupPrompt'));
          for (const f of faq.followups) {
            addBotMessage(t(f.q), { ...f, isFollowup: true });
          }
        }, 400);
      }
    }, TYPING_DELAY);
  }, [t, addBotMessage]);

  const handleAction = (viewName) => {
    navigate(viewName);
    setOpen(false);
  };

  // Filter FAQs
  const filteredFaqs = getContextBoostedFaqs().filter((faq) => {
    if (!faqFilter.trim()) return true;
    const lower = faqFilter.toLowerCase();
    const q = t(faq.q).toLowerCase();
    const a = t(faq.a).toLowerCase();
    const kw = (faq.keywords || []).join(' ').toLowerCase();
    return q.includes(lower) || a.includes(lower) || kw.includes(lower);
  });

  // ── Render message (handles both text bubbles and follow-up chips) ──
  const renderMessage = (msg, i) => {
    if (msg.isFollowup) {
      // Follow-up chips are rendered as clickable buttons
      return (
        <div key={i} className="chatbot-msg chatbot-msg-bot">
          <button
            className="chatbot-followup-chip"
            onClick={() => pickFaq(msg.faq || msg)}
          >
            {msg.text}
          </button>
        </div>
      );
    }

    return (
      <div key={i} className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}>
        <div className="chatbot-bubble">
          {msg.text}
          {msg.faq?.action && (
            <button
              className="chatbot-action-btn"
              onClick={() => handleAction(msg.faq.action.view)}
            >
              {t(msg.faq.action.labelKey)} →
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Notification bubble inviting users to try the chatbot */}
      {!open && notifVisible && (
        <button className="chatbot-notif" onClick={openFromNotif}>
          <span className="chatbot-notif-text">{t('chatbot.notifText')}</span>
          <span className="chatbot-notif-tail" aria-hidden="true" />
        </button>
      )}

      {/* Toggle button */}
      <button
        className={`chatbot-toggle ${open ? 'is-open' : ''}`}
        onClick={handleToggle}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {!open && notifVisible && <span className="chatbot-notif-dot" aria-hidden="true" />}
        {open ? (
          <Icon name="x" size={24} strokeWidth={2.2} />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="10" x2="15" y2="10" />
            <line x1="12" y1="7" x2="12" y2="13" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <Icon name="leaf" size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div className="chatbot-header-title">Krishi Sangam</div>
                <div className="chatbot-header-status">{t('chatbot.statusOnline')}</div>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setOpen(false)} aria-label="Close">
              <Icon name="x" size={18} strokeWidth={2.2} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-body" ref={listRef}>
            {messages.map((msg, i) => renderMessage(msg, i))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="chatbot-msg chatbot-msg-bot">
                <div className="chatbot-typing">
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                </div>
              </div>
            )}

            {/* FAQ quick-pick area */}
            {showFaqs && messages.length <= 2 && (
              <div className="chatbot-faq-area">
                <div className="chatbot-faq-search">
                  <input
                    className="chatbot-faq-input"
                    placeholder={t('chatbot.searchPlaceholder')}
                    value={faqFilter}
                    onChange={(e) => setFaqFilter(e.target.value)}
                  />
                </div>
                <div className="chatbot-faq-list">
                  {filteredFaqs.map((faq, i) => (
                    <button key={i} className="chatbot-faq-chip" onClick={() => pickFaq(faq)}>
                      {t(faq.q)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="chatbot-footer">
            <input
              ref={inputRef}
              className="chatbot-input"
              placeholder={t('chatbot.inputPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              className="chatbot-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              aria-label="Send"
            >
              <Icon name="send" size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}