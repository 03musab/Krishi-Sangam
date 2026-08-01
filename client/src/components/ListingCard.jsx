import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createBooking } from '../lib/api';

function escapeHtml(s) {
  if (!s) return '';
  return String(s);
}

export default function ListingCard({ listing, type, onBook }) {
  const { user } = useAuth();
  const { navigate } = useNav();
  const { showToast } = useToast();

  const handleBook = async (e) => {
    e.stopPropagation();
    if (onBook) { onBook(); return; }
    if (!user) {
      showToast('Please sign in first.');
      navigate('signin');
      return;
    }
    const title = listing.title || listing.name || listing.crop_name || listing.worker_name || 'Item';
    const price = listing.price_per_season || listing.price_per_month || listing.price_per_year ||
                  listing.price_per_day || listing.price_per_hour || listing.daily_rate ||
                  listing.price_per_unit || 0;
    if (!window.confirm(`Book "${title}"?`)) return;
    try {
      await createBooking({ listing_type: type, listing_id: listing.id });
      showToast('Booking created!');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const getTagContent = () => {
    if (type === 'land') {
      const tags = [];
      if (listing.area_acres) tags.push({ cls: 'tag-green', text: `${listing.area_acres} Acres` });
      if (listing.soil_type) tags.push({ cls: 'tag-orange', text: listing.soil_type });
      if (listing.water_source) tags.push({ cls: 'tag-blue', text: `💧 ${listing.water_source}` });
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
      if (listing.quality_grade) tags.push({ cls: 'tag-slate', text: `Grade ${listing.quality_grade}` });
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
      return { price: listing.price_per_hour || 0, period: '/hr', secondary: `₹ ${(listing.price_per_day || 0).toLocaleString()}/day`, color: '#ea580c' };
    }
    if (type === 'labour') {
      return { price: listing.daily_rate || 0, period: '/day', color: '#7c3aed' };
    }
    if (type === 'produce') {
      return { price: listing.price_per_unit || 0, period: `/${listing.unit || 'kg'}`, color: '#d97706' };
    }
    return { price: 0, period: '', color: '#16a34a' };
  };

  const price = getPrice();
  const title = listing.title || listing.name || listing.crop_name || 'Untitled';
  const location = listing.location || '';
  const district = listing.district || '';
  const placeholder = type === 'land' ? '🌾' : type === 'equipment' ? '🚜' : type === 'labour' ? '👷' : '🌱';
  const btnLabel = type === 'land' ? 'Book' : type === 'equipment' ? 'Book' : type === 'labour' ? 'Hire' : 'Buy';
  const btnColor = price.color;
  const accent = type === 'land' ? 'linear-gradient(135deg, #16a34a, #4ade80)'
    : type === 'equipment' ? 'linear-gradient(135deg, #ea580c, #fb923c)'
    : type === 'labour' ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
    : 'linear-gradient(135deg, #d97706, #fbbf24)';

  return (
    <div className="listing-card">
      <div className="listing-img-wrap">
        {listing.photo_url ? (
          <img src={listing.photo_url} alt={title} className="listing-img" />
        ) : (
          <div className="listing-img-placeholder" style={{ background: accent }}>{placeholder}</div>
        )}
        {type === 'equipment' && listing.with_operator ? (
          <span className="listing-badge">👤 With Operator</span>
        ) : null}
      </div>
      <div className="listing-body">
        <h3 className="listing-title">{escapeHtml(title)}</h3>
        <div className="listing-location">📍 {location}{district ? `, ${district}` : ''}</div>
        <div className="listing-tags">
          {getTagContent().map((t, i) => (
            <span key={i} className={`tag-pill ${t.cls}`}>{t.text}</span>
          ))}
        </div>
        <div className="listing-footer">
          <div className="listing-price-box">
            <span className="listing-price" style={{ color: price.color }}>
              ₹ {Number(price.price || 0).toLocaleString()}<span className="listing-period">{price.period}</span>
            </span>
            {price.secondary && <span className="listing-price-secondary">{price.secondary}</span>}
          </div>
          <button className="btn-list" style={{ background: btnColor }} onClick={handleBook}>{btnLabel}</button>
        </div>
      </div>
    </div>
  );
}
