import { useEffect, useRef, useState } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { register, sendOtp, verifyOtp } from '../lib/api';
import PhotoUpload from '../components/PhotoUpload';
import LocationSelects from '../components/LocationSelects';
import FarmLocationField from '../components/FarmLocationField';
import WelcomeOverlay from '../components/WelcomeOverlay';
import OtpInput from '../components/OtpInput';
import OtpResend from '../components/OtpResend';
import Icon from '../components/Icon';

const ROLES = [
  { value: 'farmer', labelKey: 'auth.farmer', icon: 'farmer', descKey: 'auth.farmerDesc' },
  { value: 'owner', labelKey: 'auth.owner', icon: 'tractor', descKey: 'auth.ownerDesc' },
  { value: 'labourer', labelKey: 'auth.labourer', icon: 'worker', descKey: 'auth.labourerDesc' }
];

const ID_TYPES = [
  { value: 'aadhaar', labelKey: 'auth.idAadhaar' },
  { value: 'voter', labelKey: 'auth.idVoter' },
  { value: 'driving', labelKey: 'auth.idDriving' }
];

const CROP_OPTIONS = [
  { value: 'Wheat', labelKey: 'auth.wheat', icon: '🌾' },
  { value: 'Rice', labelKey: 'auth.rice', icon: '🍚' },
  { value: 'Cotton', labelKey: 'auth.cotton', icon: '☁️' },
  { value: 'Sugarcane', labelKey: 'auth.sugarcane', icon: '🎋' },
  { value: 'Soybean', labelKey: 'auth.soybean', icon: '🫘' },
  { value: 'Maize', labelKey: 'auth.maize', icon: '🌽' },
  { value: 'Pulses', labelKey: 'auth.pulses', icon: '🫛' },
  { value: 'Other', labelKey: 'auth.other', icon: '•••' }
];

const IRRIGATION_OPTIONS = [
  { value: 'Rainfed', labelKey: 'auth.rainfed', icon: '🌧️' },
  { value: 'Borewell', labelKey: 'auth.borewell', icon: '💧' },
  { value: 'Canal', labelKey: 'auth.canal', icon: '🏞️' },
  { value: 'Drip', labelKey: 'auth.drip', icon: '💦' },
  { value: 'Sprinkler', labelKey: 'auth.sprinkler', icon: '🚿' },
  { value: 'Other', labelKey: 'auth.other', icon: '•••' }
];

const OWNERSHIP_OPTIONS = [
  { value: 'Owned', labelKey: 'auth.owned' },
  { value: 'Leased', labelKey: 'auth.leased' },
  { value: 'Ancestral', labelKey: 'auth.ancestral' },
  { value: 'Government Allotted', labelKey: 'auth.government' }
];

const EXPERIENCE_OPTIONS = [
  { value: '1 – 2 years', labelKey: 'auth.exp1to2' },
  { value: '2 – 5 years', labelKey: 'auth.exp2to5' },
  { value: '5 – 10 years', labelKey: 'auth.exp5to10' },
  { value: '10+ years', labelKey: 'auth.exp10plus' }
];

const ACCESS_OPTIONS = [
  { value: 'Tractor accessible', labelKey: 'auth.tractorAccessible' },
  { value: 'Vehicle accessible', labelKey: 'auth.vehicleAccessible' },
  { value: 'Not easily accessible', labelKey: 'auth.notEasilyAccessible' }
];

