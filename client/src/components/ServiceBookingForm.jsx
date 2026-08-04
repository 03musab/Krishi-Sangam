import { useState } from 'react';
import BookingCard from './BookingCard';
import FarmLocationField from './FarmLocationField';
import AreaField from './AreaField';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { bookService } from '../lib/api';
import Icon from './Icon';

export default function ServiceBookingForm({ category, service, onBack, onSubmitted }) {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    start_date: '',
    location: '',
    description: '',
    num_workers: '',
    area_acres: ''
  });
  const [coords, setCoords] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    try {
      await bookService({
        kind: 'service',
        category: category.name,
        service_name: service.name,
        start_date: form.start_date,
        location: form.location,
        lat: coords?.lat,
        lng: coords?.lng,
        num_workers: form.num_workers ? Number(form.num_workers) : null,
        description: [
          form.area_acres ? t('labour.fieldSizeNote', { a: form.area_acres }) : null,
          form.description
        ].filter(Boolean).join(' — ') || null,
        price: null
      });
      showToast(t('labour.serviceSubmitted'));
      if (onSubmitted) onSubmitted();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <BookingCard
      title={service.name}
      subtitle={
        <>
          <Icon name={category.icon} size={16} style={{ verticalAlign: '-3px', marginRight: '6px' }} />
          {category.name}
        </>
      }
      icon={category.icon}
      onBack={onBack}
      onSubmitted={onSubmitted}
      submitLabel={t('labour.requestService')}
      onSubmit={handleSubmit}
    >
      <div className="service-desc-box">
        <strong>{t('labour.whatIsService')}</strong>
        <p>{service.desc}</p>
      </div>

      <div className="form-group">
        <label className="form-label">{t('labour.prefDateTime')}</label>
        <input type="datetime-local" className="form-input" value={form.start_date} onChange={set('start_date')} />
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('labour.estLabour')}</label>
          <input type="number" className="form-input" min="1" placeholder={t('labour.estLabourPh')} value={form.num_workers} onChange={set('num_workers')} />
        </div>
        <AreaField
          label={t('labour.fieldSize')}
          value={form.area_acres}
          onChange={(v) => setForm({ ...form, area_acres: v })}
        />
      </div>

      <FarmLocationField value={form.location} onChange={(v) => setForm({ ...form, location: v })} onCoords={setCoords} />

      <div className="form-group">
        <label className="form-label">{t('labour.details')}</label>
        <textarea className="form-textarea" placeholder={t('labour.detailsPh')} value={form.description} onChange={set('description')} />
      </div>
    </BookingCard>
  );
}
