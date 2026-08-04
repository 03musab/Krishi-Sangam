import { useState, useOptimistic, startTransition } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { createBooking } from '../lib/api';
import { memberDeposit } from '../lib/trust';
import ListingDetailsModal from './ListingDetailsModal';
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

  const getTagContent = () => {
    if (type === 'land') {
      const tags = [];
      if (listing.area_acres) tags.push({ cls: 'tag-green', text: t('card.acres', { n: listing.area_acres }) });
      if (listing.soil_type) tags.push({ cls: 'tag-orange', text: listing.soil_type });
      if (listing.water_source) tags.push({ cls: 'tag-blue', text: <><Icon name="droplet" size={13} style={{ verticalAlign: '-2px', marginRight: '5px' }} />{listing.water_source}</> });
      return tags;
    }
    if (type === 'equipment') {
      return [{ cls: 'tag-orange', text: listing.type }];
    }
    if (type === 'labour') {
      if (listing.skills) return [{ cls: 'tag-purple', text: listing.skills }];
      return [];
    }
    if (type === 'produce') {
      const tags = [];
      if (listing.quantity != null && listing.unit) tags.push({ cls: 'tag-amber', text: `${listing.quantity} ${listing.unit}` });
      if (listing.quality_grade) tags.push({ cls: 'tag-slate', text: t('produce.gradeTag', { g: listing.quality_grade }) });
      return tags;
    }
    return [];
  };

  const getPrice = () => {
    if (type === 'land') {
      const price = listing.price_per_season || listing.price_per_month || listing.price_per_year || 0;
      const period = listing.lease_type ? listing.lease_type.toLowerCase() : 'season';
      return { price, period: `/${period}`, color: '#16a34a' };
    }
    if (type === 'equipment') {
      return { price: listing.price_per_hour || 0, period: t('card.perHour'), secondary: `₹ ${(listing.price_per_day || 0).toLocaleString()}${t('card.perDay')}`, color: '#ea580c' };
    }
    if (type === 'labour') {
      return { price: listing.daily_rate || 0, period: t('card.perDay'), color: '#7c3aed' };
    }
    if (type === 'produce') {
      return { price: listing.price_per_unit || 0, period: `/${listing.unit || 'kg'}`, color: '#d97706' };
    }
    return { price: 0, period: '', color: '#16a34a' };
  };

  const price = getPrice();
  const title = listing.title || listing.name || listing.crop_name || t('card.untitled');
  const location = listing.location || '';
  const district = listing.district || '';
  const placeholderIcon = type === 'land' ? 'wheat' : type === 'equipment' ? 'tractor' : type === 'labour' ? 'worker' : 'seedling';
  const isPending = optimisticStatus === 'pending';
  const isBooked = optimisticStatus === 'booked';
  // Land, equipment & produce can't be booked directly — users get full details and owner contact instead
  const isDetailsType = type === 'land' || type === 'equipment' || type === 'produce';
  const baseLabel = isDetailsType ? t('card.getDetails') : type === 'labour' ? t('card.hire') : t('card.buy');
  const btnLabel = isDetailsType ? baseLabel : (isBooked ? t('card.booked') : isPending ? t('card.booking') : baseLabel);
  const btnColor = price.color;
  const accent = type === 'land' ? 'linear-gradient(135deg, #16a34a, #4ade80)'
    : type === 'equipment' ? 'linear-gradient(135deg, #ea580c, #fb923c)'
    : type === 'labour' ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
    : 'linear-gradient(135deg, #d97706, #fbbf24)';

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (isDetailsType) { setDetailsOpen(true); return; }
    handleBook(e);
  };

  const tags = getTagContent();

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
        <div className="listing-location"><Icon name="pin" size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />{location}{district ? `, ${district}` : ''}</div>
        <div className="listing-tags">
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
          title={title}
          location={location}
          district={district}
          image={listing.photo_url}
          icon={placeholderIcon}
          accent={accent}
          price={price}
          tags={tags}
          description={listing.description}
          ownerName={listing.owner_name}
          ownerPhone={listing.owner_phone}
          deposit={Number(listing.deposit) || 0}
          trustTier={trustTier}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </div>
  );
}
