import { useState, useOptimistic, startTransition } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { createBooking } from '../lib/api';
import { memberDeposit } from '../lib/trust';
import ListingDetailsModal from './ListingDetailsModal';
import AuthGateModal from './AuthGateModal';
import { listingToModalProps } from '../lib/listingProps.jsx';
import Icon from './Icon';

function escapeHtml(s) {
  if (!s) return '';
  return String(s);
}

export default function ListingCard({ listing, type, onBook, trustTier }) {
  const { user } = useAuth();
  const { navigate } = useNav();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [status, setStatus] = useState('idle'); // 'idle' | 'booked'
  const [optimisticStatus, addOptimistic] = useOptimistic(status, (_, value) => value);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const handleBook = (e) => {
    e.stopPropagation();
    if (onBook) { onBook(); return; }
    if (!user) {
      showToast(t('common.pleaseSignin'));
      navigate('signin');
      return;
    }
    const title = listing.title || listing.name || listing.crop_name || listing.worker_name || 'Item';
    if (!window.confirm(t('card.confirmBook', { title }))) return;
    startTransition(async () => {
      addOptimistic('pending'); // instant UI feedback — button flips to "Booking…"
      try {
        await createBooking({ listing_type: type, listing_id: listing.id });
        setStatus('booked'); // real state settles, button shows "Booked ✓"
        showToast(t('common.toast.created'));
      } catch (err) {
        showToast(t('common.error', { msg: err.message }));
        // no real state update → optimistic change reverts automatically
      }
    });
  };

  const modalProps = listingToModalProps(listing, type);
  const price = modalProps.price;
  const title = modalProps.title;
  const location = modalProps.location;
  const district = modalProps.district;
  const placeholderIcon = modalProps.icon;
  const tags = modalProps.tags;
  const accent = modalProps.accent;
  const isPending = optimisticStatus === 'pending';
  const isBooked = optimisticStatus === 'booked';
  // Land, equipment & produce can't be booked directly — users get full details and owner contact instead
  const isDetailsType = type === 'land' || type === 'equipment' || type === 'produce';
  const baseLabel = isDetailsType ? t('card.getDetails') : type === 'labour' ? t('card.hire') : t('card.buy');
  const btnLabel = isDetailsType ? baseLabel : (isBooked ? t('card.booked') : isPending ? t('card.booking') : baseLabel);
  const btnColor = price.color;

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (isDetailsType) {
      // Details (and owner contact) are for members — logged-out visitors are
      // asked to create an account instead.
      if (!user) { setGateOpen(true); return; }
      setDetailsOpen(true);
      return;
    }
    handleBook(e);
  };

  return (
    <div className="listing-card">
      <div className="listing-img-wrap">
        {listing.photo_url ? (
          <img src={listing.photo_url} alt={title} className="listing-img" />
        ) : (
          <div className="listing-img-placeholder" style={{ background: accent }}><Icon name={placeholderIcon} size={52} /></div>
        )}
        {type === 'equipment' && listing.with_operator ? (
          <span className="listing-badge"><Icon name="user" size={12} style={{ verticalAlign: '-1px', marginRight: '5px' }} />{t('card.withOperator')}</span>
        ) : null}
      </div>
      <div className="listing-body">
        <h3 className="listing-title">{escapeHtml(title)}</h3>
        <div className="listing-location"><Icon name="pin" size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />{location}{district ? `, ${district}` : ''}{listing._distanceKm != null && (
          <span className="listing-distance">{t('loc.distanceKm', { km: listing._distanceKm })}</span>
        )}</div>
        <div className="listing-tags">
          {listing._nearby && <span className="tag-pill tag-green">{t('loc.near')}</span>}
          {tags.map((t, i) => (
            <span key={i} className={`tag-pill ${t.cls}`}>{t.text}</span>
          ))}
        </div>
        {type === 'equipment' && Number(listing.deposit) > 0 && (
          <div className="listing-deposit">
            <span className="listing-deposit-full"><Icon name="shield" size={13} style={{ verticalAlign: '-2px', marginRight: '6px' }} />{t('card.deposit')}: ₹{Number(listing.deposit).toLocaleString()}</span>
            {trustTier && trustTier.depositFactor < 1 && (
              <span className="listing-deposit-discount">
                {t('card.yourDeposit')}: ₹{memberDeposit(listing.deposit, trustTier).toLocaleString()}{' '}
                ({t('card.depositOff', { pct: Math.round((1 - trustTier.depositFactor) * 100) })})
              </span>
            )}
          </div>
        )}
        <div className="listing-footer">
          <div className="listing-price-box">
            <span className="listing-price" style={{ color: price.color }}>
              ₹ {Number(price.price || 0).toLocaleString()}<span className="listing-period">{price.period}</span>
            </span>
            {price.secondary && <span className="listing-price-secondary">{price.secondary}</span>}
          </div>
          <button
            className={`btn-list ${isPending ? 'is-pending' : ''} ${isBooked ? 'is-booked' : ''}`}
            style={{ background: btnColor }}
            onClick={handleButtonClick}
            disabled={!isDetailsType && (isPending || isBooked)}
            aria-busy={isPending}
            aria-live="polite"
          >
            {isPending && <span className="btn-spinner btn-spinner-sm" aria-hidden="true" />}
            {btnLabel}
          </button>
        </div>
      </div>

      {detailsOpen && (
        <ListingDetailsModal
          {...modalProps}
          listingType={type}
          listingId={listing.id}
          trustTier={trustTier}
          onClose={() => setDetailsOpen(false)}
        />
      )}

      {gateOpen && (
        <AuthGateModal
          title={t('card.getDetails')}
          description={t('gate.detailsDesc')}
          onClose={() => setGateOpen(false)}
        />
      )}
    </div>
  );
}
