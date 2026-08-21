import { useState } from 'react';
import BookingCard from './BookingCard';
import FarmLocationField from './FarmLocationField';
import AreaField from './AreaField';
import SmartFarmSelector from './SmartFarmSelector';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { bookLabourTeamSmart } from '../lib/api';
import { DEFAULT_WORKER_RATE } from '../data/services';

export default function BookLabourTeam({ onBack, onSubmitted }) {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [farmFor, setFarmFor] = useState('my_farm');
  const [farmDetails, setFarmDetails] = useState('');

  const [form, setForm] = useState({
    workers: '',
    days: '',
    start_date: '',
    location: '',
    description: '',
    area_acres: '',
    rate: DEFAULT_WORKER_RATE
  });
  const [coords, setCoords] = useState(null);
  const [matchedProviders, setMatchedProviders] = useState(null);
  const [searching, setSearching] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const total = (Number(form.workers) || 0) * (Number(form.days) || 0) * (Number(form.rate) || 0);

  const handleSubmit = async () => {
    if (!form.workers || Number(form.workers) < 1) {
      showToast(t('labour.workerRequiredErr', 'Please specify the number of labourers required.'));
      return;
    }
    setSearching(true);
    try {
      const result = await bookLabourTeamSmart({
        num_workers: Number(form.workers),
        days: form.days ? Number(form.days) : null,
        start_date: form.start_date || null,
        location: form.location,
        lat: coords?.lat,
        lng: coords?.lng,
        work_description: [
          form.area_acres ? t('labour.fieldSizeNote', { a: form.area_acres }) : null,
          form.description
        ].filter(Boolean).join(' — ') || null,
        farm_size: form.area_acres || null,
        rate_per_worker: Number(form.rate),
        farm_for: farmFor,
        farm_details: farmDetails
      });
      setMatchedProviders(result.matched || []);
      if (result.matched && result.matched.length > 0) {
        showToast(t('labour.sentToProviders', { n: result.matched.length }));
      } else {
        showToast(t('labour.noMatch', 'No labour providers found within 25 km matching required worker capacity.'));
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
          <span className="service-emoji">👷</span>
          <div>
            <h1 className="service-booking-title">{t('labour.bookLabourTeam', 'Book Labour Team')}</h1>
            <p className="service-booking-subtitle">{matchedProviders.length > 0
              ? t('labour.matchFound', { n: matchedProviders.length })
              : t('labour.noMatch', 'No matching providers found.')}</p>
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
                        Can supply {p.team_size} workers • ₹{p.daily_rate || form.rate}/worker/day {p.distance_km != null ? `• ${p.distance_km} km away` : ''}
                      </span>
                    </div>
                    <span className="booking-status" style={{ color: '#eab308', fontWeight: '700', fontSize: '0.85rem' }}>
                      {t('booking.pending', 'PENDING').toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px' }}>
                    ⌛ Request sent for {form.workers} workers! Waiting for provider acceptance.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="listings-empty" style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p>{t('labour.noMatchDetail', 'No labour providers within 25 km can fulfill the required number of workers.')}</p>
              <button className="btn-form-submit" style={{ marginTop: '16px' }} onClick={() => setMatchedProviders(null)}>{t('labour.tryAgain', 'Try Again')}</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <BookingCard
      title={t('labour.bookLabourTeam', 'Labour Booking — Number of Workers Required')}
      subtitle={t('labour.teamSubtitleMatch', 'Capacity-based matching within 25 km')}
      icon="worker"
      onBack={onBack}
      onSubmitted={onSubmitted}
      submitLabel={searching ? t('labour.searching', 'Matching 25km Teams...') : t('labour.requestTeam', 'Request Labour Team')}
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
        <span className="pricing-label" style={{ fontSize: '0.85rem', color: '#166534' }}>{t('labour.pricing', 'Daily Rate')}: </span>
        <span className="pricing-value" style={{ fontWeight: '700', color: '#15803d' }}>₹{form.rate}/worker/day</span>
        {total > 0 && <span className="pricing-total" style={{ marginLeft: '12px', fontWeight: '800', color: '#166534' }}> • Est. Total: ₹{total.toLocaleString()}</span>}
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: '700', color: '#0f172a' }}>
            👷 {t('labour.numWorkers', 'Number of Labourers Required')} *
          </label>
          <input
            type="number"
            className="form-input"
            min="1"
            placeholder="e.g. 5 workers"
            value={form.workers}
            onChange={set('workers')}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('labour.numDays', 'Number of Days')} *</label>
          <input type="number" className="form-input" min="1" placeholder="e.g. 2" value={form.days} onChange={set('days')} required />
        </div>
      </div>

      <div className="form-group">
        <AreaField
          label={t('labour.fieldSize', 'Farm / Field Size')}
          value={form.area_acres}
          onChange={(v) => setForm({ ...form, area_acres: v })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('labour.dateTime', 'Target Date & Time')} *</label>
        <input type="datetime-local" className="form-input" value={form.start_date} onChange={set('start_date')} required />
      </div>

      <FarmLocationField value={form.location} onChange={(v) => setForm({ ...form, location: v })} onCoords={setCoords} />

      <div className="form-group">
        <label className="form-label">{t('labour.workType', 'Type of Farm Work Required')} *</label>
        <select className="form-select" value={form.description} onChange={set('description')} required>
          <option value="">{t('labour.selectWorkType', 'Select Work Type')}</option>
          <option value="Ploughing & Tillage">Ploughing & Tillage</option>
          <option value="Sowing & Transplanting">Sowing & Paddy Transplanting</option>
          <option value="Manual Weeding">Manual Weeding</option>
          <option value="Pesticide Spraying">Pesticide / Fertilizer Spraying</option>
          <option value="Crop Harvesting">Crop Harvesting & Cutting</option>
          <option value="Cotton / Fruit Picking">Cotton / Fruit Picking</option>
          <option value="Post-Harvest Loading">Post-Harvest Sorting & Loading</option>
          <option value="Other Farm Labour">Other Farm Labour</option>
        </select>
      </div>
    </BookingCard>
  );
}