function GovtIdSection({ form, setForm, t }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">{t('auth.idTypeLabel')} *</label>
        <select
          className="form-select"
          value={form.id_type}
          onChange={(e) => setForm({ ...form, id_type: e.target.value })}
          required
        >
          <option value="">{t('auth.selectIdType')}</option>
          {ID_TYPES.map((id) => (
            <option key={id.value} value={id.value}>{t(id.labelKey)}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.idNumber')} *</label>
        <input
          type="text"
          className="form-input"
          value={form.id_number}
          onChange={(e) => setForm({ ...form, id_number: e.target.value })}
          placeholder={t('auth.idNumberPh')}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.govtIdPhoto')} ({t('auth.optional')})</label>
        <PhotoUpload onUploaded={(url) => setForm({ ...form, govt_id_url: url })} />
      </div>
    </>
  );
}

/* ── Chip group (multi-select or single-select) ── */
function ChipGroup({ options, selected, onToggle, multi = true, t }) {
  const handleClick = (val) => {
    if (multi) {
      // Use functional update to avoid stale-state bugs on rapid clicks
      onToggle((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
      });
    } else {
      onToggle((prev) => (val === prev ? '' : val));
    }
  };

  return (
    <div className="chip-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`chip ${(multi ? selected.includes(opt.value) : selected === opt.value) ? 'active' : ''}`}
          onClick={() => handleClick(opt.value)}
        >
          <span className="chip-icon">{opt.icon}</span>
          {opt.labelKey && t ? t(opt.labelKey) : opt.value}
        </button>
      ))}
    </div>
  );
}

/* ── Step indicator (farmer 4-step flow) ── */
function FarmerStepIndicator({ current, t }) {
  const steps = [t('auth.stepBasic'), t('auth.stepFarm'), t('auth.stepLocation'), t('auth.stepReview')];
  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <span key={s} className={`step-pill ${i === current ? 'active' : i < current ? 'done' : ''}`}>
          {i + 1}. {s}
        </span>
      ))}
    </div>
  );
}

/* ── Simple step indicator for owner/labourer ── */
function SimpleStepIndicator({ current, t }) {
  const steps = [t('auth.stepRole'), t('auth.stepDetails'), t('auth.stepVerify')];
  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <span key={s} className={`step-pill ${i === current ? 'active' : i < current ? 'done' : ''}`}>
          {i + 1}. {s}
        </span>
      ))}
    </div>
  );
}

/* ── Review row helper ── */
function ReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className="review-value">{value}</span>
    </div>
  );
}

