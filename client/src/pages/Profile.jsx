import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import BankDetailsCard from '../components/BankDetailsCard';
import LocationSelects from '../components/LocationSelects';
import Icon from '../components/Icon';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getProfile, updateProfile, changePassword } from '../lib/api';

export default function Profile() {
  const { navigate } = useNav();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: '',
    phone: '',
    email: '',
    state: '',
    district: '',
    taluka: '',
    village: '',
    location: '',
    farm_size: '',
    farm_size_unit: 'Acre',
    land_ownership: '',
    labour_category: '',
    skill_level: '',
    skills: '',
    bio: ''
  });

  const [pw, setPw] = useState({ current: '', next: '' });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setPwField = (key) => (e) => setPw({ ...pw, [key]: e.target.value });

  const loadUserData = (u) => {
    if (!u) return;
    setForm({
      username: u.username || '',
      phone: u.phone || '',
      email: u.email && !u.email.endsWith('@krishisangam.local') ? u.email : '',
      state: u.state || '',
      district: u.district || '',
      taluka: u.taluka || '',
      village: u.village || '',
      location: u.location || '',
      farm_size: u.farm_size || '',
      farm_size_unit: u.farm_size_unit || 'Acre',
      land_ownership: u.land_ownership || '',
      labour_category: u.labour_category || '',
      skill_level: u.skill_level || '',
      skills: u.skills || u.bio || '',
      bio: u.bio || ''
    });
  };

  useEffect(() => {
    if (!user) { navigate('signin', { replace: true }); return; }
    loadUserData(user);
    getProfile()
      .then((d) => {
        if (d.user) {
          refreshUser(d.user);
          loadUserData(d.user);
        }
      })
      .catch(() => showToast(t('profile.loadError')));
  }, []);

  const handleProfile = async (e) => {
    e.preventDefault();
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      showToast(t('auth.phoneInvalid', 'Enter a valid 10-digit mobile number starting with 9, 8, 7, or 6'));
      return;
    }
    setSaving(true);
    try {
      const fullLoc = [form.village, form.taluka, form.district, form.state].filter(Boolean).join(', ') || form.location;
      const d = await updateProfile({
        username: form.username,
        phone: form.phone,
        email: form.email,
        state: form.state,
        district: form.district,
        taluka: form.taluka,
        village: form.village,
        location: fullLoc,
        farm_size: form.farm_size,
        farm_size_unit: form.farm_size_unit,
        land_ownership: form.land_ownership,
        labour_category: form.labour_category,
        skill_level: form.skill_level,
        skills: form.skills,
        bio: form.bio
      });
      refreshUser(d.user);
      loadUserData(d.user);
      setIsEditing(false);
      showToast(t('profile.updated', 'Profile updated successfully!'));
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setSaving(false);
    }
  };

  const handlePw = async (e) => {
    e.preventDefault();
    try {
      await changePassword({ current_password: pw.current, new_password: pw.next });
      showToast(t('profile.pwChanged'));
      setPw({ current: '', next: '' });
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  if (!user) return null;

  const roleTitle = user.role === 'farmer' ? 'Farmer Profile' :
                    user.role === 'owner' ? 'Land & Equipment Owner Profile' :
                    user.role === 'labourer' ? 'Labourer / Contractor Profile' : 'System Administrator';

  const roleIcon = user.role === 'farmer' ? 'wheat' :
                   user.role === 'owner' ? 'tractor' :
                   user.role === 'labourer' ? 'worker' : 'shield';

  return (
    <>
      <PageBanner title={t('profile.title', 'User Profile & Settings')} color="slate" />

      <div style={{ maxWidth: '1020px', margin: '24px auto', padding: '0 20px' }}>

        {/* ── PROFILE HEADER HERO CARD ── */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          color: '#0f172a',
          border: '2px solid #cbd5e1',
          borderRadius: '16px',
          padding: '28px 32px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#15803d',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: '800',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)'
            }}>
              {String(user.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
                  {user.username || 'User Profile'}
                </h1>
                <span style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #86efac',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <Icon name="shield" size={13} /> Verified Member
                </span>
              </div>
              <div style={{ marginTop: '6px', color: '#334155', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name={roleIcon} size={16} />
                <span style={{ color: '#1d4ed8', fontWeight: '700' }}>{roleTitle}</span>
                {user.district && (
                  <>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#475569', fontWeight: '600' }}>
                      <Icon name="pin" size={14} /> {user.district}, {user.state || 'Maharashtra'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-hero"
            style={{
              background: isEditing ? '#475569' : '#1d4ed8',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)'
            }}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            <Icon name={isEditing ? 'x' : 'edit'} size={16} />
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* ── EDIT PROFILE FORM / MODAL CARD ── */}
        {isEditing && (
          <div style={{
            background: '#ffffff',
            border: '2px solid #3b82f6',
            borderRadius: '16px',
            padding: '28px',
            marginTop: '24px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.12)'
          }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '1.2rem', color: '#1e3a8a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="edit" size={20} /> Edit Profile Details
            </h3>

            <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('profile.username', 'Full Name / Username')} *</label>
                  <input type="text" className="form-input" value={form.username} onChange={set('username')} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('profile.phone', 'Mobile Number')} *</label>
                  <input type="tel" className="form-input" value={form.phone} onChange={set('phone')} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('auth.email', 'Email Address')} ({t('auth.optional', 'Optional')})</label>
                  <input type="email" className="form-input" placeholder="name@example.com" value={form.email} onChange={set('email')} />
                </div>
              </div>

              {/* Location Selects */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#334155', fontWeight: '700' }}>
                  <Icon name="pin" size={15} style={{ verticalAlign: '-2px', marginRight: '6px' }} /> Region & Location Details
                </h4>
                <LocationSelects
                  state={form.state}
                  district={form.district}
                  taluka={form.taluka}
                  village={form.village}
                  onStateChange={(v) => setForm({ ...form, state: v, district: '' })}
                  onDistrictChange={(v) => setForm({ ...form, district: v })}
                  onTalukaChange={(v) => setForm({ ...form, taluka: v })}
                  onVillageChange={(v) => setForm({ ...form, village: v })}
                />
              </div>

              {/* Role Specific Inputs */}
              {user.role === 'farmer' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Farm Size</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="number" step="0.1" className="form-input" placeholder="e.g. 5" value={form.farm_size} onChange={set('farm_size')} />
                      <select className="form-select" value={form.farm_size_unit} onChange={set('farm_size_unit')} style={{ width: '100px' }}>
                        <option value="Acre">Acre</option>
                        <option value="Hectare">Hectare</option>
                        <option value="Guntha">Guntha</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Land Ownership</label>
                    <select className="form-select" value={form.land_ownership} onChange={set('land_ownership')}>
                      <option value="">Select Ownership</option>
                      <option value="Owned">Owned</option>
                      <option value="Leased">Leased</option>
                      <option value="Shared">Shared Farming</option>
                    </select>
                  </div>
                </div>
              )}

              {user.role === 'labourer' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Work Profile / Category</label>
                    <input type="text" className="form-input" placeholder="e.g. Team Leader / Contractor" value={form.labour_category} onChange={set('labour_category')} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Skills & Specializations</label>
                    <input type="text" className="form-input" placeholder="e.g. Harvesting, Spraying, Sowing" value={form.skills} onChange={set('skills')} />
                  </div>
                </div>
              )}

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t('profile.bio', 'Bio / About Yourself')}</label>
                <textarea className="form-textarea" rows="3" placeholder="Tell other farmers or service providers about your work..." value={form.bio} onChange={set('bio')} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn-small" style={{ background: '#64748b', color: '#fff', borderRadius: '8px', padding: '10px 20px', fontWeight: 600 }} onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-small" style={{ background: '#16a34a', color: '#fff', borderRadius: '8px', padding: '10px 24px', fontWeight: 700 }} disabled={saving}>
                  {saving ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── MULTIPLE INFORMATION GRID (4 CARDS) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>

          {/* Card 1: Identity & Verification */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="idCard" size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>Identity & Verification</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Account Role:</span>
                <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{user.role}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Government ID Type:</span>
                <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{user.id_type || 'Aadhaar Card'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Government ID Number:</span>
                <strong style={{ color: '#0f172a' }}>{user.id_number || 'Registered'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Verification Status:</span>
                <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name="check" size={14} /> Verified Active
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Region & Location */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="pin" size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>Location & Region</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>State:</span>
                <strong style={{ color: '#0f172a' }}>{user.state || 'Maharashtra'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>District:</span>
                <strong style={{ color: '#0f172a' }}>{user.district || 'Nashik'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Taluka / Sub-District:</span>
                <strong style={{ color: '#0f172a' }}>{user.taluka || 'Central'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Village / Address:</span>
                <strong style={{ color: '#0f172a' }}>{user.village || user.location || 'Local Region'}</strong>
              </div>
            </div>
          </div>

          {/* Card 3: Role Specific Information */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={roleIcon} size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                {user.role === 'farmer' ? 'Farm & Crop Details' : user.role === 'owner' ? 'Equipment & Land Details' : 'Skillset & Work Profile'}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#334155' }}>
              {user.role === 'farmer' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Land Ownership:</span>
                    <strong style={{ color: '#0f172a' }}>{user.land_ownership || 'Owned'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Farm Size:</span>
                    <strong style={{ color: '#0f172a' }}>{user.farm_size ? `${user.farm_size} ${user.farm_size_unit || 'Acre'}` : 'Not Specified'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Main Crops:</span>
                    <strong style={{ color: '#0f172a' }}>{user.main_crops || 'Wheat, Sugarcane, Vegetables'}</strong>
                  </div>
                </>
              )}
              {user.role === 'owner' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Ownership Type:</span>
                    <strong style={{ color: '#0f172a' }}>
                      {user.owner_type === 'both' ? 'Both Land & Equipment Owner' :
                       user.owner_type === 'land' ? 'Land Owner' :
                       user.owner_type === 'equipment' ? 'Equipment Owner' : 'Land & Equipment Owner'}
                    </strong>
                  </div>
                  {(user.owner_type === 'both' || user.owner_type === 'land' || !user.owner_type) && user.farm_size && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Land Size:</span>
                      <strong style={{ color: '#0f172a' }}>{user.farm_size} {user.farm_size_unit || 'Acre'}</strong>
                    </div>
                  )}
                  {(user.owner_type === 'both' || user.owner_type === 'equipment' || !user.owner_type) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Equipments Owned:</span>
                      <strong style={{ color: '#0f172a' }}>{user.equipments_owned || 'Tractor, Rotavator'}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Service Coverage Radius:</span>
                    <strong style={{ color: '#0f172a' }}>25 km Radius</strong>
                  </div>
                </>
              )}
              {user.role === 'labourer' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Category:</span>
                    <strong style={{ color: '#0f172a' }}>{user.labour_category || 'Team Leader / Contractor'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Registered Skills:</span>
                    <strong style={{ color: '#0f172a' }}>{user.skills || 'Harvesting, Sowing, Spraying'}</strong>
                  </div>
                </>
              )}
              {user.role === 'admin' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Privileges:</span>
                  <strong style={{ color: '#0f172a' }}>Full System Access & Control</strong>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Contact & Account */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fae8ff', color: '#86198f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="user" size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>Contact & Account</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Mobile Number:</span>
                <strong style={{ color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name="phone" size={13} /> {user.phone}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Email:</span>
                <strong style={{ color: '#0f172a' }}>
                  {user.email && !user.email.endsWith('@krishisangam.local') ? user.email : 'Optional'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Registered Date:</span>
                <strong style={{ color: '#0f172a' }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                </strong>
              </div>
            </div>
          </div>

        </div>

        {/* ── BANK & PAYOUT ACCOUNT DETAILS ── */}
        <BankDetailsCard />

        {/* ── PROVIDER AVAILABILITY CALENDAR ── */}
        <AvailabilityCalendar />

        {/* ── CHANGE PASSWORD CARD ── */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '14px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="lock" size={18} /> {t('profile.changePw', 'Change Password')}
          </h3>
          <form className="form-body" onSubmit={handlePw}>
            <div className="form-group">
              <label className="form-label">{t('profile.currentPw', 'Current Password')}</label>
              <input type="password" className="form-input" value={pw.current} onChange={setPwField('current')} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('profile.newPw', 'New Password')}</label>
              <input type="password" className="form-input" minLength="6" value={pw.next} onChange={setPwField('next')} required />
            </div>
            <button type="submit" className="btn-form-submit btn-danger">{t('profile.changePwBtn', 'Update Password')}</button>
          </form>
        </div>

      </div>
    </>
  );
}
