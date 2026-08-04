import { useState } from 'react';
import FormCard from '../components/FormCard';
import PhotoUpload from '../components/PhotoUpload';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { createEquipment } from '../lib/api';

export default function ListEquipment() {
  const { navigate } = useNav();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [form, setForm] = useState({
    name: '', type: 'Tractor', price_per_hour: '', price_per_day: '', deposit: '',
    location: '', district: '', state: '', with_operator: false, description: ''
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    try {
      await createEquipment({
        name: form.name,
        type: form.type,
        price_per_hour: form.price_per_hour ? Number(form.price_per_hour) : null,
        price_per_day: form.price_per_day ? Number(form.price_per_day) : null,
        deposit: form.deposit ? Number(form.deposit) : null,
        location: form.location,
        district: form.district || null,
        state: form.state || null,
        with_operator: form.with_operator,
        description: form.description || null,
        photo_url: photoUrl
      });
      showToast(t('equip.created'));
      navigate('equipment-rental');
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <FormCard
      title={t('equip.listTitle')}
      color="banner-orange"
      backTo="equipment-rental"
      submitLabel={t('equip.add')}
      note={t('land.note')}
      onSubmit={handleSubmit}
    >
      <PhotoUpload onUploaded={setPhotoUrl} />
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('equip.name')} *</label>
          <input type="text" className="form-input" placeholder={t('equip.namePh')} value={form.name} onChange={set('name')} required />
        </div>
        <div className="form-group">
          <label className="form-label">{t('equip.type')} *</label>
          <select className="form-select" value={form.type} onChange={set('type')} required>
            <option>{t('equip.tractor')}</option><option>{t('equip.harvester')}</option><option>{t('equip.sprayer')}</option>
            <option>{t('equip.rotavator')}</option><option>{t('equip.seedDrill')}</option><option>{t('equip.other')}</option>
          </select>
        </div>
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('equip.perHour')}</label>
          <input type="number" className="form-input" placeholder="e.g. 500" value={form.price_per_hour} onChange={set('price_per_hour')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('equip.perDay')}</label>
          <input type="number" className="form-input" placeholder="e.g. 3500" value={form.price_per_day} onChange={set('price_per_day')} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{t('equip.deposit')} <span className="muted">({t('equip.depositHint')})</span></label>
        <input type="number" className="form-input" placeholder={t('equip.depositPh')} value={form.deposit} onChange={set('deposit')} />
      </div>
      <div className="form-group">
        <label className="form-label">{t('equip.location')} *</label>
        <input type="text" className="form-input" placeholder="Village, Taluka" value={form.location} onChange={set('location')} required />
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('auth.district')}</label>
          <input type="text" className="form-input" value={form.district} onChange={set('district')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('auth.state')}</label>
          <input type="text" className="form-input" value={form.state} onChange={set('state')} />
        </div>
      </div>
      <label className="form-checkbox-group">
        <input type="checkbox" className="form-checkbox" checked={form.with_operator} onChange={(e) => setForm({ ...form, with_operator: e.target.checked })} />
        <span className="form-checkbox-text">{t('equip.withOperator')}</span>
      </label>
      <div className="form-group">
        <label className="form-label">{t('equip.description')}</label>
        <textarea className="form-textarea" placeholder={t('equip.descriptionPh')} value={form.description} onChange={set('description')} />
      </div>
    </FormCard>
  );
}
