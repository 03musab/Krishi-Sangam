import { useState } from 'react';
import FormCard from '../components/FormCard';
import PhotoUpload from '../components/PhotoUpload';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { createEquipment } from '../lib/api';

export default function ListEquipment() {
  const { navigate } = useNav();
  const { showToast } = useToast();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [form, setForm] = useState({
    name: '', type: 'Tractor', price_per_hour: '', price_per_day: '',
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
        location: form.location,
        district: form.district || null,
        state: form.state || null,
        with_operator: form.with_operator,
        description: form.description || null,
        photo_url: photoUrl
      });
      showToast('Equipment listed!');
      navigate('equipment-rental');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <FormCard
      title="List Equipment"
      color="banner-orange"
      backTo="equipment-rental"
      submitLabel="Add Listing"
      note="Your listing will be reviewed by admin before going live."
      onSubmit={handleSubmit}
    >
      <PhotoUpload onUploaded={setPhotoUrl} />
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input type="text" className="form-input" placeholder="e.g. Mahindra 575" value={form.name} onChange={set('name')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Type *</label>
          <select className="form-select" value={form.type} onChange={set('type')} required>
            <option>Tractor</option><option>Harvester</option><option>Sprayer</option>
            <option>Rotavator</option><option>Seed Drill</option><option>Other</option>
          </select>
        </div>
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Per Hour (₹)</label>
          <input type="number" className="form-input" placeholder="e.g. 500" value={form.price_per_hour} onChange={set('price_per_hour')} />
        </div>
        <div className="form-group">
          <label className="form-label">Per Day (₹)</label>
          <input type="number" className="form-input" placeholder="e.g. 3500" value={form.price_per_day} onChange={set('price_per_day')} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Location *</label>
        <input type="text" className="form-input" placeholder="Village, Taluka" value={form.location} onChange={set('location')} required />
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">District</label>
          <input type="text" className="form-input" value={form.district} onChange={set('district')} />
        </div>
        <div className="form-group">
          <label className="form-label">State</label>
          <input type="text" className="form-input" value={form.state} onChange={set('state')} />
        </div>
      </div>
      <label className="form-checkbox-group">
        <input type="checkbox" className="form-checkbox" checked={form.with_operator} onChange={(e) => setForm({ ...form, with_operator: e.target.checked })} />
        <span className="form-checkbox-text">With Operator</span>
      </label>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" placeholder="Describe the equipment..." value={form.description} onChange={set('description')} />
      </div>
    </FormCard>
  );
}
