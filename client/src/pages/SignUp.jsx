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

const EQUIPMENT_OPTIONS = [
  { value: 'Tractor', icon: '🚜' },
  { value: 'Harvester', icon: '🌾' },
  { value: 'Rotavator', icon: '⚙️' },
  { value: 'Thresher', icon: '🌀' },
  { value: 'Sprayer', icon: '🚿' },
  { value: 'Baler', icon: '📦' },
  { value: 'Plough', icon: '🛠️' },
  { value: 'Seeder', icon: '🌱' },
  { value: 'Water Tanker', icon: '💧' },
  { value: 'Other Equipment', icon: '🔧' }
];

const LABOUR_SKILL_OPTIONS = [
  { value: 'Harvesting', icon: '🌾' },
  { value: 'Sowing / Planting', icon: '🌱' },
  { value: 'Weeding & Tillage', icon: '🧹' },
  { value: 'Pesticide Spraying', icon: '🚿' },
  { value: 'Pruning & Trimming', icon: '✂️' },
  { value: 'Machine Operation', icon: '🚜' },
  { value: 'Irrigation & Pipe Setup', icon: '💧' },
  { value: 'Crop Packing & Grading', icon: '📦' }
];

function validateGovtId(id_type, id_number, t) {
  const cleanId = String(id_number || '').trim();
  if (!id_type) return { valid: false, message: t('auth.selectIdType', 'Please select a Government ID type') };
  if (!cleanId) return { valid: false, message: t('auth.idNumberRequired', 'Please enter your Government ID number') };

  if (id_type === 'aadhaar') {
    if (!/^\d{12}$/.test(cleanId)) {
      return { valid: false, message: t('auth.aadhaarInvalid', 'Enter a valid Aadhaar number') };
    }
  } else if (id_type === 'voter') {
    if (!(/^[A-Za-z]{3}\d{7}$/.test(cleanId) || /^[A-Za-z0-9]{10}$/.test(cleanId))) {
      return { valid: false, message: t('auth.voterInvalid', 'Enter a valid Voter ID number') };
    }
  } else if (id_type === 'driving') {
    const cleanDl = cleanId.replace(/[\s/-]/g, '');
    if (!/^[A-Za-z0-9]{10,16}$/.test(cleanDl)) {
      return { valid: false, message: t('auth.drivingInvalid', 'Enter a valid Driving License number') };
    }
  }
  return { valid: true };
}

function GovtIdSection({ form, setForm, t }) {
  const getIdNumberPlaceholder = () => {
    if (form.id_type === 'aadhaar') return 'Enter 12-digit Aadhaar number';
    if (form.id_type === 'voter') return 'Enter 10-character Voter ID (e.g. ABC1234567)';
    if (form.id_type === 'driving') return 'Enter Driving License number';
    return t('auth.idNumberPh', 'Enter Government ID Number');
  };

  const getIdNumberHint = () => {
    if (form.id_type === 'aadhaar') return 'Must be exactly 12 digits (e.g. 1234 5678 9012)';
    if (form.id_type === 'voter') return '3 letters followed by 7 digits (e.g. ABC1234567)';
    if (form.id_type === 'driving') return 'Standard 10-16 character Driving License number';
    return null;
  };

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
          placeholder={getIdNumberPlaceholder()}
          required
        />
        {getIdNumberHint() && (
          <p className="chip-group-hint" style={{ marginTop: '4px' }}>{getIdNumberHint()}</p>
        )}
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.govtIdPhoto')} ({t('auth.optional')})</label>
        <PhotoUpload onUploaded={(url) => setForm({ ...form, govt_id_url: url })} />
      </div>
    </>
  );
}

