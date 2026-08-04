import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
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
  deposit,
  trustTier,
  onClose
}) {
  const { t } = useLanguage();
  const [closing, setClosing] = useState(false);
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
                  {ownerPhone && <span className="modal-owner-phone">{ownerPhone}</span>}
                </div>
                {ownerPhone && (
                  <a className="modal-call-btn" href={`tel:${ownerPhone}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {t('card.call')}
                  </a>
                )}
              </div>
            </div>
          )}

          <p className="modal-note"><Icon name="chat" size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />{t('card.detailsNote')}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
