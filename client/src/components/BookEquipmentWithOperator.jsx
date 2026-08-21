import { useState } from 'react';
import BookingCard from './BookingCard';
import FarmLocationField from './FarmLocationField';
import AreaField from './AreaField';
import SmartFarmSelector from './SmartFarmSelector';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { bookEquipmentSmart } from '../lib/api';
import { EQUIPMENT_CATEGORIES, DEFAULT_EQUIPMENT_RATE } from '../data/services';

export default function BookEquipmentWithOperator({ onBack, onSubmitted }) {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [farmFor, setFarmFor] = useState('my_farm');
  const [farmDetails, setFarmDetails] = useState('');

  const [form, setForm] = useState({
    equipment: 'Tractor',
    category: 'Tractor & Tillage',
    days: '',
    start_date: '',
    location: '',
    hp_min: '',
    hp_max: '',
    attachment: '',
    farm_size: '',
    description: ''
  });
  const [coords, setCoords] = useState(null);
  const [matchedProviders, setMatchedProviders] = useState(null);
  const [searching, setSearching] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleEquipmentChange = (e) => {
    const value = e.target.value;
    const [category, item] = value.split('::');
    setForm({ ...form, equipment: item || '', category: category || '' });
  };

  const total = (Number(form.days) || 0) * DEFAULT_EQUIPMENT_RATE;

  const handleSubmit = async () => {
    setSearching(true);
    try {
      const result = await bookEquipmentSmart({
        equipment_type: form.equipment || 'Tractor',
        hp_min: form.hp_min ? Number(form.hp_min) : null,
        hp_max: form.hp_max ? Number(form.hp_max) : null,
        attachment: form.attachment || null,
        farm_size: form.farm_size || null,
        days: form.days ? Number(form.days) : null,
        start_date: form.start_date || null,
        location: form.location,
        lat: coords?.lat,
        lng: coords?.lng,
        work_description: form.description || null,
        farm_for: farmFor,
        farm_details: farmDetails
      });
      setMatchedProviders(result.matched || []);
      if (result.matched && result.matched.length > 0) {
        showToast(t('equipBook.sentToProviders', { n: result.matched.length }));
      } else {
        showToast(t('equipBook.noMatch', 'No matching providers found within 25 km.'));
      }
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setSearching(false);
    }
  };

  // Show matched providers after submission
  if (matchedProviders !== null) {
    return (
      <div className="service-booking-wrap">
        <div className="service-booking-head">
          <button className="btn-back-icon" onClick={() => { setMatchedProviders(null); if (onBack) onBack(); }} aria-label="Back">←</button>
          <span className="service-emoji">🚜</span>
          <div>
            <h1 className="service-booking-title">{t('equipBook.title', 'Tractor & Equipment Rental (Operator Included)')}</h1>
            <p className="service-booking-subtitle">{matchedProviders.length > 0
              ? t('equipBook.matchFound', { n: matchedProviders.length })
              : t('equipBook.noMatch', 'No matching providers found within 25 km.')}</p>
          </div>
        </div>
        <div className="service-booking-card">
          {matchedProviders.length > 0 ? (
            <div className="matched-providers-list">
              {matchedProviders.map((p) => (
                <div key={p.id} className="booking-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  <div className="booking-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem' }}>{p.provider_name}</strong>
                      <br />
                      <span className="muted" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {p.equipment} {p.hp ? `(${p.hp} HP)` : ''} • Driver Included {p.distance_km != null ? `• ${p.distance_km} km away` : ''}
                      </span>
                    </div>
                    <span className="booking-status" style={{ color: '#eab308', fontWeight: '700', fontSize: '0.85rem' }}>
                      {t('booking.pending', 'PENDING').toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px' }}>
                    ⌛ Request dispatched! Provider will confirm shortly.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="listings-empty" style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p>{t('equipBook.noMatchDetail', 'No registered tractor providers within 25 km match your specifications.')}</p>
              <button className="btn-form-submit" style={{ marginTop: '16px' }} onClick={() => setMatchedProviders(null)}>{t('equipBook.tryAgain', 'Try Again')}</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <BookingCard
      title={t('equipBook.title', 'Tractor + Operator Always')}
      subtitle={t('equipBook.subtitle', 'Tractor is always provided WITH an operator/driver')}
      icon="tractor"
      onBack={onBack}
      onSubmitted={onSubmitted}
      submitLabel={searching ? t('equipBook.searching', 'Finding 25km Providers...') : t('equipBook.request', 'Send Rental Request')}
      onSubmit={handleSubmit}
    >
      {/* ── STEP 1: Smart Farm Selector ("Who is this for?") ── */}
      <SmartFarmSelector
        farmFor={farmFor}
        setFarmFor={setFarmFor}
        farmDetails={farmDetails}
        setFarmDetails={setFarmDetails}
      />

      <div className="pricing-banner" style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
        <span className="pricing-label" style={{ fontSize: '0.85rem', color: '#166534' }}>{t('labour.pricing', 'Pricing')}: </span>
        <span className="pricing-value" style={{ fontWeight: '700', color: '#15803d' }}>{t('equipBook.perDay', { rate: DEFAULT_EQUIPMENT_RATE })}</span>
        {total > 0 && <span className="pricing-total" style={{ marginLeft: '12px', fontWeight: '800', color: '#166534' }}> • Est. Total: ₹{total.toLocaleString()}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">{t('equipBook.equipment', 'Equipment Type')} *</label>
        <select
          className="form-select"
          value={form.category && form.equipment ? `${form.category}::${form.equipment}` : 'Tractor & Tillage::Tractor'}
          onChange={handleEquipmentChange}
          required
        >
          <optgroup label="Tractor & Tillage (Driver Included)">
            <option value="Tractor & Tillage::Tractor">Tractor (Always WITH Operator/Driver)</option>
            <option value="Tractor & Tillage::Mini Tractor">Mini Tractor (35 HP)</option>
            <option value="Tractor & Tillage::Heavy Duty Tractor">Heavy Duty Tractor (&gt;50 HP)</option>
          </optgroup>
          {EQUIPMENT_CATEGORIES.map((cat) => (
            <optgroup key={cat.label} label={cat.label}>
              {cat.items.map((item) => (
                <option key={item} value={`${cat.label}::${item}`}>{item}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t('equipBook.whatWork', 'What work do you need?')} *</label>
        <textarea
          className="form-textarea"
          placeholder={t('equipBook.whatWorkPh', 'Describe the task e.g. Deep land ploughing, seedbed preparation, rotavation...')}
          value={form.description}
          onChange={set('description')}
          required
        />
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('equipBook.hpMin', 'Min Horsepower (HP)')}</label>
          <input type="number" className="form-input" min="1" placeholder="e.g. 35 HP" value={form.hp_min} onChange={set('hp_min')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('equipBook.hpMax', 'Max Horsepower (HP)')}</label>
          <input type="number" className="form-input" min="1" placeholder="e.g. 75 HP" value={form.hp_max} onChange={set('hp_max')} />
        </div>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('equipBook.attachment', 'Attachment Needed')}</label>
          <select className="form-select" value={form.attachment} onChange={set('attachment')}>
            <option value="">{t('equipBook.anyAttachment', 'Any / No Attachment')}</option>
            <option value="Rotavator">Rotavator</option>
            <option value="Plough">Plough (Disc/Mouldboard)</option>
            <option value="Harrow">Disc Harrow</option>
            <option value="Seed Drill">Seed Drill</option>
            <option value="Cultivator">Cultivator</option>
            <option value="Sprayer">Tractor Sprayer</option>
            <option value="Trailer">Trolley / Trailer</option>
          </select>
        </div>
        <AreaField
          label={t('equipBook.farmSize', 'Farm Size')}
          value={form.farm_size}
          onChange={(v) => setForm({ ...form, farm_size: v })}
        />
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('equipBook.numDays', 'Number of Days')} *</label>
          <input type="number" className="form-input" min="1" placeholder="e.g. 2" value={form.days} onChange={set('days')} required />
        </div>
        <div className="form-group">
          <label className="form-label">{t('equipBook.dateTime', 'Target Date & Time')} *</label>
          <input type="datetime-local" className="form-input" value={form.start_date} onChange={set('start_date')} required />
        </div>
      </div>

      <FarmLocationField value={form.location} onChange={(v) => setForm({ ...form, location: v })} onCoords={setCoords} />
    </BookingCard>
  );
}
