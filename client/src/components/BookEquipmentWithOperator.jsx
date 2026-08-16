import { useState } from 'react';
import BookingCard from './BookingCard';
import FarmLocationField from './FarmLocationField';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { bookService } from '../lib/api';
import { EQUIPMENT_CATEGORIES, DEFAULT_EQUIPMENT_RATE } from '../data/services';

export default function BookEquipmentWithOperator({ onBack, onSubmitted }) {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    equipment: '',
    category: '',
    days: '',
    start_date: '',
    location: '',
    description: ''
  });
  const [coords, setCoords] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Option values are "category::item" so both are captured in one select
  const handleEquipmentChange = (e) => {
    const value = e.target.value;
    const [category, item] = value.split('::');
    setForm({ ...form, equipment: item || '', category: category || '' });
  };

  const total = (Number(form.days) || 0) * DEFAULT_EQUIPMENT_RATE;

  const handleSubmit = async () => {
    try {
      await bookService({
        kind: 'equipment',
        category: form.category || null,
        service_name: form.equipment,
        days: Number(form.days),
        start_date: form.start_date,
        location: form.location,
        lat: coords?.lat,
        lng: coords?.lng,
        description: form.description || null,
        price: total
      });
      showToast(t('equipBook.submitted'));
      if (onSubmitted) onSubmitted();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <BookingCard
      title={t('equipBook.title')}
      subtitle={t('equipBook.subtitle')}
      icon="tractor"
      onBack={onBack}
      onSubmitted={onSubmitted}
      submitLabel={t('equipBook.request')}
      onSubmit={handleSubmit}
    >
      <div className="pricing-banner">
        <span className="pricing-label">{t('labour.pricing')}</span>
        <span className="pricing-value">{t('equipBook.perDay', { rate: DEFAULT_EQUIPMENT_RATE })}</span>
        <span className="pricing-total">{t('labour.total', { total: total.toLocaleString() })}</span>
      </div>

      <div className="form-group">
        <label className="form-label">{t('equipBook.equipment')} *</label>
        <select
          className="form-select"
          value={form.category && form.equipment ? `${form.category}::${form.equipment}` : ''}
          onChange={handleEquipmentChange}
          required
        >
          <option value="">{t('equipBook.selectEquipment')}</option>
          {EQUIPMENT_CATEGORIES.map((cat) => (
            <optgroup key={cat.label} label={cat.label}>
              {cat.items.map((item) => (
                <option key={item} value={`${cat.label}::${item}`}>{item}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('equipBook.numDays')} *</label>
          <input type="number" className="form-input" min="1" placeholder="e.g. 2" value={form.days} onChange={set('days')} required />
        </div>
        <div className="form-group">
          <label className="form-label">{t('equipBook.dateTime')} *</label>
          <input type="datetime-local" className="form-input" value={form.start_date} onChange={set('start_date')} required />
        </div>
      </div>

      <FarmLocationField value={form.location} onChange={(v) => setForm({ ...form, location: v })} onCoords={setCoords} />

      <div className="form-group">
        <label className="form-label">{t('labour.notes')}</label>
        <textarea className="form-textarea" placeholder={t('equipBook.notesPh')} value={form.description} onChange={set('description')} />
      </div>
    </BookingCard>
  );
}
