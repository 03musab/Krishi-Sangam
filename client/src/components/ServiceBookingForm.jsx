import { useState } from 'react';
import BookingCard from './BookingCard';
import FarmLocationField from './FarmLocationField';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { bookService } from '../lib/api';

export default function ServiceBookingForm({ category, service }) {
  const { navigate } = useNav();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    start_date: '',
    location: '',
    description: '',
    price: ''
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
        description: form.description || null,
        price: form.price ? Number(form.price) : null
      });
      showToast(t('labour.serviceSubmitted'));
      navigate('labour');
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <BookingCard
      title={service.name}
      subtitle={`${category.emoji} ${category.name}`}
      emoji={category.emoji}
      backTo="labour"
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

      <FarmLocationField value={form.location} onChange={(v) => setForm({ ...form, location: v })} onCoords={setCoords} />

      <div className="form-group">
        <label className="form-label">{t('labour.budget')}</label>
        <input type="number" className="form-input" placeholder={t('labour.budgetPh')} value={form.price} onChange={set('price')} />
      </div>

      <div className="form-group">
        <label className="form-label">{t('labour.details')}</label>
        <textarea className="form-textarea" placeholder={t('labour.detailsPh')} value={form.description} onChange={set('description')} />
      </div>
    </BookingCard>
  );
}
