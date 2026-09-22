import { useState } from 'react';
import FormCard from '../components/FormCard';
import PhotoUpload from '../components/PhotoUpload';
import FarmLocationField from '../components/FarmLocationField';
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
    location: '', district: '', state: '', with_operator: true, description: '',
    hp: '', attachment: '', brand: '', model: '', year: '', registration_number: '',
    attachments_list: '', max_distance: '25'
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    if (!form.brand?.trim() || !form.model?.trim() || !form.year || !form.hp || !form.registration_number?.trim()) {
      showToast(t('common.error', { msg: 'Brand, Model, Year, Horsepower, and Registration Number are required.' }));
      return;
    }
    if (!form.district?.trim() || !form.state?.trim()) {
      showToast(t('common.error', { msg: 'District and State are required.' }));
      return;
    }
    try {
      const isTractor = String(form.type).toLowerCase().includes('tractor') || String(form.name).toLowerCase().includes('tractor');
      await createEquipment({
        name: form.name,
        type: form.type,
        price_per_hour: form.price_per_hour ? Number(form.price_per_hour) : null,
        price_per_day: form.price_per_day ? Number(form.price_per_day) : null,
        deposit: form.deposit ? Number(form.deposit) : null,
        location: form.location,
        district: form.district.trim(),
        state: form.state.trim(),
        with_operator: isTractor ? true : form.with_operator,
        hp: form.hp ? Number(form.hp) : null,
        attachment: form.attachment || null,
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: form.year ? Number(form.year) : null,
        registration_number: form.registration_number.trim(),
        attachments_list: form.attachments_list || form.attachment || null,
        max_distance: form.max_distance ? Number(form.max_distance) : 25,
        description: form.description || null,
        photo_url: photoUrl
      });
      showToast(t('equip.created', 'Equipment listing created successfully!'));
      navigate('equipment-rental');
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const isTractor = String(form.type).toLowerCase().includes('tractor') || String(form.name).toLowerCase().includes('tractor');

  return (
    <FormCard
      title={t('equip.listTitle', 'List Equipment for Rent')}
      color="banner-orange"
      backTo="equipment-rental"
      submitLabel={t('equip.add', 'List Equipment')}
      note={t('land.note', 'Your listing will be instantly live for matching farmers.')}
      onSubmit={handleSubmit}
    >
      <PhotoUpload onUploaded={setPhotoUrl} />

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('equip.name', 'Listing Title / Model Name')} *</label>
          <input type="text" className="form-input" placeholder="e.g. Mahindra 575 DI Tractor" value={form.name} onChange={set('name')} required />
        </div>
        <div className="form-group">
          <label className="form-label">{t('equip.type', 'Equipment Category')} *</label>
          <select className="form-select" value={form.type} onChange={set('type')} required>
            <option value="Tractor">Tractor</option>
            <option value="Harvester">Combine Harvester</option>
            <option value="Sprayer">Tractor / Drone Sprayer</option>
            <option value="Rotavator">Rotavator</option>
            <option value="Seed Drill">Seed Drill</option>
            <option value="Thresher">Thresher</option>
            <option value="Other">Other Equipment</option>
          </select>
        </div>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('equip.brand', 'Brand / Make')} *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Mahindra, Swaraj, John Deere"
            value={form.brand}
            onChange={set('brand')}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('equip.modelYear', 'Model Name & Year')} *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 575 DI"
              value={form.model}
              onChange={set('model')}
              required
            />
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 2022"
              style={{ width: '100px' }}
              value={form.year}
              onChange={set('year')}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('equip.hp', 'Horsepower (HP)')} *</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 45"
            value={form.hp}
            onChange={set('hp')}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('equip.registrationNumber', 'Registration / RTO Number')} *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. MH-12-AB-1234"
            value={form.registration_number}
            onChange={set('registration_number')}
            required
          />
        </div>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Attachments Included</label>
          <input type="text" className="form-input" placeholder="e.g. Rotavator, 9-tyne Cultivator, Trolley" value={form.attachments_list} onChange={set('attachments_list')} />
        </div>
        <div className="form-group">
          <label className="form-label">Max Service Radius (km)</label>
          <input type="number" className="form-input" placeholder="Default 25 km" value={form.max_distance} onChange={set('max_distance')} />
        </div>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('equip.perHour', 'Rate per Hour (₹)')}</label>
          <input type="number" className="form-input" placeholder="e.g. 500" value={form.price_per_hour} onChange={set('price_per_hour')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('equip.perDay', 'Rate per Day (₹)')}</label>
          <input type="number" className="form-input" placeholder="e.g. 3500" value={form.price_per_day} onChange={set('price_per_day')} />
        </div>
      </div>

      <FarmLocationField
        value={form.location}
        onChange={(v) => setForm((prev) => ({ ...prev, location: v }))}
        onDetails={({ district, state }) => {
          setForm((prev) => ({
            ...prev,
            district: district || prev.district,
            state: state || prev.state
          }));
        }}
      />

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('auth.district', 'District')} *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Nashik"
            value={form.district}
            onChange={set('district')}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('auth.state', 'State')} *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Maharashtra"
            value={form.state}
            onChange={set('state')}
            required
          />
        </div>
      </div>



      <div className="form-group">
        <label className="form-label">{t('equip.description', 'Description & Operating Details')}</label>
        <textarea className="form-textarea" placeholder={t('equip.descriptionPh', 'Condition, diesel terms, available operating hours...')} value={form.description} onChange={set('description')} />
      </div>
    </FormCard>
  );
}
