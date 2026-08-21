import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { getLand, getEquipment, getLabour, getProduce } from '../lib/api';
import Icon from './Icon';

// ── FAQ data ──────────────────────────────────────────────
const FAQS = [
  {
    q: 'chatbot.faq1_q', a: 'chatbot.faq1_a',
    keywords: ['krishi sangam', 'what is', 'platform', 'about'],
    followups: [
      { q: 'chatbot.faq2_q', a: 'chatbot.faq2_a' },
      { q: 'chatbot.faq9_q', a: 'chatbot.faq9_a' }
    ]
  },
  {
    q: 'chatbot.faq2_q', a: 'chatbot.faq2_a',
    keywords: ['free', 'cost', 'price', 'pricing', 'pay', 'payment'],
    followups: [
      { q: 'chatbot.faq6_q', a: 'chatbot.faq6_a' }
    ]
  },
  {
    q: 'chatbot.faq3_q', a: 'chatbot.faq3_a',
    keywords: ['lease', 'land', 'rent land', 'farm land'],
    action: { labelKey: 'chatbot.actionLand', view: 'land-leasing' },
    context: ['land-leasing', 'list-land'],
    followups: [
      { q: 'chatbot.faq3_f1_q', a: 'chatbot.faq3_f1_a' },
      { q: 'chatbot.faq3_f2_q', a: 'chatbot.faq3_f2_a' },
      { q: 'chatbot.faq13_q', a: 'chatbot.faq13_a' }
    ]
  },
  {
    q: 'chatbot.faq4_q', a: 'chatbot.faq4_a',
    keywords: ['equipment', 'tractor', 'machine', 'rent equipment', 'harvester'],
    action: { labelKey: 'chatbot.actionEquip', view: 'equipment-rental' },
    context: ['equipment-rental', 'list-equipment', 'farm-services'],
    followups: [
      { q: 'chatbot.faq4_f1_q', a: 'chatbot.faq4_f1_a' },
      { q: 'chatbot.faq4_f2_q', a: 'chatbot.faq4_f2_a' },
      { q: 'chatbot.faq14_q', a: 'chatbot.faq14_a' }
    ]
  },
  {
    q: 'chatbot.faq5_q', a: 'chatbot.faq5_a',
    keywords: ['labour', 'worker', 'hire', 'farm worker', 'labourer', 'mazdoor'],
    action: { labelKey: 'chatbot.actionLabour', view: 'labour' },
    context: ['labour', 'list-labour', 'farm-services'],
    followups: [
      { q: 'chatbot.faq5_f1_q', a: 'chatbot.faq5_f1_a' },
      { q: 'chatbot.faq5_f2_q', a: 'chatbot.faq5_f2_a' }
    ]
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
    context: ['produce', 'list-produce'],
    followups: [
      { q: 'chatbot.faq7_f1_q', a: 'chatbot.faq7_f1_a' },
      { q: 'chatbot.faq7_f2_q', a: 'chatbot.faq7_f2_a' },
      { q: 'chatbot.faq8_q', a: 'chatbot.faq8_a' }
    ]
  },
  {
    q: 'chatbot.faq8_q', a: 'chatbot.faq8_a',
    keywords: ['buy', 'produce', 'fresh', 'crop purchase', 'shop'],
    action: { labelKey: 'chatbot.actionProduce', view: 'produce' },
    followups: [
      { q: 'chatbot.faq8_f1_q', a: 'chatbot.faq8_f1_a' },
      { q: 'chatbot.faq7_q', a: 'chatbot.faq7_a' }
    ]
  },
  {
    q: 'chatbot.faq9_q', a: 'chatbot.faq9_a',
    keywords: ['sign up', 'account', 'register', 'create account', 'join'],
    action: { labelKey: 'chatbot.actionSignup', view: 'signup' },
    followups: [
      { q: 'chatbot.faq9_f1_q', a: 'chatbot.faq9_f1_a' },
      { q: 'chatbot.faq10_q', a: 'chatbot.faq10_a' }
    ]
  },
  {
    q: 'chatbot.faq10_q', a: 'chatbot.faq10_a',
    keywords: ['privacy', 'safe', 'data', 'personal', 'secure', 'information'],
    followups: [
      { q: 'chatbot.faq10_f1_q', a: 'chatbot.faq10_f1_a' }
    ]
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
    action: { labelKey: 'chatbot.actionBookings', view: 'bookings' },
    followups: [
      { q: 'chatbot.faq12_f1_q', a: 'chatbot.faq12_f1_a' },
      { q: 'chatbot.faq12_f2_q', a: 'chatbot.faq12_f2_a' }
    ]
  },
  {
    q: 'chatbot.faq13_q', a: 'chatbot.faq13_a',
    keywords: ['list land', 'post land', 'add land'],
    action: { labelKey: 'chatbot.actionListLand', view: 'list-land' },
    followups: [
      { q: 'chatbot.faq13_f1_q', a: 'chatbot.faq13_f1_a' },
      { q: 'chatbot.faq3_q', a: 'chatbot.faq3_a' }
    ]
  },
  {
    q: 'chatbot.faq14_q', a: 'chatbot.faq14_a',
    keywords: ['list equipment', 'post equipment', 'add equipment', 'rent out'],
    action: { labelKey: 'chatbot.actionListEquip', view: 'list-equipment' },
    followups: [
      { q: 'chatbot.faq14_f1_q', a: 'chatbot.faq14_f1_a' },
      { q: 'chatbot.faq4_q', a: 'chatbot.faq4_a' }
    ]
  }
];

