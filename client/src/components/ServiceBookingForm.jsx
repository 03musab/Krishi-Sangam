import { useState } from 'react';
import BookingCard from './BookingCard';
import FarmLocationField from './FarmLocationField';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { bookService } from '../lib/api';

export default function ServiceBookingForm({ category, service }) {
  const { navigate } = useNav();
  const { showToast } = useToast();
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
      showToast('Service request submitted!');
      navigate('labour');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <BookingCard
      title={service.name}
      subtitle={`${category.emoji} ${category.name}`}
      emoji={category.emoji}
      backTo="labour"
      submitLabel="Request Service"
      onSubmit={handleSubmit}
    >
      <div className="service-desc-box">
        <strong>What is this service?</strong>
        <p>{service.desc}</p>
      </div>

      <div className="form-group">
        <label className="form-label">Preferred Date & Time</label>
        <input type="datetime-local" className="form-input" value={form.start_date} onChange={set('start_date')} />
      </div>

      <FarmLocationField value={form.location} onChange={(v) => setForm({ ...form, location: v })} onCoords={setCoords} />

      <div className="form-group">
        <label className="form-label">Estimated Budget (₹)</label>
        <input type="number" className="form-input" placeholder="e.g. 2000" value={form.price} onChange={set('price')} />
      </div>

      <div className="form-group">
        <label className="form-label">Details</label>
        <textarea className="form-textarea" placeholder="Tell us about your field size, crop, and any specific requirements..." value={form.description} onChange={set('description')} />
      </div>
    </BookingCard>
  );
}
