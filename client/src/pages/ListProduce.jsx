import { useState } from 'react';
import FormCard from '../components/FormCard';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { createProduce } from '../lib/api';

export default function ListProduce() {
  const { navigate } = useNav();
  const { showToast } = useToast();
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
      showToast('Produce listed!');
      navigate('produce');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <FormCard
      title="Sell Produce"
      color="banner-amber"
      backTo="produce"
      submitLabel="List Produce"
      note="Your listing will be reviewed by admin before going live."
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label className="form-label">Crop Name *</label>
        <input type="text" className="form-input" placeholder="e.g. Wheat, Rice, Tomato" value={form.crop_name} onChange={set('crop_name')} required />
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Quantity *</label>
          <input type="number" className="form-input" placeholder="e.g. 100" value={form.quantity} onChange={set('quantity')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select className="form-select" value={form.unit} onChange={set('unit')}>
            <option value="kg">kg</option><option value="quintal">quintal</option>
            <option value="tonne">tonne</option><option value="piece">piece</option>
          </select>
        </div>
      </div>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">Price per Unit (₹) *</label>
          <input type="number" className="form-input" placeholder="e.g. 30" value={form.price_per_unit} onChange={set('price_per_unit')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Quality Grade</label>
          <select className="form-select" value={form.quality_grade} onChange={set('quality_grade')}>
            <option value="A">Grade A</option><option value="B">Grade B</option><option value="C">Grade C</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Location *</label>
        <input type="text" className="form-input" placeholder="Village, Taluka" value={form.location} onChange={set('location')} required />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" placeholder="Describe the produce..." value={form.description} onChange={set('description')} />
      </div>
    </FormCard>
  );
}
