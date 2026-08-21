import { useState, useEffect } from 'react';
import { fetchMe, getUser } from '../lib/api';
import { useLanguage } from '../i18n/LanguageContext';

/* Deduplicate location tokens to avoid repeating "Mumbai, Mumbai City, Mumbai City, Maharashtra," */
function cleanLocationString(profile) {
  const rawParts = [
    profile.village,
    profile.taluka,
    profile.district,
    profile.state,
    profile.location
  ].filter(Boolean);

  if (rawParts.length === 0) return 'Not set';

  const allTokens = [];
  for (const part of rawParts) {
    const split = String(part).split(',');
    for (const t of split) {
      const trimmed = t.trim();
      if (trimmed) allTokens.push(trimmed);
    }
  }

  const uniqueTokens = [];
  const seen = new Set();
  for (const token of allTokens) {
    const lower = token.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueTokens.push(token);
    }
  }

  return uniqueTokens.join(', ') || 'Not set';
}

export default function SmartFarmSelector({ farmFor, setFarmFor, farmDetails, setFarmDetails, onConfirmed }) {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(getUser() || {});
  const [otherFarm, setOtherFarm] = useState({
    village: '',
    district: '',
    size: '',
    soil_type: '',
    irrigation_type: '',
    crop: '',
    location: ''
  });

  useEffect(() => {
    fetchMe()
      .then((res) => {
        if (res.user) {
          setProfile(res.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectMyFarm = () => {
    setFarmFor('my_farm');
    const locationStr = cleanLocationString(profile);
    const summary = [
      locationStr !== 'Not set' ? `Location: ${locationStr}` : null,
      profile.farm_size ? `Size: ${profile.farm_size} ${profile.farm_size_unit || 'Acres'}` : null,
      profile.soil_type ? `Soil: ${profile.soil_type}` : null,
      profile.irrigation_type ? `Irrigation: ${profile.irrigation_type}` : null,
      profile.main_crops ? `Crops: ${profile.main_crops}` : null,
      profile.farm_access ? `Access: ${profile.farm_access}` : null
    ].filter(Boolean).join(' • ');
    setFarmDetails(summary || 'Saved My Farm Profile');
  };

  const handleOtherFarmChange = (key, val) => {
    const updated = { ...otherFarm, [key]: val };
    setOtherFarm(updated);
    const summary = [
      updated.village ? `Village: ${updated.village}` : null,
      updated.district ? `District: ${updated.district}` : null,
      updated.size ? `Size: ${updated.size} Acres` : null,
      updated.soil_type ? `Soil: ${updated.soil_type}` : null,
      updated.irrigation_type ? `Irrigation: ${updated.irrigation_type}` : null,
      updated.crop ? `Crop: ${updated.crop}` : null,
      updated.location ? `Location: ${updated.location}` : null
    ].filter(Boolean).join(' • ');
    setFarmDetails(summary || 'Someone Else\'s Farm');
  };

  const formattedLocation = cleanLocationString(profile);

  return (
    <div className="smart-farm-selector-card" style={{
      background: 'var(--color-bg-alt, #f8fafc)',
      border: '1px solid var(--color-border, #e2e8f0)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px'
    }}>
      <label className="form-label" style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
        🚜 {t('farmSelect.whoIsBookingFor')} *
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <button
          type="button"
          className={`btn-toggle-option ${farmFor === 'my_farm' ? 'active' : ''}`}
          onClick={handleSelectMyFarm}
          style={{
            padding: '12px 14px',
            borderRadius: '8px',
            border: farmFor === 'my_farm' ? '2px solid #16a34a' : '1px solid #cbd5e1',
            background: farmFor === 'my_farm' ? '#f0fdf4' : '#ffffff',
            color: farmFor === 'my_farm' ? '#15803d' : '#475569',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          🌾 {t('farmSelect.myFarm')}
        </button>

        <button
          type="button"
          className={`btn-toggle-option ${farmFor === 'other_farm' ? 'active' : ''}`}
          onClick={() => {
            setFarmFor('other_farm');
            handleOtherFarmChange('village', otherFarm.village);
          }}
          style={{
            padding: '12px 14px',
            borderRadius: '8px',
            border: farmFor === 'other_farm' ? '2px solid #2563eb' : '1px solid #cbd5e1',
            background: farmFor === 'other_farm' ? '#eff6ff' : '#ffffff',
            color: farmFor === 'other_farm' ? '#1d4ed8' : '#475569',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          📍 {t('farmSelect.otherFarm')}
        </button>
      </div>

      {/* ── Option A: My Farm Saved Summary ── */}
      {farmFor === 'my_farm' && (
        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600', color: '#16a34a' }}>✓ {t('farmSelect.savedFarmDetails')}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{profile.username || 'Farmer'}</span>
          </div>

          <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.5' }}>
            <p style={{ margin: '2px 0' }}>📍 <strong>Location:</strong> {formattedLocation}</p>
            <p style={{ margin: '2px 0' }}>📏 <strong>Size & Soil:</strong> {profile.farm_size ? `${profile.farm_size} ${profile.farm_size_unit || 'Acres'}` : 'Not set'} • {profile.soil_type || 'Not set'}</p>
            <p style={{ margin: '2px 0' }}>🌱 <strong>Crop & Irrigation:</strong> {profile.main_crops || 'Not set'} • {profile.irrigation_type || 'Not set'}</p>
          </div>
        </div>
      )}

      {/* ── Option B: Someone Else's Farm Form ── */}
      {farmFor === 'other_farm' && (
        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0', marginBottom: '12px' }}>
            {t('farmSelect.otherFarmDesc')}
          </p>

          <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="form-label">{t('farmSelect.village')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rampur"
                value={otherFarm.village}
                onChange={(e) => handleOtherFarmChange('village', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">{t('farmSelect.district')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Pune"
                value={otherFarm.district}
                onChange={(e) => handleOtherFarmChange('district', e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="form-label">{t('farmSelect.farmSize')}</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 5"
                value={otherFarm.size}
                onChange={(e) => handleOtherFarmChange('size', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">{t('farmSelect.soilType')}</label>
              <select
                className="form-select"
                value={otherFarm.soil_type}
                onChange={(e) => handleOtherFarmChange('soil_type', e.target.value)}
              >
                <option value="">Select Soil</option>
                <option value="Black (Regur)">Black (Regur)</option>
                <option value="Red">Red</option>
                <option value="Sandy">Sandy</option>
                <option value="Loamy">Loamy</option>
                <option value="Clay">Clay</option>
              </select>
            </div>
          </div>

          <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="form-label">{t('farmSelect.crop')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Wheat, Rice"
                value={otherFarm.crop}
                onChange={(e) => handleOtherFarmChange('crop', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">{t('farmSelect.irrigation')}</label>
              <select
                className="form-select"
                value={otherFarm.irrigation_type}
                onChange={(e) => handleOtherFarmChange('irrigation_type', e.target.value)}
              >
                <option value="">Select Irrigation</option>
                <option value="Borewell">Borewell</option>
                <option value="Canal">Canal</option>
                <option value="Drip">Drip Irrigation</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
