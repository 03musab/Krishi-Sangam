import { useState } from 'react';
import FormCard from '../components/FormCard';
import PhotoUpload from '../components/PhotoUpload';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { createLand } from '../lib/api';

export default function ListLand() {
  const { navigate } = useNav();
  const { showToast } = useToast();
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
      showToast('Land listing created!');
      navigate('land-leasing');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <FormCard
      title="List Your Land"
      color="banner-green"
      backTo="land-leasing"
      submitLabel="Submit Listing"
      note="Your listing will be reviewed by admin before going live."
      onSubmit={handleSubmit}
    >
      <PhotoUpload onUploaded={setPhotoUrl} />
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input type="text" className="form-input" placeholder="e.g. 5 Acre Farm in Nashik" value={form.title} onChange={set('title')} required />
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Area (Acres) *</label>
          <input type="number" className="form-input" placeholder="e.g. 5" value={form.area_acres} onChange={set('area_acres')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Lease Type</label>
          <select className="form-select" value={form.lease_type} onChange={set('lease_type')}>
            <option>Per Season</option><option>Per Month</option><option>Per Year</option>
          </select>
        </div>
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Price per Season (₹)</label>
          <input type="number" className="form-input" placeholder="e.g. 25000" value={form.price_per_season} onChange={set('price_per_season')} />
        </div>
        <div className="form-group">
          <label className="form-label">Price per Year (₹)</label>
          <input type="number" className="form-input" placeholder="e.g. 50000" value={form.price_per_year} onChange={set('price_per_year')} />
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
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Soil Type</label>
          <select className="form-select" value={form.soil_type} onChange={set('soil_type')}>
            <option>Black Soil</option><option>Red Soil</option><option>Alluvial Soil</option><option>Loamy Soil</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Water Source</label>
          <select className="form-select" value={form.water_source} onChange={set('water_source')}>
            <option>Borewell</option><option>Canal</option><option>River</option><option>Well</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" placeholder="Describe the land..." value={form.description} onChange={set('description')} />
      </div>
    </FormCard>
  );
}