export default function SignUp() {
  const { navigate, back } = useNav();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', password: '', confirmPassword: '',
    gender: 'Male', dob: '', govt_id_url: '', id_type: '', id_number: '',
    district: '', state: '',
    labour_category: '', skill_level: 'Skilled',
    bank_account: '', ifsc: '', upi_id: '',
    farm_size: '', farm_size_unit: 'Acre',
    land_ownership: '', irrigation_type: '',
    main_crops: [], soil_type: '', farming_experience: '',
    farm_access: '', farm_notes: ''
  });
  const [farmCoords, setFarmCoords] = useState(null);
  const [farmLoc, setFarmLoc] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [status, setStatus] = useState('idle');
  const [welcomeName, setWelcomeName] = useState('');
  const navTimer = useRef(null);

  useEffect(() => () => clearTimeout(navTimer.current), []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const isFarmer = role === 'farmer';
  const isDetailed = role === 'labourer' || role === 'owner';

  const doSendOtp = async () => {
    if (!/^\d{10}$/.test(form.phone)) {
      showToast(t('auth.phoneInvalid'));
      return;
    }
    const res = await sendOtp({ phone: form.phone });
    setOtpSent(true);
    if (res.devOtp) {
      showToast(t('auth.otpSent', { otp: res.devOtp }), 5000);
    } else {
      showToast(t('auth.otpSentReal'));
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await doSendOtp();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const verifyOtpCode = async (code) => {
    const codeToCheck = (code || otp).trim();
    if (codeToCheck.length !== 6 || otpVerified) return;
    try {
      await verifyOtp({ phone: form.phone, otp: codeToCheck });
      setOtpVerified(true);
      showToast(t('auth.phoneVerified'));
      setTimeout(() => {
        setOtpSent(false);
        setStep(isFarmer ? 2 : 2);
      }, 800);
    } catch (err) {
      setOtp('');
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleCropToggle = (fn) => setForm((prev) => ({ ...prev, main_crops: typeof fn === 'function' ? fn(prev.main_crops) : fn }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFarmer && form.password !== form.confirmPassword) {
      showToast(t('auth.passwordMismatch'));
      return;
    }
    setStatus('loading');
    try {
      const payload = {
        full_name: form.full_name,
        username: undefined,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        role,
        gender: isDetailed ? form.gender : undefined,
        dob: isDetailed ? form.dob : undefined,
        govt_id_url: form.govt_id_url || undefined,
        id_type: form.id_type || undefined,
        id_number: form.id_number || undefined,
        district: form.district,
        state: form.state,
        location: farmLoc || undefined,
        labour_category: isDetailed ? form.labour_category : undefined,
        skill_level: isDetailed ? form.skill_level : undefined,
        bank_account: isDetailed ? form.bank_account : undefined,
        ifsc: isDetailed ? form.ifsc : undefined,
        upi_id: isDetailed ? form.upi_id : undefined,
        farm_size: form.farm_size || undefined,
        farm_size_unit: isFarmer ? form.farm_size_unit : undefined,
        land_ownership: isFarmer ? form.land_ownership || undefined : undefined,
        irrigation_type: isFarmer ? form.irrigation_type || undefined : undefined,
        main_crops: isFarmer && form.main_crops.length ? form.main_crops.join(', ') : undefined,
        soil_type: isFarmer ? form.soil_type || undefined : undefined,
        farming_experience: isFarmer ? form.farming_experience || undefined : undefined,
        farm_access: isFarmer ? form.farm_access || undefined : undefined,
        farm_notes: isFarmer ? form.farm_notes || undefined : undefined,
        farm_lat: farmCoords?.lat,
        farm_lng: farmCoords?.lng
      };
      const data = await register(payload);
      login(data.token, data.user);
      setWelcomeName(data.user.username);
      setStatus('success');
      navTimer.current = setTimeout(() => {
        showToast(t('common.toast.welcome', { name: data.user.username }));
        navigate('home');
      }, 1400);
    } catch (err) {
      setStatus('idle');
      showToast(t('common.error', { msg: err.message }));
    }
  };

  /* ────────── Farmer 4-step flow ────────── */
  if (isFarmer || step > 0) {
    const farmerSteps = isFarmer
      ? [t('auth.stepBasic'), t('auth.stepFarm'), t('auth.stepLocation'), t('auth.stepReview')]
      : [t('auth.stepRole'), t('auth.stepDetails'), t('auth.stepVerify')];

    return (
      <div className="form-card-container auth-container">
        {status === 'success' && <WelcomeOverlay name={welcomeName} />}
        <div className="form-card">
          <button className="btn-back-icon" onClick={back} aria-label="Back" style={{ marginBottom: '14px' }}>←</button>
          <h2 className="auth-title">{t('auth.signupTitle')}</h2>

          {isFarmer ? (
            <FarmerStepIndicator current={step} t={t} />
          ) : (
            <SimpleStepIndicator current={step} t={t} />
          )}

          {/* ── Step 0: Role selection ── */}
          {step === 0 && (
            <div className="role-select">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  className={`role-option ${role === r.value ? 'selected' : ''}`}
                  onClick={() => setRole(r.value)}
                >
                  <span className="role-emoji"><Icon name={r.icon} size={22} /></span>
                  <span className="role-label">{t(r.labelKey)}</span>
                  <span className="role-desc">{t(r.descKey)}</span>
                </button>
              ))}
              <button className="btn-form-submit" disabled={!role} onClick={() => setStep(1)}>
                {t('auth.continue')}
              </button>
            </div>
          )}

          {/* ── Step 1 (Farmer): Basic Details ── */}
          {isFarmer && step === 1 && (
            <form className="form-body" onSubmit={handleSendOtp}>
              <div className="form-group">
                <label className="form-label">{t('auth.fullName')} *</label>
                <input type="text" className="form-input" placeholder="Enter your full name" value={form.full_name} onChange={set('full_name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.mobile')} *</label>
                <div className="otp-row">
                  <input type="tel" className="form-input" placeholder="10-digit mobile number" value={form.phone} onChange={set('phone')} required />
                  <button type="submit" className="btn-small" style={{ background: '#15803d', whiteSpace: 'nowrap' }}>
                    {t('auth.sendOtp')}
                  </button>
                </div>
              </div>
              {otpSent && (
                <div className="form-group">
                  <label className="form-label">{t('auth.enterOtp')} *</label>
                  {otpVerified ? (
                    <div className="phone-verified-badge">
                      <Icon name="check" size={16} /> {t('auth.phoneVerifiedBadge')}
                    </div>
                  ) : (
                    <>
                      <OtpInput value={otp} onChange={setOtp} autoFocus onComplete={verifyOtpCode} />
                      <div className="otp-resend-row">
                        <OtpResend onResend={doSendOtp} />
                        <button
                          type="button"
                          className="btn-small"
                          style={{ background: '#0d9488', whiteSpace: 'nowrap' }}
                          onClick={() => verifyOtpCode(otp)}
                        >
                          {t('auth.verify')}
                        </button>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '8px' }}>
                        <button type="button" className="review-edit-btn" onClick={() => { setOtpVerified(true); setOtpSent(false); setStep(2); }}>
                          {t('auth.skipOtp')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{t('auth.email')} ({t('auth.optional')})</label>
                <input type="email" className="form-input" autoComplete="email" placeholder="Enter email address" value={form.email} onChange={set('email')} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.password6')} *</label>
                <input type="password" className="form-input" minLength="6" placeholder="Create a password" value={form.password} onChange={set('password')} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.confirmPassword')} *</label>
                <input type="password" className="form-input" minLength="6" placeholder={t('auth.confirmPasswordPh')} value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
              <div className="safety-note">
                <span className="safety-note-icon">🛡️</span>
                <span>{t('auth.securityNote')}</span>
              </div>
              <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(0)}>{t('common.back')}</button>
            </form>
          )}

          {/* ── Step 1 (Owner/Labourer): Details ── */}
          {!isFarmer && step === 1 && (
            <form className="form-body" onSubmit={handleSendOtp}>
              <div className="form-grid-row">
                <div className="form-group">
                  <label className="form-label">{t('auth.fullName')} *</label>
                  <input type="text" className="form-input" placeholder="Your full name" value={form.full_name} onChange={set('full_name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.email')}</label>
                  <input type="email" className="form-input" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.mobile')} *</label>
                <div className="otp-row">
                  <input type="tel" className="form-input" placeholder="10-digit mobile" value={form.phone} onChange={set('phone')} required />
                  <button type="submit" className="btn-small" style={{ background: '#15803d', whiteSpace: 'nowrap' }}>
                    {t('auth.sendOtp')}
                  </button>
                </div>
              </div>
              {otpSent && (
                <div className="form-group">
                  <label className="form-label">{t('auth.enterOtp')} *</label>
                  {otpVerified ? (
                    <div className="phone-verified-badge">
                      <Icon name="check" size={16} /> {t('auth.phoneVerifiedBadge')}
                    </div>
                  ) : (
                    <>
                      <OtpInput value={otp} onChange={setOtp} autoFocus onComplete={verifyOtpCode} />
                      <div className="otp-resend-row">
                        <OtpResend onResend={doSendOtp} />
                        <button
                          type="button"
                          className="btn-small"
                          style={{ background: '#0d9488', whiteSpace: 'nowrap' }}
                          onClick={() => verifyOtpCode(otp)}
                        >
                          {t('auth.verify')}
                        </button>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '8px' }}>
                        <button type="button" className="review-edit-btn" onClick={() => { setOtpVerified(true); setOtpSent(false); setStep(2); }}>
                          {t('auth.skipOtp')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(0)}>{t('common.back')}</button>
            </form>
          )}

          {/* ── Step 2 (Farmer): Farm Details ── */}
          {isFarmer && step === 2 && (
            <div className="form-body">
              <p className="form-subtitle">{t('auth.farmDetailsSubtitle')}</p>

              {/* Land Size */}
              <div className="farm-size-row">
                <div className="form-group">
                  <label className="form-label">{t('auth.farmSize')} *</label>
                  <input type="number" className="form-input" placeholder="Enter size" value={form.farm_size} onChange={set('farm_size')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.farmSizeUnit')}</label>
                  <select className="form-select" value={form.farm_size_unit} onChange={set('farm_size_unit')}>
                    <option value="Acre">{t('auth.acres')}</option>
                    <option value="Hectare">{t('auth.hectares')}</option>
                  </select>
                </div>
              </div>

              {/* Land Ownership */}
              <div className="form-group">
                <label className="form-label">{t('auth.landOwnership')}</label>
                <select className="form-select" value={form.land_ownership} onChange={set('land_ownership')}>
                  <option value="">{t('auth.selectState')}</option>
                  {OWNERSHIP_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                  ))}
                </select>
              </div>

              {/* Irrigation Type */}
              <div className="form-group">
                <label className="form-label">{t('auth.irrigationType')} ({t('auth.optional')})</label>
                <ChipGroup
                  options={IRRIGATION_OPTIONS}
                  selected={form.irrigation_type}
                  onToggle={(fn) => setForm((prev) => ({ ...prev, irrigation_type: typeof fn === 'function' ? fn(prev.irrigation_type) : fn }))}
                  multi={false}
                  t={t}
                />
              </div>

              {/* Main Crops */}
              <div className="form-group">
                <label className="form-label">{t('auth.mainCrops')} *</label>
                <p className="chip-group-hint">{t('auth.mainCropsHint')}</p>
                <ChipGroup
                  options={CROP_OPTIONS}
                  selected={form.main_crops}
                  onToggle={handleCropToggle}
                  multi={true}
                  t={t}
                />
              </div>

              {/* Soil Type */}
              <div className="form-group">
                <label className="form-label">{t('auth.soilType')} *</label>
                <select className="form-select" value={form.soil_type} onChange={set('soil_type')} required>
                  <option value="">{t('auth.selectSoilType')}</option>
                  <option value="Black Soil">{t('land.black')}</option>
                  <option value="Red Soil">{t('land.red')}</option>
                  <option value="Alluvial Soil">{t('land.alluvial')}</option>
                  <option value="Loamy Soil">{t('land.loamy')}</option>
                  <option value="Clay Soil">Clay Soil</option>
                  <option value="Sandy Soil">Sandy Soil</option>
                </select>
                <p className="chip-group-hint">{t('auth.soilHint')}</p>
              </div>

              {/* Farming Experience */}
              <div className="form-group">
                <label className="form-label">{t('auth.farmingExperience')} ({t('auth.optional')})</label>
                <select className="form-select" value={form.farming_experience} onChange={set('farming_experience')}>
                  <option value="">{t('auth.selectState')}</option>
                  {EXPERIENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                  ))}
                </select>
              </div>

              {/* Farm Access */}
              <div className="form-group">
                <label className="form-label">{t('auth.farmAccess')}</label>
                <div className="radio-group">
                  {ACCESS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="radio-option">
                      <input
                        type="radio"
                        name="farm_access"
                        value={opt.value}
                        checked={form.farm_access === opt.value}
                        onChange={set('farm_access')}
                      />
                      {t(opt.labelKey)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="form-group">
                <label className="form-label">{t('auth.farmNotes')} ({t('auth.optional')})</label>
                <textarea
                  className="form-textarea"
                  maxLength={200}
                  placeholder={t('auth.farmNotesHint')}
                  value={form.farm_notes}
                  onChange={set('farm_notes')}
                />
                <p className="chip-group-hint" style={{ textAlign: 'right' }}>{(form.farm_notes || '').length}/200</p>
              </div>

              <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(1)}>{t('common.back')}</button>
              <button type="button" className="btn-form-submit" onClick={() => setStep(3)}>
                {t('auth.nextReview')}
              </button>
            </div>
          )}

          {/* ── Step 2 (Owner/Labourer): Identity + Work ── */}
          {!isFarmer && step === 2 && (
            <form className="form-body" onSubmit={handleSubmit}>
              {isDetailed ? (
                <>
                  <h3 className="form-section-title">{t('auth.identityAddress')}</h3>
                  <div className="form-grid-row">
                    <div className="form-group">
                      <label className="form-label">{t('auth.gender')} *</label>
                      <select className="form-select" value={form.gender} onChange={set('gender')}>
                        <option value="Male">{t('auth.male')}</option><option value="Female">{t('auth.female')}</option><option value="Other">{t('auth.other')}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('auth.dob')} *</label>
                      <input type="date" className="form-input" value={form.dob} onChange={set('dob')} required />
                    </div>
                  </div>
                  <GovtIdSection form={form} setForm={setForm} t={t} />
                  <LocationSelects value={form} onChange={setForm} />
                  <FarmLocationField value={farmLoc} onChange={setFarmLoc} onCoords={setFarmCoords} />

                  <h3 className="form-section-title">{t('auth.workProfile')}</h3>
                  <div className="form-grid-row">
                    <div className="form-group">
                      <label className="form-label">{t('auth.labourCategory')} *</label>
                      <select className="form-select" value={form.labour_category} onChange={set('labour_category')} required>
                        <option value="">{t('auth.selectCategory')}</option>
                        <option>Field Worker</option>
                        <option>Harvesting</option>
                        <option>Sowing & Planting</option>
                        <option>Irrigation</option>
                        <option>Weeding</option>
                        <option>Pesticide Spraying</option>
                        <option>Orchard Worker</option>
                        <option>Loading / Transport</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('auth.skillLevel')} *</label>
                      <select className="form-select" value={form.skill_level} onChange={set('skill_level')}>
                        <option value="Skilled">{t('auth.skilled')}</option><option value="Semi-Skilled">{t('auth.semiSkilled')}</option><option value="Unskilled">{t('auth.unskilled')}</option>
                      </select>
                    </div>
                  </div>

                  <h3 className="form-section-title">{t('auth.paymentDetails')}</h3>
                  <div className="form-grid-row">
                    <div className="form-group">
                      <label className="form-label">{t('auth.bankAccount')}</label>
                      <input type="text" className="form-input" value={form.bank_account} onChange={set('bank_account')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('auth.ifsc')}</label>
                      <input type="text" className="form-input" placeholder="e.g. HDFC0001234" value={form.ifsc} onChange={set('ifsc')} />
                    </div>
                  </div>
                  <div className="payment-or">{t('auth.or')}</div>
                  <div className="form-group">
                    <label className="form-label">{t('auth.upiId')}</label>
                    <input type="text" className="form-input" placeholder="e.g. name@upi" value={form.upi_id} onChange={set('upi_id')} />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="form-section-title">{t('auth.identityVerification')}</h3>
                  <GovtIdSection form={form} setForm={setForm} t={t} />

                  <h3 className="form-section-title">{t('auth.address')}</h3>
                  <LocationSelects value={form} onChange={setForm} />
                  <FarmLocationField value={farmLoc} onChange={setFarmLoc} onCoords={setFarmCoords} />
                  <div className="form-group">
                    <label className="form-label">{t('auth.farmSize')} *</label>
                    <input type="text" className="form-input" placeholder="e.g. 5" value={form.farm_size} onChange={set('farm_size')} required />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">{t('auth.password6')} *</label>
                <input type="password" className="form-input" minLength="6" value={form.password} onChange={set('password')} required />
              </div>

              <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(1)}>{t('common.back')}</button>
              <button type="submit" className={`btn-form-submit ${status === 'loading' ? 'loading' : ''}`} disabled={status !== 'idle'}>
                {status === 'loading' && <span className="btn-spinner" aria-hidden="true" />}
                {status === 'loading' ? t('auth.creating') : t('auth.createAccount')}
              </button>
            </form>
          )}

          {/* ── Step 3 (Farmer): Location on Map ── */}
          {isFarmer && step === 3 && (
            <div className="form-body">
              <p className="form-subtitle">{t('auth.locationSubtitle')}</p>
              <LocationSelects value={form} onChange={setForm} />
              <FarmLocationField value={farmLoc} onChange={setFarmLoc} onCoords={setFarmCoords} />
              <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(2)}>{t('common.back')}</button>
              <button type="button" className="btn-form-submit" onClick={() => setStep(4)}>
                {t('auth.nextReview')}
              </button>
            </div>
          )}

          {/* ── Step 4 (Farmer): Review & Complete ── */}
          {isFarmer && step === 4 && (
            <div className="form-body">
              <p className="form-subtitle">{t('auth.reviewSubtitle')}</p>

              {/* Basic Details */}
              <div className="review-card">
                <div className="review-card-header">
                  <span className="review-card-title">{t('auth.reviewBasic')}</span>
                  <button type="button" className="review-edit-btn" onClick={() => setStep(1)}>{t('auth.reviewEdit')}</button>
                </div>
                <ReviewRow label={t('auth.fullName')} value={form.full_name} />
                <ReviewRow label={t('auth.mobile')} value={form.phone} />
                <ReviewRow label={t('auth.email')} value={form.email || '—'} />
                <ReviewRow label={t('auth.password')} value={form.password ? '••••••' : ''} />
              </div>

              {/* Farm Details */}
              <div className="review-card">
                <div className="review-card-header">
                  <span className="review-card-title">{t('auth.reviewFarm')}</span>
                  <button type="button" className="review-edit-btn" onClick={() => setStep(2)}>{t('auth.reviewEdit')}</button>
                </div>
                <ReviewRow label={t('auth.farmSize')} value={form.farm_size ? `${form.farm_size} ${form.farm_size_unit}` : ''} />
                <ReviewRow label={t('auth.landOwnership')} value={form.land_ownership} />
                <ReviewRow label={t('auth.irrigationType')} value={form.irrigation_type} />
                <ReviewRow label={t('auth.mainCrops')} value={form.main_crops.length ? form.main_crops.join(', ') : ''} />
                <ReviewRow label={t('auth.soilType')} value={form.soil_type} />
                <ReviewRow label={t('auth.farmingExperience')} value={form.farming_experience} />
                <ReviewRow label={t('auth.farmAccess')} value={form.farm_access} />
                <ReviewRow label={t('auth.farmNotes')} value={form.farm_notes} />
              </div>

              {/* Location */}
              <div className="review-card">
                <div className="review-card-header">
                  <span className="review-card-title">{t('auth.reviewLocation')}</span>
                  <button type="button" className="review-edit-btn" onClick={() => setStep(3)}>{t('auth.reviewEdit')}</button>
                </div>
                <ReviewRow label={t('auth.state')} value={form.state} />
                <ReviewRow label={t('auth.district')} value={form.district} />
                <ReviewRow label={t('auth.farmLocation')} value={farmLoc} />
                {farmCoords && (
                  <ReviewRow label={t('auth.mapPin')} value={`${farmCoords.lat.toFixed(5)}, ${farmCoords.lng.toFixed(5)}`} />
                )}
              </div>

              <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(3)}>{t('common.back')}</button>
              <button
                type="button"
                className={`btn-form-submit ${status === 'loading' ? 'loading' : ''}`}
                disabled={status !== 'idle'}
                onClick={handleSubmit}
              >
                {status === 'loading' && <span className="btn-spinner" aria-hidden="true" />}
                {status === 'loading' ? t('auth.creating') : t('auth.createMyAccount')}
              </button>
            </div>
          )}

          <p className="auth-switch">
            {t('auth.alreadyHave')} <a href="#" onClick={(e) => { e.preventDefault(); navigate('signin'); }}>{t('auth.signinTitle')}</a>
          </p>
        </div>
      </div>
    );
  }

  /* ────────── Owner/Labourer initial step ────────── */
  return (
    <div className="form-card-container auth-container">
      {status === 'success' && <WelcomeOverlay name={welcomeName} />}
      <div className="form-card">
        <button className="btn-back-icon" onClick={back} aria-label="Back" style={{ marginBottom: '14px' }}>←</button>
        <h2 className="auth-title">{t('auth.signupTitle')}</h2>
        <SimpleStepIndicator current={step} t={t} />

        {step === 0 && (
          <div className="role-select">
            {ROLES.map((r) => (
              <button
                key={r.value}
                className={`role-option ${role === r.value ? 'selected' : ''}`}
                onClick={() => setRole(r.value)}
              >
                <span className="role-emoji"><Icon name={r.icon} size={22} /></span>
                <span className="role-label">{t(r.labelKey)}</span>
                <span className="role-desc">{t(r.descKey)}</span>
              </button>
            ))}
            <button className="btn-form-submit" disabled={!role} onClick={() => setStep(1)}>
              {t('auth.continue')}
            </button>
          </div>
        )}

        <p className="auth-switch">
          {t('auth.alreadyHave')} <a href="#" onClick={(e) => { e.preventDefault(); navigate('signin'); }}>{t('auth.signinTitle')}</a>
        </p>
      </div>
    </div>
  );
}