function ChipGroup({ options, selected, onToggle, multi = true }) {
  const handleClick = (val) => {
    if (multi) {
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
      {options.map((opt) => {
        const isSelected = multi ? selected.includes(opt.value) : selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`chip ${isSelected ? 'active' : ''}`}
            onClick={() => handleClick(opt.value)}
          >
            {opt.icon && <span className="chip-icon">{opt.icon}</span>}
            {opt.value}
          </button>
        );
      })}
    </div>
  );
}

function RoleStepIndicator({ role, current, t }) {
  let steps = [];
  if (role === 'farmer') {
    steps = [
      t('auth.stepVerify', 'Verification'),
      t('auth.stepFarm', 'Farm Details'),
      t('auth.stepReview', 'Review')
    ];
  } else if (role === 'owner') {
    steps = [
      t('auth.stepOwnerDetails', 'Owner Details'),
      t('auth.stepEquipDetails', 'Land & Equipment'),
      t('auth.stepOwnerVerify', 'Verification'),
      t('auth.stepReview', 'Review')
    ];
  } else if (role === 'labourer') {
    steps = [
      t('auth.stepLabourDetails', 'Labourer Details'),
      t('auth.stepLabourSkillset', 'Skillset & Location'),
      t('auth.stepLabourVerify', 'Verification'),
      t('auth.stepReview', 'Review')
    ];
  } else {
    steps = [t('auth.stepRole', 'Role'), t('auth.stepDetails', 'Details'), t('auth.stepVerify', 'Verify')];
  }

  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <span key={s} className={`step-pill ${i + 1 === current ? 'active' : i + 1 < current ? 'done' : ''}`}>
          {i + 1}. {s}
        </span>
      ))}
    </div>
  );
}

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
  const [ownsLand, setOwnsLand] = useState('yes');
  const [ownerType, setOwnerType] = useState('both');
  const [equipmentsOwned, setEquipmentsOwned] = useState([]);
  const [skillsSelected, setSkillsSelected] = useState([]);

  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', password: '', confirmPassword: '',
    gender: 'Male', dob: '', govt_id_url: '', id_type: '', id_number: '',
    district: '', state: '', taluka: '',
    labour_category: 'Individual Worker', skill_level: 'Skilled',
    farm_size: '', farm_size_unit: 'Acre'
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

  const getHeaderTitle = () => {
    if (step === 0) return t('auth.signupTitle', 'Create Account');

    if (role === 'farmer') {
      if (step === 1) return t('auth.farmerVerificationTitle', 'Farmer Verification');
      if (step === 2) return t('auth.farmDetailsTitle', 'Farm Details');
      if (step === 3) return t('auth.stepReview', 'Review & Confirm');
    } else if (role === 'owner') {
      if (step === 1) return t('auth.ownerDetailsTitle', 'Land / Equipment Owner Details');
      if (step === 2) return t('auth.ownerEquipDetailsTitle', 'Land / Equipment Details');
      if (step === 3) return t('auth.ownerVerifyTitle', 'Land / Equipment Owner Verification');
      if (step === 4) return t('auth.stepReview', 'Review & Confirm');
    } else if (role === 'labourer') {
      if (step === 1) return t('auth.labourerDetailsTitle', 'Labourer / Contractor Details');
      if (step === 2) return t('auth.labourerSkillsetTitle', 'Labourer / Contractor Skillset');
      if (step === 3) return t('auth.labourerVerifyTitle', 'Labourer / Contractor Verification');
      if (step === 4) return t('auth.stepReview', 'Review & Confirm');
    }
    return t('auth.signupTitle', 'Create Account');
  };

  const doSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      showToast(t('auth.phoneInvalid', 'Enter a valid phone number'));
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
    } catch (err) {
      setOtp('');
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (form.password !== form.confirmPassword) {
      showToast(t('auth.passwordMismatch'));
      return;
    }
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) {
      showToast(t('auth.phoneInvalid', 'Enter a valid phone number'));
      return;
    }
    const idCheck = validateGovtId(form.id_type, form.id_number, t);
    if (!idCheck.valid) {
      showToast(idCheck.message);
      return;
    }

    setStatus('loading');
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        role,
        owns_land: role === 'farmer' ? ownsLand : undefined,
        owner_type: role === 'owner' ? ownerType : undefined,
        equipments_owned: role === 'owner' && (ownerType === 'equipment' || ownerType === 'both') ? equipmentsOwned.join(', ') : undefined,
        labour_category: role === 'labourer' ? form.labour_category : undefined,
        skill_level: role === 'labourer' ? form.skill_level : undefined,
        skills: role === 'labourer' && skillsSelected.length ? skillsSelected.join(', ') : undefined,
        govt_id_url: form.govt_id_url || undefined,
        id_type: form.id_type || undefined,
        id_number: form.id_number || undefined,
        district: form.district,
        state: form.state,
        taluka: form.taluka || undefined,
        location: farmLoc || undefined,
        farm_size: (role === 'farmer' && ownsLand === 'yes') || (role === 'owner' && ownerType !== 'equipment') ? form.farm_size || undefined : undefined,
        farm_size_unit: (role === 'farmer' && ownsLand === 'yes') || (role === 'owner' && ownerType !== 'equipment') ? form.farm_size_unit : undefined,
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

  return (
    <div className="form-card-container auth-container">
      {status === 'success' && <WelcomeOverlay name={welcomeName} />}
      <div className="form-card">
        <button className="btn-back-icon" onClick={() => step > 0 ? setStep(step - 1) : back()} aria-label="Back" style={{ marginBottom: '14px' }}>←</button>
        <h2 className="auth-title">{getHeaderTitle()}</h2>

        {step > 0 && <RoleStepIndicator role={role} current={step} t={t} />}

        {/* ── Step 0: Role Selection ── */}
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

        {/* ── STEP 1 FOR FARMER (Farmer Verification) ── */}
        {role === 'farmer' && step === 1 && (
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
                      <button type="button" className="btn-small" style={{ background: '#0d9488', whiteSpace: 'nowrap' }} onClick={() => verifyOtpCode(otp)}>
                        {t('auth.verify')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">{t('auth.email')} ({t('auth.optional')})</label>
              <input type="email" className="form-input" placeholder="Enter email address" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.password6')} *</label>
              <input type="password" className="form-input" minLength="6" placeholder="Create a password" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.confirmPassword')} *</label>
              <input type="password" className="form-input" minLength="6" placeholder={t('auth.confirmPasswordPh')} value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>

            <h3 className="form-section-title" style={{ marginTop: '20px' }}>{t('auth.identityVerification')}</h3>
            <GovtIdSection form={form} setForm={setForm} t={t} />

            <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(0)}>{t('common.back')}</button>
            <button type="button" className="btn-form-submit" disabled={!otpVerified} onClick={() => {
              if (form.password !== form.confirmPassword) { showToast(t('auth.passwordMismatch')); return; }
              if (!form.full_name.trim()) { showToast(t('auth.nameRequired', 'Please enter your name')); return; }
              if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) { showToast(t('auth.phoneInvalid', 'Enter a valid phone number')); return; }
              const idCheck = validateGovtId(form.id_type, form.id_number, t);
              if (!idCheck.valid) { showToast(idCheck.message); return; }
              setStep(2);
            }}>
              {t('common.next', 'Next')}
            </button>
          </form>
        )}

        {/* ── STEP 1 FOR OWNER / LABOURER (Details) ── */}
        {role !== 'farmer' && step === 1 && (
          <form className="form-body" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">{t('auth.fullName')} *</label>
              <input type="text" className="form-input" placeholder="Your full name" value={form.full_name} onChange={set('full_name')} required />
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
                      <button type="button" className="btn-small" style={{ background: '#0d9488', whiteSpace: 'nowrap' }} onClick={() => verifyOtpCode(otp)}>
                        {t('auth.verify')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">{t('auth.email')} ({t('auth.optional')})</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.password6')} *</label>
              <input type="password" className="form-input" minLength="6" placeholder="Create a password" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.confirmPassword')} *</label>
              <input type="password" className="form-input" minLength="6" placeholder={t('auth.confirmPasswordPh')} value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>

            <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(0)}>{t('common.back')}</button>
            <button type="button" className="btn-form-submit" disabled={!otpVerified} onClick={() => {
              if (form.password !== form.confirmPassword) { showToast(t('auth.passwordMismatch')); return; }
              if (!form.full_name.trim()) { showToast(t('auth.nameRequired', 'Please enter your name')); return; }
              if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) { showToast(t('auth.phoneInvalid', 'Enter a valid phone number')); return; }
              setStep(2);
            }}>
              {t('common.next', 'Next')}
            </button>
          </form>
        )}

        {/* ── STEP 2 FOR FARMER (Farm Details) ── */}
        {role === 'farmer' && step === 2 && (
          <div className="form-body">
            <div className="form-group">
              <label className="form-label">{t('auth.ownsLand', 'Do you own a land / farm?')} *</label>
              <div className="radio-group" style={{ display: 'flex', gap: '14px' }}>
                <label className="radio-option">
                  <input type="radio" name="owns_land" value="yes" checked={ownsLand === 'yes'} onChange={() => setOwnsLand('yes')} />
                  {t('auth.ownsLandYes', 'Yes, I own land / farm')}
                </label>
                <label className="radio-option">
                  <input type="radio" name="owns_land" value="no" checked={ownsLand === 'no'} onChange={() => setOwnsLand('no')} />
                  {t('auth.ownsLandNo', "No, I don't own land")}
                </label>
              </div>
            </div>

            {ownsLand === 'yes' ? (
              <>
                <div className="farm-size-row">
                  <div className="form-group">
                    <label className="form-label">{t('auth.farmSize')} *</label>
                    <input type="number" className="form-input" placeholder="Enter size" value={form.farm_size} onChange={set('farm_size')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('auth.farmSizeUnit')}</label>
                    <select className="form-select" value={form.farm_size_unit} onChange={set('farm_size_unit')}>
                      <option value="Acre">{t('auth.acres')}</option>
                      <option value="Guntha">Guntha</option>
                      <option value="Hectare">{t('auth.hectares')}</option>
                    </select>
                  </div>
                </div>

                <h3 className="form-section-title">{t('auth.address')}</h3>
                <LocationSelects value={form} onChange={setForm} />
                <FarmLocationField value={farmLoc} onChange={setFarmLoc} onCoords={setFarmCoords} />
              </>
            ) : (
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', color: '#475569', fontSize: '0.9rem', marginBottom: '16px' }}>
                ℹ️ You can proceed to the next step. Farm details can be updated anytime later in your profile.
              </div>
            )}

            <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(1)}>{t('common.back')}</button>
            <button type="button" className="btn-form-submit" onClick={() => setStep(3)}>
              {t('auth.nextReview', 'Next')}
            </button>
          </div>
        )}

        {/* ── STEP 2 FOR OWNER (Land / Equipment Details) ── */}
        {role === 'owner' && step === 2 && (
          <div className="form-body">
            <div className="form-group">
              <label className="form-label">{t('auth.ownerType', 'What do you own?')} *</label>
              <select className="form-select" value={ownerType} onChange={(e) => setOwnerType(e.target.value)}>
                <option value="land">{t('auth.ownerLandOnly', 'Land Only')}</option>
                <option value="equipment">{t('auth.ownerEquipOnly', 'Equipment Only')}</option>
                <option value="both">{t('auth.ownerBoth', 'Both Land & Equipment')}</option>
              </select>
            </div>

            {(ownerType === 'land' || ownerType === 'both') && (
              <>
                <h3 className="form-section-title">Land Details</h3>
                <div className="farm-size-row">
                  <div className="form-group">
                    <label className="form-label">{t('auth.farmSize')} *</label>
                    <input type="number" className="form-input" placeholder="Land size" value={form.farm_size} onChange={set('farm_size')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('auth.farmSizeUnit')}</label>
                    <select className="form-select" value={form.farm_size_unit} onChange={set('farm_size_unit')}>
                      <option value="Acre">Acre</option>
                      <option value="Guntha">Guntha</option>
                      <option value="Hectare">Hectare</option>
                    </select>
                  </div>
                </div>
                <LocationSelects value={form} onChange={setForm} />
                <FarmLocationField value={farmLoc} onChange={setFarmLoc} onCoords={setFarmCoords} />
              </>
            )}

            {(ownerType === 'equipment' || ownerType === 'both') && (
              <>
                <h3 className="form-section-title">{t('auth.equipmentOwned', 'Select equipment(s) you own')}</h3>
                <ChipGroup
                  options={EQUIPMENT_OPTIONS}
                  selected={equipmentsOwned}
                  onToggle={setEquipmentsOwned}
                  multi={true}
                />
              </>
            )}

            <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(1)}>{t('common.back')}</button>
            <button type="button" className="btn-form-submit" onClick={() => setStep(3)}>
              {t('common.next', 'Next')}
            </button>
          </div>
        )}

        {/* ── STEP 2 FOR LABOURER (Labourer / Contractor Skillset) ── */}
        {role === 'labourer' && step === 2 && (
          <div className="form-body">
            <div className="form-group">
              <label className="form-label">{t('auth.labourCategory')} *</label>
              <select className="form-select" value={form.labour_category} onChange={set('labour_category')}>
                <option value="Individual Worker">Individual Worker</option>
                <option value="Team Leader / Contractor">Team Leader / Contractor</option>
                <option value="Tractor Operator">Tractor Operator</option>
                <option value="Harvester Operator">Harvester Operator</option>
                <option value="General Farm Labour">General Farm Labour</option>
                <option value="Specialized Crop Worker">Specialized Crop Worker</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Skills / Specializations</label>
              <ChipGroup
                options={LABOUR_SKILL_OPTIONS}
                selected={skillsSelected}
                onToggle={setSkillsSelected}
                multi={true}
              />
            </div>

            <h3 className="form-section-title">{t('auth.address')}</h3>
            <LocationSelects value={form} onChange={setForm} />
            <FarmLocationField value={farmLoc} onChange={setFarmLoc} onCoords={setFarmCoords} />

            <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(1)}>{t('common.back')}</button>
            <button type="button" className="btn-form-submit" onClick={() => setStep(3)}>
              {t('common.next', 'Next')}
            </button>
          </div>
        )}

        {/* ── STEP 3 FOR OWNER / LABOURER (Verification) ── */}
        {role !== 'farmer' && step === 3 && (
          <div className="form-body">
            <h3 className="form-section-title">{t('auth.identityVerification')}</h3>
            <GovtIdSection form={form} setForm={setForm} t={t} />
            <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(2)}>{t('common.back')}</button>
            <button type="button" className="btn-form-submit" onClick={() => {
              const idCheck = validateGovtId(form.id_type, form.id_number, t);
              if (!idCheck.valid) { showToast(idCheck.message); return; }
              setStep(4);
            }}>
              {t('auth.nextReview', 'Next')}
            </button>
          </div>
        )}

        {/* ── STEP 3 FOR FARMER / STEP 4 FOR OWNER & LABOURER (Review & Confirm) ── */}
        {((role === 'farmer' && step === 3) || (role !== 'farmer' && step === 4)) && (
          <div className="form-body">
            <p className="form-subtitle">{t('auth.reviewSubtitle')}</p>

            <div className="review-card">
              <div className="review-card-header">
                <span className="review-card-title">{t('auth.reviewBasic')}</span>
                <button type="button" className="review-edit-btn" onClick={() => setStep(1)}>{t('auth.reviewEdit')}</button>
              </div>
              <ReviewRow label={t('auth.fullName')} value={form.full_name} />
              <ReviewRow label={t('auth.mobile')} value={form.phone} />
              <ReviewRow label={t('auth.email')} value={form.email || '—'} />
            </div>

            <div className="review-card">
              <div className="review-card-header">
                <span className="review-card-title">{t('auth.identityVerification')}</span>
                <button type="button" className="review-edit-btn" onClick={() => setStep(role === 'farmer' ? 1 : 3)}>{t('auth.reviewEdit')}</button>
              </div>
              <ReviewRow label={t('auth.idTypeLabel')} value={form.id_type ? (ID_TYPES.find((i) => i.value === form.id_type)?.labelKey ? t(ID_TYPES.find((i) => i.value === form.id_type).labelKey) : form.id_type) : ''} />
              <ReviewRow label={t('auth.idNumber')} value={form.id_number} />
              {form.govt_id_url && <ReviewRow label={t('auth.govtIdPhoto')} value="Uploaded ✓" />}
            </div>

            {role === 'farmer' && ownsLand === 'yes' && (
              <div className="review-card">
                <div className="review-card-header">
                  <span className="review-card-title">{t('auth.reviewFarm')}</span>
                  <button type="button" className="review-edit-btn" onClick={() => setStep(2)}>{t('auth.reviewEdit')}</button>
                </div>
                <ReviewRow label={t('auth.farmSize')} value={form.farm_size ? `${form.farm_size} ${form.farm_size_unit}` : ''} />
                <ReviewRow label={t('auth.district')} value={form.district} />
                <ReviewRow label={t('auth.state')} value={form.state} />
                <ReviewRow label="Taluka" value={form.taluka} />
              </div>
            )}

            {role === 'owner' && (
              <div className="review-card">
                <div className="review-card-header">
                  <span className="review-card-title">Land & Equipment Details</span>
                  <button type="button" className="review-edit-btn" onClick={() => setStep(2)}>{t('auth.reviewEdit')}</button>
                </div>
                <ReviewRow label="Ownership Type" value={ownerType === 'land' ? 'Land Only' : ownerType === 'equipment' ? 'Equipment Only' : 'Both Land & Equipment'} />
                {form.farm_size && <ReviewRow label={t('auth.farmSize')} value={`${form.farm_size} ${form.farm_size_unit}`} />}
                {equipmentsOwned.length > 0 && <ReviewRow label="Equipments Owned" value={equipmentsOwned.join(', ')} />}
                <ReviewRow label={t('auth.district')} value={form.district} />
                <ReviewRow label={t('auth.state')} value={form.state} />
                <ReviewRow label="Taluka" value={form.taluka} />
              </div>
            )}

            {role === 'labourer' && (
              <div className="review-card">
                <div className="review-card-header">
                  <span className="review-card-title">Skillset & Location</span>
                  <button type="button" className="review-edit-btn" onClick={() => setStep(2)}>{t('auth.reviewEdit')}</button>
                </div>
                <ReviewRow label="Work Profile" value={form.labour_category} />
                {skillsSelected.length > 0 && <ReviewRow label="Skills" value={skillsSelected.join(', ')} />}
                <ReviewRow label={t('auth.district')} value={form.district} />
                <ReviewRow label={t('auth.state')} value={form.state} />
                <ReviewRow label="Taluka" value={form.taluka} />
              </div>
            )}

            <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(role === 'farmer' ? 2 : 3)}>{t('common.back')}</button>
            <button type="button" className={`btn-form-submit ${status === 'loading' ? 'loading' : ''}`} disabled={status !== 'idle'} onClick={handleSubmit}>
              {status === 'loading' && <span className="btn-spinner" aria-hidden="true" />}
              {status === 'loading' ? t('auth.creating') : t('auth.createAccount')}
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
