import { useState } from 'react';
import FormCard from '../components/FormCard';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { createLabour } from '../lib/api';

export default function ListLabour() {
  const { navigate } = useNav();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    title: '', skills: '', experience_years: '', daily_rate: '', location: '', description: '',
    team_size: '', max_distance: '25', crop_experience: '', work_types: ''
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
        team_size: form.team_size ? Number(form.team_size) : null,
        max_distance: form.max_distance ? Number(form.max_distance) : 25,
        crop_experience: form.crop_experience || null,
        work_types: form.work_types || form.skills || null,
        description: form.description || null
      });
      showToast(t('labour.created', 'Labour team registered successfully!'));
      navigate('labour');
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <FormCard
      title={t('labour.postTitle', 'Register Labour Team / Worker Group')}
      color="banner-purple"
      backTo="labour"
      submitLabel={t('land.submit', 'Register Team')}
      note={t('land.note', 'Your team capacity will be auto-matched with farmers looking for labour in your area.')}
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label className="form-label">{t('land.titleLabel', 'Team / Group Title')} *</label>
        <input type="text" className="form-input" placeholder="e.g. Maruti Labour Team (10 Workers)" value={form.title} onChange={set('title')} required />
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('labour.teamSize', 'Max Available Workers (Capacity)')} *</label>
          <input type="number" className="form-input" min="1" placeholder="e.g. 10 workers" value={form.team_size} onChange={set('team_size')} required />
        </div>
        <div className="form-group">
          <label className="form-label">{t('labour.dailyRate', 'Daily Rate per Worker (₹)')}</label>
          <input type="number" className="form-input" placeholder="e.g. 350" value={form.daily_rate} onChange={set('daily_rate')} />
        </div>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Specialised Work Types</label>
          <input type="text" className="form-input" placeholder="e.g. Paddy Transplanting, Sugarcane Cutting, Weeding" value={form.work_types} onChange={set('work_types')} />
        </div>
        <div className="form-group">
          <label className="form-label">Crop Experience</label>
          <input type="text" className="form-input" placeholder="e.g. Rice, Wheat, Cotton, Sugarcane" value={form.crop_experience} onChange={set('crop_experience')} />
        </div>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('labour.experience', 'Years of Experience')}</label>
          <input type="number" className="form-input" placeholder="e.g. 5" value={form.experience_years} onChange={set('experience_years')} />
        </div>
        <div className="form-group">
          <label className="form-label">Max Service Radius (km)</label>
          <input type="number" className="form-input" placeholder="Default 25 km" value={form.max_distance} onChange={set('max_distance')} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('labour.location', 'Location / Village')} *</label>
        <input type="text" className="form-input" placeholder="e.g. Baramati, Pune" value={form.location} onChange={set('location')} required />
      </div>

      <div className="form-group">
        <label className="form-label">{t('labour.description', 'Team Description & Availability')}</label>
        <textarea className="form-textarea" placeholder={t('labour.descriptionPh', 'Describe tools owned, transport availability, group skills...')} value={form.description} onChange={set('description')} />
      </div>
    </FormCard>
  );
}
