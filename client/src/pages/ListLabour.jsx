import { useState } from 'react';
import FormCard from '../components/FormCard';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { createLabour } from '../lib/api';

export default function ListLabour() {
  const { navigate } = useNav();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: '', skills: '', experience_years: '', daily_rate: '', location: '', description: ''
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    try {
      await createLabour({
        title: form.title,
        skills: form.skills || null,
        experience_years: form.experience_years ? Number(form.experience_years) : 0,
        daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
        location: form.location,
        description: form.description || null
      });
      showToast('Labour listed!');
      navigate('labour');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <FormCard
      title="Post Labour Service"
      color="banner-purple"
      backTo="labour"
      submitLabel="Submit Listing"
      note="Your listing will be reviewed by admin before going live."
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input type="text" className="form-input" placeholder="e.g. Experienced Farm Worker" value={form.title} onChange={set('title')} required />
      </div>
      <div className="form-group">
        <label className="form-label">Skills (comma-separated)</label>
        <input type="text" className="form-input" placeholder="e.g. plowing, harvesting, irrigation" value={form.skills} onChange={set('skills')} />
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Experience (years)</label>
          <input type="number" className="form-input" placeholder="e.g. 5" value={form.experience_years} onChange={set('experience_years')} />
        </div>
        <div className="form-group">
          <label className="form-label">Daily Rate (₹)</label>
          <input type="number" className="form-input" placeholder="e.g. 800" value={form.daily_rate} onChange={set('daily_rate')} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Location *</label>
        <input type="text" className="form-input" placeholder="Village, Taluka" value={form.location} onChange={set('location')} required />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" placeholder="Describe your services..." value={form.description} onChange={set('description')} />
      </div>
    </FormCard>
  );
}
