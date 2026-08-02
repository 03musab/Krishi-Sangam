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
      showToast(t('labour.created'));
      navigate('labour');
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <FormCard
      title={t('labour.postTitle')}
      color="banner-purple"
      backTo="labour"
      submitLabel={t('land.submit')}
      note={t('land.note')}
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label className="form-label">{t('land.titleLabel')} *</label>
        <input type="text" className="form-input" placeholder={t('labour.titlePh')} value={form.title} onChange={set('title')} required />
      </div>
      <div className="form-group">
        <label className="form-label">{t('labour.skillsLabel')}</label>
        <input type="text" className="form-input" placeholder={t('labour.skillsPh')} value={form.skills} onChange={set('skills')} />
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('labour.experience')}</label>
          <input type="number" className="form-input" placeholder={t('labour.experiencePh')} value={form.experience_years} onChange={set('experience_years')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('labour.dailyRate')}</label>
          <input type="number" className="form-input" placeholder={t('labour.ratePh')} value={form.daily_rate} onChange={set('daily_rate')} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{t('labour.location')} *</label>
        <input type="text" className="form-input" placeholder={t('labour.locationPh')} value={form.location} onChange={set('location')} required />
      </div>
      <div className="form-group">
        <label className="form-label">{t('labour.description')}</label>
        <textarea className="form-textarea" placeholder={t('labour.descriptionPh')} value={form.description} onChange={set('description')} />
      </div>
    </FormCard>
  );
}
