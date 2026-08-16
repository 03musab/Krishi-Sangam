import { useEffect, useState, useRef } from 'react';
import PageBanner from '../components/PageBanner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getConversations, getThread, sendMessage,
  getLandById, getEquipmentById, getLabourById, getProduceById
} from '../lib/api';
import { listingToModalProps } from '../lib/listingProps.jsx';
import ListingDetailsModal from '../components/ListingDetailsModal';
import Icon from '../components/Icon';

// The listing-details modal appends a context line to messages sent from it
// ("Requested help for: …"). Render that line as a distinct quoted block so
// it reads as metadata about the post, not part of the user's message.
// Anchored to the END of the content — the modal always appends the line last
// (after a blank line) — so a user's own text mentioning the phrase mid-message
// is never misquoted. Keep the prefixes in sync with the `card.msgListing`
// translation strings (English + Hindi) in i18n/translations.js.
const LISTING_LINE_RE = /(?:requested help for|इस पोस्ट के लिए सहायता मांगी गई):\s*[^\n]+\s*$/mi;
const LISTING_TITLE_RE = /(?:requested help for|इस पोस्ट के लिए सहायता मांगी गई):\s*([^\n]+)\s*$/mi;

function ListingTitleLink({ listingLine, onOpen }) {
  const m = String(listingLine).match(LISTING_TITLE_RE);
  const rest = m ? m[1].trim() : listingLine;
  // The modal appends " (location) — ₹ price/period" to the title. Strip that
  // whole tail in one shot, anchored on the em-dash that always precedes the
  // price, so parentheses that are part of the title (e.g. "Tractor (2WD)")
  // are kept. Periods may contain letters (e.g. "/day", "/hr", "/quintal").
  // 1) "Title (location) — ₹ price/period"  →  strip both
  //    [\p{L}\p{M}] matches unit words in any script, including combining
  //    vowel marks (e.g. "/day", "/hr", "/दिन", "/ঘণ্টা").
  let title = rest.replace(/\s*\([^)]*\)\s*—\s*₹?\s*[\d,.\s/]+[\p{L}\p{M}%]*$/u, '').trim();
  // 2) "Title — ₹ price/period" (no location)  →  strip just the price tail
  if (!title || title === rest) title = rest.replace(/\s*—\s*₹?\s*[\d,.\s/]+[\p{L}\p{M}%]*$/u, '').trim();
  if (!title) title = rest;
  return (
    <button type="button" className="message-listing-link" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
      <Icon name="external" size={12} style={{ verticalAlign: '-1px', marginRight: '5px' }} />
      {title.length > 42 ? `${title.slice(0, 42)}…` : title}
    </button>
  );
}

function MessageContent({ content, listingType, listingId, onOpenListing }) {
  const trimmed = String(content || '').trim();
  const m = trimmed.match(LISTING_LINE_RE);
  // The modal appends the listing line as the LAST line of the message. If the
  // phrase appears mid-message with more text after it, the user typed it
  // themselves — render the whole message as plain text rather than dropping
  // the trailing text.
  if (!m || m.index + m[0].length < trimmed.length) return <>{trimmed}</>;
  const main = trimmed.slice(0, m.index).trim();
  const listingLine = m[0].trim();
  const clickable = Boolean(listingType && listingId && onOpenListing);
  return (
    <>
      {main && <div className="message-bubble-text">{main}</div>}
      <div className="message-bubble-listing">
        <Icon name="pin" size={13} style={{ verticalAlign: '-2px', marginRight: '6px', flexShrink: 0 }} />
        {clickable ? (
          <span className="message-listing-line">
            <ListingTitleLink listingLine={listingLine} onOpen={() => onOpenListing(listingType, listingId)} />
          </span>
        ) : (
          <span className="message-listing-line">{listingLine}</span>
        )}
      </div>
    </>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [thread, setThread] = useState([]);
  const [message, setMessage] = useState('');
  const threadRef = useRef(null);
  const [viewingListing, setViewingListing] = useState(null); // { type, id }
  const [listingModal, setListingModal] = useState(null);
  const [listingLoading, setListingLoading] = useState(false);

  const loadConversations = () => {
    getConversations()
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [thread]);

  const openChat = async (otherUser) => {
    setActiveChat(otherUser);
    try {
      const d = await getThread(otherUser.id);
      setThread(d.messages || []);
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const openListing = async (type, id) => {
    setViewingListing({ type, id });
    setListingModal(null);
    setListingLoading(true);
    try {
      const fetchers = { land: getLandById, equipment: getEquipmentById, labour: getLabourById, produce: getProduceById };
      const fetcher = fetchers[type];
      if (!fetcher) throw new Error('Unknown listing type');
      const d = await fetcher(id);
      setListingModal(listingToModalProps(d.listing, type));
    } catch (err) {
      setViewingListing(null);
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setListingLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !activeChat) return;
    try {
      await sendMessage({ receiver_id: activeChat.id, content: message.trim() });
      setMessage('');
      const d = await getThread(activeChat.id);
      setThread(d.messages || []);
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <>
      <PageBanner title={t('msg.title')} color="teal" />
      <div className="messages-layout">
        <div className="conversations-list">
          {conversations.length === 0 && (
            <div className="listings-empty">{t('msg.noConversations')}</div>
          )}
          {conversations.map((cv) => (
            <div
              key={cv.other_user_id}
              className={`conversation-item ${activeChat && activeChat.id === cv.other_user_id ? 'active' : ''}`}
              onClick={() => openChat({ id: cv.other_user_id, username: cv.other_username })}
            >
              <div className="conversation-main">
                <strong>{cv.other_username}</strong>
                <span className="muted">{cv.last_message || ''}</span>
              </div>
              {cv.unread_count > 0 && <span className="unread-badge">{cv.unread_count}</span>}
            </div>
          ))}
        </div>
        <div className="message-thread">
          <div className="thread-header">{activeChat ? activeChat.username : t('msg.selectConversation')}</div>
          <div className="thread-messages" ref={threadRef}>
            {activeChat && thread.length === 0 && <div className="listings-empty">{t('msg.noMessages')}</div>}
            {thread.map((m) => {
              const isMe = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`message-row ${isMe ? 'me' : 'them'}`}>
                  <div className="message-bubble">
                    {m.image_url && (
                      <img className="message-image" src={m.image_url} alt="" loading="lazy" />
                    )}
                    {m.content && (
                      <MessageContent
                        content={m.content}
                        listingType={m.listing_type}
                        listingId={m.listing_id}
                        onOpenListing={openListing}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {activeChat && (
            <div className="thread-input">
              <input
                type="text"
                placeholder={t('msg.typeMessage')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend}>{t('msg.send')}</button>
            </div>
          )}
        </div>
      </div>

      {viewingListing && listingLoading && (
        <div className="listing-details-loader"><div className="listings-empty">{t('common.loading')}</div></div>
      )}
      {listingModal && (
        <ListingDetailsModal
          {...listingModal}
          listingType={viewingListing.type}
          listingId={viewingListing.id}
          onClose={() => setListingModal(null)}
          onOpenListing={(type, id) => openListing(type, id)}
          onMessageSent={async () => {
            // Refresh the thread so a message sent from the listing popup
            // appears in the chat immediately.
            if (activeChat) {
              try {
                const d = await getThread(activeChat.id);
                setThread(d.messages || []);
              } catch { /* keep current thread */ }
            }
          }}
        />
      )}
    </>
  );
}
