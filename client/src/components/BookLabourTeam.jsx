import { useState } from 'react';
import BookingCard from './BookingCard';
import FarmLocationField from './FarmLocationField';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { bookService } from '../lib/api';
import { TEAM_TYPES, SKILL_LEVELS, DEFAULT_WORKER_RATE } from '../data/services';

export default function BookLabourTeam() {
  const { navigate } = useNav();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    workers: '',
    days: '',
    team_type: 'Mixed',
    skill_level: 'Skilled',
    start_date: '',
    location: '',
    description: '',
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
        team_type: form.team_type,
        skill_level: form.skill_level,
        start_date: form.start_date,
        location: form.location,
        lat: coords?.lat,
        lng: coords?.lng,
        description: form.description || null,
        price: total
      });
      showToast('Labour team request submitted!');
      navigate('labour');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <BookingCard
      title="Book Labour Team"
      subtitle="Hire farm workers on a daily basis"
      emoji="👷"
      backTo="labour"
      submitLabel="Request Labour Team"
      onSubmit={handleSubmit}
    >
      <div className="pricing-banner">
        <span className="pricing-label">Pricing</span>
        <span className="pricing-value">₹ {form.rate} per worker/day</span>
        <span className="pricing-total">Total: ₹ {total.toLocaleString()}</span>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Number of Workers *</label>
          <input type="number" className="form-input" min="1" placeholder="e.g. 4" value={form.workers} onChange={set('workers')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Number of Days (Full Day) *</label>
          <input type="number" className="form-input" min="1" placeholder="e.g. 2" value={form.days} onChange={set('days')} required />
        </div>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Team Type</label>
          <select className="form-select" value={form.team_type} onChange={set('team_type')}>
            {TEAM_TYPES.map((t) => <option key={t} value={t}>{t} Team</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Skill Level</label>
          <select className="form-select" value={form.skill_level} onChange={set('skill_level')}>
            {SKILL_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Date & Time *</label>
        <input type="datetime-local" className="form-input" value={form.start_date} onChange={set('start_date')} required />
      </div>

      <FarmLocationField value={form.location} onChange={(v) => setForm({ ...form, location: v })} onCoords={setCoords} />

      <div className="form-group">
        <label className="form-label">Additional Notes</label>
        <textarea className="form-textarea" placeholder="Describe the work needed..." value={form.description} onChange={set('description')} />
      </div>
    </BookingCard>
  );
}
