import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { sendMessage } from '../lib/api';
import { memberDeposit } from '../lib/trust';
import Icon from './Icon';

// Full-detail view for a listing — shown instead of direct booking so users can
// see everything about a land / equipment listing and contact the owner.
export default function ListingDetailsModal({
  title,
  location,
  district,
  image,
  icon,
  accent,
  price,
  tags,
  description,
  ownerName,
  ownerPhone,
  ownerId,
  deposit,
  trustTier,
  listingType,
  listingId,
  onClose,
  onOpenListing,
  onMessageSent
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { navigate } = useNav();
  const { showToast } = useToast();
  const [closing, setClosing] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  // Pre-fill the composer with a friendly default so the sender can just hit
  // send — the listing context line is appended automatically on submit.
  const [msgText, setMsgText] = useState(() => t('card.msgGreeting'));
  const [msgSending, setMsgSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const closeTimer = useRef(null);

  // Every close path plays the exit animation first, then unmounts.
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(onClose, 180);
  };

  // Keep a ref pointing at the latest requestClose so the one-time Escape
  // listener never captures a stale closure (and repeated presses short-circuit
  // via the current `closing` state).
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') requestCloseRef.current(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(closeTimer.current);
    };
  }, []);

  return createPortal(
    <div className={`modal-backdrop${closing ? ' closing' : ''}`} onClick={requestClose} role="dialog" aria-modal="true" aria-label={t('card.detailsTitle')}>
      <div className={`modal-card${closing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={requestClose} aria-label="Close"><Icon name="x" size={16} /></button>

        <div className="modal-hero" style={{ background: image ? 'var(--surface-2)' : accent }}>
          {image ? (
            <img src={image} alt={title} className="modal-hero-img" />
          ) : (
            <div className="modal-hero-placeholder"><Icon name={icon} size={72} /></div>
          )}
        </div>

        <div className="modal-body">
          <h3 className="modal-title">{title}</h3>
          <div className="listing-location"><Icon name="pin" size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />{location}{district ? `, ${district}` : ''}</div>

          {tags.length > 0 && (
            <div className="listing-tags">
              {tags.map((tag, i) => (
                <span key={i} className={`tag-pill ${tag.cls}`}>{tag.text}</span>
              ))}
            </div>
          )}

          <div className="modal-price" style={{ color: price.color }}>
            ₹ {Number(price.price || 0).toLocaleString()}<span className="listing-period">{price.period}</span>
            {price.secondary && <span className="listing-price-secondary"> {price.secondary}</span>}
          </div>

          {description && (
            <div className="modal-block">
              <h4 className="modal-block-title">{t('card.description')}</h4>
              <p className="modal-text">{description}</p>
            </div>
          )}

          {Number(deposit) > 0 && (
            <div className="modal-block">
              <h4 className="modal-block-title"><Icon name="shield" size={16} style={{ verticalAlign: '-3px', marginRight: '7px' }} />{t('card.deposit')}</h4>
              <p className="modal-text">
                ₹{Number(deposit).toLocaleString()}
                {trustTier && trustTier.depositFactor < 1 && (
                  <span className="modal-deposit-discount">
                    {' '}→ {t('card.yourDeposit')} ₹{memberDeposit(deposit, trustTier).toLocaleString()}{' '}
                    <span className="modal-deposit-badge">({t('card.depositOff', { pct: Math.round((1 - trustTier.depositFactor) * 100) })})</span>
                  </span>
                )}
              </p>
            </div>
          )}

          {ownerName && (
            <div className="modal-block">
              <h4 className="modal-block-title">{t('card.postedBy')}</h4>
              <div className="modal-owner">
                <div className="modal-owner-avatar">{String(ownerName).charAt(0).toUpperCase()}</div>
                <div className="modal-owner-info">
                  <span className="modal-owner-name">{ownerName}</span>
                  {user && ownerPhone && <span className="modal-owner-phone">{ownerPhone}</span>}
                </div>
                {user && ownerPhone && (
                  <a className="modal-call-btn" href={`tel:${ownerPhone}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {t('card.call')}
                  </a>
                )}
                {user && ownerId && (
                  <button className="modal-msg-btn" onClick={() => {
                    if (Number(ownerId) === Number(user.id)) {
                      showToast(t('card.msgSelf'));
                      return;
                    }
                    setMsgOpen((o) => !o);
                  }}>
                    <Icon name="chat" size={15} />
                    {t('card.message')}
                  </button>
                )}
                {!user && ownerId && (
                  <button className="modal-msg-btn" onClick={() => navigate('signup')}>
                    <Icon name="lock" size={15} />
                    {t('gate.contactCta')}
                  </button>
                )}
              </div>
            </div>
          )}

          {user && ownerId && msgOpen && (
            <div className="modal-block">
              <h4 className="modal-block-title"><Icon name="send" size={15} style={{ verticalAlign: '-2px', marginRight: '7px' }} />{t('card.messageTitle')}</h4>
              {msgSent ? (
                <div className="modal-msg-sent">
                  <span><Icon name="check" size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />{t('card.msgSent')}</span>
                  <button className="btn-small" style={{ background: 'var(--accent-teal)' }} onClick={() => navigate('messages')}>
                    {t('card.openMessages')} →
                  </button>
                </div>
              ) : (
                <div className="modal-composer">
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder={t('card.msgPlaceholder')}
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                  />
                  <button
                    className="modal-msg-send"
                    disabled={!msgText.trim() || msgSending}
                    onClick={async () => {
                      setMsgSending(true);
                      try {
                        // Always attach the listing context so the owner knows
                        // exactly which post this message is about.
                        const fullLocation = [location, district].filter(Boolean).join(', ');
                        const listingLine = t('card.msgListing', {
                          title,
                          location: fullLocation || t('card.untitled'),
                          price: `₹ ${Number(price.price || 0).toLocaleString()}${price.period || ''}`
                        });
                        const content = `${msgText.trim()}\n\n${listingLine}`;
                        await sendMessage({
                          receiver_id: ownerId,
                          content,
                          listing_type: listingType || null,
                          listing_id: listingId || null
                        });
                        setMsgSent(true);
                        showToast(t('card.msgSent'));
                        if (typeof onMessageSent === 'function') onMessageSent();
                      } catch (err) {
                        showToast(t('common.error', { msg: err.message }));
                      } finally {
                        setMsgSending(false);
                      }
                    }}
                  >
                    {msgSending ? <span className="btn-spinner btn-spinner-sm" aria-hidden="true" /> : <Icon name="send" size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />}
                    {msgSending ? t('common.loading') : t('msg.send')}
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="modal-note"><Icon name="chat" size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />{t('card.detailsNote')}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
