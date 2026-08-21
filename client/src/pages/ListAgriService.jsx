import { useState } from 'react';
import FormCard from '../components/FormCard';
import PhotoUpload from '../components/PhotoUpload';
import FarmLocationField from '../components/FarmLocationField';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { createAgriService } from '../lib/api';

const SERVICE_CATEGORIES = [
  'Land Preparation & Tilling',
  'Crop Protection & Drone Spraying',
  'Soil Testing & Nutrient Management',
  'Sowing, Planting & Nursery',
  'Irrigation & Water Systems',
  'Crop Harvesting & Threshing',
  'Post-Harvest & Storage',
  'Orchard & Vineyard Management',
  'Expert Advisory & Consultation'
];

const PRICING_TYPES = [
  { value: 'per_acre', label: 'Per Acre (₹/Acre)' },
  { value: 'per_hour', label: 'Per Hour (₹/Hour)' },
  { value: 'per_day', label: 'Per Day (₹/Day)' },
  { value: 'fixed', label: 'Fixed Price (₹/Job)' }
];

export default function ListAgriService() {
  const { navigate } = useNav();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [photoUrl, setPhotoUrl] = useState('');
  const [coords, setCoords] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: SERVICE_CATEGORIES[0],
    sub_category: '',
    description: '',
    price: '',
    pricing_type: 'per_acre',
    equipment_included: '',
    service_area_km: '25',
    location: '',
    district: '',
    state: 'Maharashtra'
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.location) {
      showToast(t('common.fillRequired', 'Please fill in all required fields.'));
      return;
    }

    try {
      await createAgriService({
        title: form.title,
        category: form.category,
        sub_category: form.sub_category,
        description: form.description,
        price: Number(form.price),
        pricing_type: form.pricing_type,
        equipment_included: form.equipment_included,
        service_area_km: Number(form.service_area_km),
        location: form.location,
        district: form.district,
        state: form.state,
        lat: coords?.lat || null,
        lng: coords?.lng || null,
        photo_url: photoUrl || null
      });

      showToast(t('agriService.createdToast', 'Agricultural service listed successfully!'));
      navigate('agri-services');
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <FormCard
      title={t('agriService.listBannerTitle', 'List Your Agricultural Service')}
      color="banner-teal"
      backTo="agri-services"
      submitLabel={t('agriService.submit', '✨ List Agricultural Service')}
      onSubmit={handleSubmit}
    >
      <PhotoUpload onUploaded={setPhotoUrl} />

      <div className="form-group">
        <label className="form-label">Service Title *</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Precision Drone Crop Spraying & Health Mapping"
          value={form.title}
          onChange={set('title')}
          required
        />
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Service Category *</label>
          <select className="form-select" value={form.category} onChange={set('category')}>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Sub-Category / Specialization</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Fungicide Spraying, Deep Ploughing"
            value={form.sub_category}
            onChange={set('sub_category')}
          />
        </div>
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Pricing Model *</label>
          <select className="form-select" value={form.pricing_type} onChange={set('pricing_type')}>
            {PRICING_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Rate / Price (₹) *</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 400"
            value={form.price}
            onChange={set('price')}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Service Radius (km)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 25"
            value={form.service_area_km}
            onChange={set('service_area_km')}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Equipment & Tools Included</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. DJI Agras T40 Drone, 3 High-capacity Batteries, Water Tanker"
          value={form.equipment_included}
          onChange={set('equipment_included')}
        />
      </div>

      <FarmLocationField
        value={form.location}
        onChange={(val, newCoords) => {
          setForm((prev) => ({ ...prev, location: val }));
          if (newCoords) setCoords(newCoords);
        }}
      />

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">District</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Nashik, Pune"
            value={form.district}
            onChange={set('district')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">State</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Maharashtra"
            value={form.state}
            onChange={set('state')}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Detailed Description</label>
        <textarea
          className="form-textarea"
          rows="4"
          placeholder="Describe operational experience, daily output capacity, safety protocols, and farmer requirements..."
          value={form.description}
          onChange={set('description')}
        />
      </div>
    </FormCard>
  );
}
