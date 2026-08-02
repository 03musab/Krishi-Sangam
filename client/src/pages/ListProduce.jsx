import { useState } from 'react';
import FormCard from '../components/FormCard';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { createProduce } from '../lib/api';

export default function ListProduce() {
  const { navigate } = useNav();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    crop_name: '', quantity: '', unit: 'kg', price_per_unit: '',
    quality_grade: 'A', location: '', description: ''
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    try {
      await createProduce({
        crop_name: form.crop_name,
        quantity: Number(form.quantity),
        unit: form.unit,
        price_per_unit: Number(form.price_per_unit),
        quality_grade: form.quality_grade,
        location: form.location,
        description: form.description || null
      });
      showToast(t('produce.created'));
      navigate('produce');
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <FormCard
      title={t('produce.listTitle')}
      color="banner-amber"
      backTo="produce"
      submitLabel={t('produce.action')}
      note={t('land.note')}
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label className="form-label">{t('produce.cropName')} *</label>
        <input type="text" className="form-input" placeholder={t('produce.cropNamePh')} value={form.crop_name} onChange={set('crop_name')} required />
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('produce.quantity')} *</label>
          <input type="number" className="form-input" placeholder="e.g. 100" value={form.quantity} onChange={set('quantity')} required />
        </div>
        <div className="form-group">
          <label className="form-label">{t('produce.unit')}</label>
          <select className="form-select" value={form.unit} onChange={set('unit')}>
            <option value="kg">{t('produce.kg')}</option><option value="quintal">{t('produce.quintal')}</option>
            <option value="tonne">{t('produce.tonne')}</option><option value="piece">{t('produce.piece')}</option>
          </select>
        </div>
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('produce.pricePerUnit')} *</label>
          <input type="number" className="form-input" placeholder="e.g. 30" value={form.price_per_unit} onChange={set('price_per_unit')} required />
        </div>
        <div className="form-group">
          <label className="form-label">{t('produce.grade')}</label>
          <select className="form-select" value={form.quality_grade} onChange={set('quality_grade')}>
            <option value="A">{t('produce.gradeA')}</option><option value="B">{t('produce.gradeB')}</option><option value="C">{t('produce.gradeC')}</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{t('produce.location')} *</label>
        <input type="text" className="form-input" placeholder="Village, Taluka" value={form.location} onChange={set('location')} required />
      </div>
      <div className="form-group">
        <label className="form-label">{t('produce.description')}</label>
        <textarea className="form-textarea" placeholder={t('produce.descriptionPh')} value={form.description} onChange={set('description')} />
      </div>
    </FormCard>
  );
}
