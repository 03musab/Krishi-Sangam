import { useState } from 'react';
import BookingCard from './BookingCard';
import FarmLocationField from './FarmLocationField';
import AreaField from './AreaField';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { bookService } from '../lib/api';
import { DEFAULT_WORKER_RATE } from '../data/services';

export default function BookLabourTeam({ onBack, onSubmitted }) {
  const { showToast } = useToast();
  const { t } = useLanguage();
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

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const total = (Number(form.workers) || 0) * (Number(form.days) || 0) * (Number(form.rate) || 0);

  const handleSubmit = async () => {
    try {
      await bookService({
        kind: 'labour_team',
        service_name: 'Farm Workers',
        num_workers: Number(form.workers),
        days: Number(form.days),

        start_date: form.start_date,
        location: form.location,
        lat: coords?.lat,
        lng: coords?.lng,
        description: [
          form.area_acres ? t('labour.fieldSizeNote', { a: form.area_acres }) : null,
          form.description
        ].filter(Boolean).join(' — ') || null,
        price: total
      });
      showToast(t('labour.requestSubmitted'));
      if (onSubmitted) onSubmitted();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <BookingCard
      title={t('labour.bookLabourTeam')}
      subtitle={t('labour.teamSubtitle')}
      icon="worker"
      onBack={onBack}
      onSubmitted={onSubmitted}
      submitLabel={t('labour.requestTeam')}
      onSubmit={handleSubmit}
    >
      <div className="pricing-banner">
        <span className="pricing-label">{t('labour.pricing')}</span>
        <span className="pricing-value">{t('labour.perWorkerDay', { rate: form.rate })}</span>
        <span className="pricing-total">{t('labour.total', { total: total.toLocaleString() })}</span>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('labour.numWorkers')} *</label>
          <input type="number" className="form-input" min="1" placeholder="e.g. 4" value={form.workers} onChange={set('workers')} required />
        </div>
        <div className="form-group">
          <label className="form-label">{t('labour.numDays')} *</label>
          <input type="number" className="form-input" min="1" placeholder="e.g. 2" value={form.days} onChange={set('days')} required />
        </div>
      </div>

      <div className="form-group">
        <AreaField
          label={t('labour.fieldSize')}
          value={form.area_acres}
          onChange={(v) => setForm({ ...form, area_acres: v })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('labour.dateTime')} *</label>
        <input type="datetime-local" className="form-input" value={form.start_date} onChange={set('start_date')} required />
      </div>

      <FarmLocationField value={form.location} onChange={(v) => setForm({ ...form, location: v })} onCoords={setCoords} />

      <div className="form-group">
        <label className="form-label">{t('labour.notes')}</label>
        <textarea className="form-textarea" placeholder={t('labour.notesPh')} value={form.description} onChange={set('description')} />
      </div>
    </BookingCard>
  );
}
