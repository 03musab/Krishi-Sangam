import { useState } from 'react';
import FormCard from '../components/FormCard';
import PhotoUpload from '../components/PhotoUpload';
import FarmLocationField from '../components/FarmLocationField';
import AreaField from '../components/AreaField';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { createLand } from '../lib/api';

export default function ListLand() {
  const { navigate } = useNav();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [form, setForm] = useState({
    title: '', area_acres: '', lease_type: 'Per Season', price_per_season: '',
    price_per_year: '', location: '', district: '', state: '',
    soil_type: 'Black Soil', water_source: 'Borewell', description: ''
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    try {
      await createLand({
        title: form.title,
        area_acres: Number(form.area_acres),
        lease_type: form.lease_type,
        price_per_season: form.price_per_season ? Number(form.price_per_season) : null,
        price_per_year: form.price_per_year ? Number(form.price_per_year) : null,
        location: form.location,
        district: form.district || null,
        state: form.state || null,
        soil_type: form.soil_type,
        water_source: form.water_source,
        description: form.description || null,
        photo_url: photoUrl
      });
      showToast(t('land.created'));
      navigate('land-leasing');
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <FormCard
      title={t('land.listTitle')}
      color="banner-green"
      backTo="land-leasing"
      submitLabel={t('land.submit')}
      onSubmit={handleSubmit}
    >
      <PhotoUpload onUploaded={setPhotoUrl} />
      <div className="form-group">
        <label className="form-label">{t('land.titleLabel')} *</label>
        <input type="text" className="form-input" placeholder={t('land.titlePh')} value={form.title} onChange={set('title')} required />
      </div>
      <div className="form-grid-row">
        <AreaField
          label={t('land.area')}
          value={form.area_acres}
          onChange={(v) => setForm({ ...form, area_acres: v })}
          required
        />
        <div className="form-group">
          <label className="form-label">{t('land.leaseType')}</label>
          <select className="form-select" value={form.lease_type} onChange={set('lease_type')}>
            <option>{t('land.perSeason')}</option><option>{t('land.perMonth')}</option><option>{t('land.perYear')}</option>
          </select>
        </div>
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('land.priceSeason')}</label>
          <input type="number" className="form-input" placeholder="e.g. 25000" value={form.price_per_season} onChange={set('price_per_season')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('land.priceYear')}</label>
          <input type="number" className="form-input" placeholder="e.g. 50000" value={form.price_per_year} onChange={set('price_per_year')} />
        </div>
      </div>
      <FarmLocationField value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
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
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('land.soilType')}</label>
          <select className="form-select" value={form.soil_type} onChange={set('soil_type')}>
            <option>{t('land.black')}</option><option>{t('land.red')}</option><option>{t('land.alluvial')}</option><option>{t('land.loamy')}</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('land.water')}</label>
          <select className="form-select" value={form.water_source} onChange={set('water_source')}>
            <option>{t('land.borewell')}</option><option>{t('land.canal')}</option><option>{t('land.river')}</option><option>{t('land.well')}</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{t('land.description')}</label>
        <textarea className="form-textarea" placeholder={t('land.descriptionPh')} value={form.description} onChange={set('description')} />
      </div>
    </FormCard>
  );
}