const GREETING = 'chatbot.greeting';
const SUGGESTION = 'chatbot.suggestion';
const TYPING_DELAY = 500;
const NOTIF_FIRST_DELAY = 2500;
const NOTIF_REPEAT = 3 * 60 * 1000;
const NOTIF_VISIBLE_MS = 12000;

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

function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [880, 1318.5];
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
  } catch { /* ignore */ }
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
  const engagedRef = useRef(false);

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

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping, showFaqs]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

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

  // Generate ONLY questions directly related to the question being asked
  const getSuggestionsForFaq = useCallback((faq) => {
    if (faq?.followups && faq.followups.length > 0) {
      return faq.followups.map((f) => ({
        q: f.q,
        a: f.a,
        action: f.action,
        keywords: f.keywords
      }));
    }

    if (!faq) return [];

    const categoryKeywords = ['land', 'lease', 'equipment', 'tractor', 'labour', 'worker', 'escrow', 'payment', 'produce', 'crop', 'support', 'booking', 'account'];
    const currentKw = (faq.keywords || []).filter((k) => categoryKeywords.includes(k));

    if (currentKw.length === 0) return [];

    const related = FAQS.filter((f) => {
      if (f.q === faq.q) return false;
      const otherKw = f.keywords || [];
      return currentKw.some((k) => otherKw.includes(k));
    });

    return related.slice(0, 3);
  }, []);

  const findBestMatch = useCallback((query) => {
    const lower = query.toLowerCase().trim();
    if (!lower) return null;

    let best = null;
    let bestScore = 0;

    for (const faq of FAQS) {
      const question = t(faq.q).toLowerCase();
      const answer = t(faq.a).toLowerCase();
      const keywords = faq.keywords || [];

      let score = 0;

      if (question.includes(lower) || lower.includes(question)) score += 5;
      if (answer.includes(lower)) score += 2;

      for (const kw of keywords) {
        if (lower.includes(kw)) score += 3;
        if (kw.includes(lower)) score += 1;
      }

      const queryWords = lower.split(/\s+/).filter(Boolean);
      for (const word of queryWords) {
        if (word.length < 3) continue;
        if (question.includes(word)) score += 1;
        if (answer.includes(word)) score += 0.5;
        for (const kw of keywords) {
          if (kw.includes(word)) score += 1;
        }
      }

      if (faq.context?.includes(view)) score += 2;

      if (score > bestScore) {
        bestScore = score;
        best = faq;
      }
    }

    return best && bestScore >= 2 ? best : null;
  }, [t, view]);

  const addBotMessage = useCallback((text, faq = null, suggestions = []) => {
    setMessages((prev) => [...prev, { role: 'bot', text, faq, suggestions }]);
  }, []);

  const handleSend = useCallback(async () => {
    const q = input.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    setShowFaqs(false); // Hide initial topic tray after first question
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, TYPING_DELAY));

    const matched = findBestMatch(q);

    if (matched) {
      let answer = t(matched.a);

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
      const suggestions = getSuggestionsForFaq(matched);
      addBotMessage(answer, matched, suggestions);
    } else {
      setIsTyping(false);
      addBotMessage(t('chatbot.noMatch'), null, []);
    }
  }, [input, findBestMatch, t, addBotMessage, getSuggestionsForFaq]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const pickFaq = useCallback((faq) => {
    setMessages((prev) => [...prev, { role: 'user', text: t(faq.q) }]);
    setFaqFilter('');
    setShowFaqs(false); // Hide initial topic tray after first question

    setIsTyping(true);
    setTimeout(async () => {
      let answer = t(faq.a);

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
      const suggestions = getSuggestionsForFaq(faq);
      addBotMessage(answer, faq, suggestions);
    }, TYPING_DELAY);
  }, [t, addBotMessage, getSuggestionsForFaq]);

  const handleAction = (viewName) => {
    navigate(viewName);
    setOpen(false);
  };

  const filteredFaqs = getContextBoostedFaqs().filter((faq) => {
    if (!faqFilter.trim()) return true;
    const lower = faqFilter.toLowerCase();
    const q = t(faq.q).toLowerCase();
    const a = t(faq.a).toLowerCase();
    const kw = (faq.keywords || []).join(' ').toLowerCase();
    return q.includes(lower) || a.includes(lower) || kw.includes(lower);
  });

  const renderMessage = (msg, i) => {
    return (
      <div key={i} className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}>
        <div className="chatbot-bubble">
          {msg.text}

          {msg.faq?.action && (
            <button
              className="chatbot-action-btn"
              onClick={() => handleAction(msg.faq.action.view)}
              style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {t(msg.faq.action.labelKey)} →
            </button>
          )}

          {/* Render ONLY related follow-up questions directly under the answer */}
          {msg.suggestions && msg.suggestions.length > 0 && (
            <div className="chatbot-suggestions-box" style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                💡 {t('chatbot.followupPrompt', 'You might also want to know:')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {msg.suggestions.map((sFaq, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    className="chatbot-followup-chip"
                    onClick={() => pickFaq(sFaq)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      borderRadius: '16px',
                      padding: '6px 12px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease shadow'
                    }}
                  >
                    {t(sFaq.q)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {!open && notifVisible && (
        <button className="chatbot-notif" onClick={openFromNotif}>
          <span className="chatbot-notif-text">{t('chatbot.notifText')}</span>
          <span className="chatbot-notif-tail" aria-hidden="true" />
        </button>
      )}

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

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <Icon name="leaf" size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div className="chatbot-header-title">Krishi Sangam</div>
                <div className="chatbot-header-status">{t('chatbot.statusOnline')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="chatbot-topic-toggle-btn"
                onClick={() => setShowFaqs((prev) => !prev)}
                style={{
                  background: showFaqs ? '#dcfce7' : '#f1f5f9',
                  color: showFaqs ? '#15803d' : '#475569',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                💡 {showFaqs ? 'Hide Topics' : 'Topics'}
              </button>

              <button className="chatbot-close-btn" onClick={() => setOpen(false)} aria-label="Close">
                <Icon name="x" size={18} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <div className="chatbot-body" ref={listRef}>
            {messages.map((msg, i) => renderMessage(msg, i))}

            {isTyping && (
              <div className="chatbot-msg chatbot-msg-bot">
                <div className="chatbot-typing">
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                </div>
              </div>
            )}

            {/* General FAQ tray — shown at start, automatically hidden after the first question is asked */}
            {showFaqs && (
              <div className="chatbot-faq-area" style={{ marginTop: '12px' }}>
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