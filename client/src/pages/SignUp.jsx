import { useEffect, useRef, useState } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { register, sendOtp, verifyOtp, checkUsername } from '../lib/api';
import PhotoUpload from '../components/PhotoUpload';
import LocationSelects from '../components/LocationSelects';
import WelcomeOverlay from '../components/WelcomeOverlay';

const ROLES = [
  { value: 'farmer', labelKey: 'auth.farmer', emoji: '👨‍🌾', descKey: 'auth.farmerDesc' },
  { value: 'owner', labelKey: 'auth.owner', emoji: '🚜', descKey: 'auth.ownerDesc' },
  { value: 'labourer', labelKey: 'auth.labourer', emoji: '👷', descKey: 'auth.labourerDesc' }
];

function StepIndicator({ current, t }) {
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

export default function SignUp() {
  const { navigate } = useNav();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    full_name: '', username: '', phone: '', email: '', password: '',
    gender: 'Male', dob: '', govt_id_url: '',
    village: '', taluka: '', district: '', state: '',
    labour_category: '', skill_level: 'Skilled',
    bank_account: '', ifsc: '', upi_id: '',
    farm_size: ''
  });
  const [farmCoords, setFarmCoords] = useState(null);
  const [farmLoc, setFarmLoc] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [welcomeName, setWelcomeName] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  const otpInput = useRef(null);
  const navTimer = useRef(null);

  // Clear the pending navigation timer if the user navigates away mid-animation
  useEffect(() => () => clearTimeout(navTimer.current), []);

  // Live username availability check (debounced)
  useEffect(() => {
    const clean = form.username.trim().replace(/\s+/g, '_').toLowerCase();
    if (!clean) {
      setUsernameStatus('idle');
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(clean)) {
      setUsernameStatus('invalid');
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      // Only show the spinner once the request is about to fire (after the debounce)
      setUsernameStatus('checking');
      try {
        const res = await checkUsername(clean);
        if (!cancelled) setUsernameStatus(res.available ? 'available' : 'taken');
      } catch {
        if (!cancelled) setUsernameStatus('idle');
      }
    }, 450);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [form.username]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const isDetailed = role === 'labourer' || role === 'owner';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (usernameStatus === 'checking') {
      showToast(t('auth.usernameChecking'));
      return;
    }
    if (usernameStatus === 'taken') {
      showToast(t('auth.usernameTaken'));
      return;
    }
    if (usernameStatus === 'invalid') {
      showToast(t('auth.usernameInvalid'));
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      showToast(t('auth.phoneInvalid'));
      return;
    }
    try {
      const res = await sendOtp({ phone: form.phone });
      setOtpSent(true);
      showToast(t('auth.otpSent', { otp: res.devOtp }), 5000);
      setTimeout(() => otpInput.current?.focus(), 100);
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp({ phone: form.phone, otp });
      showToast(t('auth.phoneVerified'));
      setOtpSent(false);
      setStep(2);
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const payload = {
        full_name: form.full_name,
        username: form.username || undefined,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        role,
        gender: isDetailed ? form.gender : undefined,
        dob: isDetailed ? form.dob : undefined,
        govt_id_url: form.govt_id_url || undefined,
        village: form.village,
        taluka: form.taluka,
        district: form.district,
        state: form.state,
        labour_category: isDetailed ? form.labour_category : undefined,
        skill_level: isDetailed ? form.skill_level : undefined,
        bank_account: isDetailed ? form.bank_account : undefined,
        ifsc: isDetailed ? form.ifsc : undefined,
        upi_id: isDetailed ? form.upi_id : undefined,
        farm_size: !isDetailed ? form.farm_size : undefined,
        farm_lat: !isDetailed ? farmCoords?.lat : undefined,
        farm_lng: !isDetailed ? farmCoords?.lng : undefined
      };
      const data = await register(payload);
      login(data.token, data.user);
      setWelcomeName(data.user.username);
      setStatus('success');
      // Show the full-screen welcome overlay, then land on the home page
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
        <h2 className="auth-title">{t('auth.signupTitle')}</h2>
        <StepIndicator current={step} t={t} />

        {step === 0 && (
          <div className="role-select">
            {ROLES.map((r) => (
              <button
                key={r.value}
                className={`role-option ${role === r.value ? 'selected' : ''}`}
                onClick={() => setRole(r.value)}
              >
                <span className="role-emoji">{r.emoji}</span>
                <span className="role-label">{t(r.labelKey)}</span>
                <span className="role-desc">{t(r.descKey)}</span>
              </button>
            ))}
            <button className="btn-form-submit" disabled={!role} onClick={() => setStep(1)}>
              {t('auth.continue')}
            </button>
          </div>
        )}

        {step === 1 && (
          <form className="form-body" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">{t('auth.fullName')} *</label>
              <input type="text" className="form-input" placeholder="Your full name" value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div className="form-grid-row">
              <div className="form-group">
                <label className="form-label">{t('auth.username')} *</label>
                <input type="text" className="form-input" autoComplete="username" placeholder="e.g. ramesh_kumar" value={form.username} onChange={set('username')} required />
                {usernameStatus === 'checking' && (
                  <div className="username-status checking"><span className="btn-spinner btn-spinner-dark btn-spinner-sm" aria-hidden="true" /> {t('auth.usernameChecking')}</div>
                )}
                {usernameStatus === 'available' && <div className="username-status ok">✓ {t('auth.usernameAvailable')}</div>}
                {usernameStatus === 'taken' && <div className="username-status err">✕ {t('auth.usernameTaken')}</div>}
                {usernameStatus === 'invalid' && <div className="username-status err">✕ {t('auth.usernameInvalid')}</div>}
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
                <div className="otp-row">
                  <input ref={otpInput} type="text" className="form-input" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  <button type="button" className="btn-small" style={{ background: '#0d9488', whiteSpace: 'nowrap' }} onClick={handleVerifyOtp}>
                    {t('auth.verify')}
                  </button>
                </div>
              </div>
            )}
            <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(0)}>{t('common.back')}</button>
          </form>
        )}

        {step === 2 && (
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
                <div className="form-group">
                  <label className="form-label">{t('auth.govtId')} *</label>
                  <span className="form-hint" style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>{t('auth.govtIdHint')}</span>
                  <PhotoUpload onUploaded={(url) => setForm({ ...form, govt_id_url: url })} />
                </div>
                <LocationSelects value={form} onChange={setForm} />

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
                <div className="form-group">
                  <label className="form-label">{t('auth.govtId')} ({t('auth.optional')})</label>
                  <PhotoUpload onUploaded={(url) => setForm({ ...form, govt_id_url: url })} />
                </div>
                
                <h3 className="form-section-title">{t('auth.address')}</h3>
                <LocationSelects value={form} onChange={setForm} />
                <div className="form-group">
                  <label className="form-label">{t('auth.farmLocation')} *</label>
                  <input type="text" className="form-input" placeholder="Village, Taluka" value={farmLoc} onChange={(e) => setFarmLoc(e.target.value)} />
                  <div className="coords-chip">
                    📌 {t('auth.mapPin')} {farmCoords ? `${farmCoords.lat.toFixed(5)}, ${farmCoords.lng.toFixed(5)}` : t('field.notSet')}
                  </div>
                </div>
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

            <button type="submit" className={`btn-form-submit ${status === 'loading' ? 'loading' : ''}`} disabled={status !== 'idle'}>
              {status === 'loading' && <span className="btn-spinner" aria-hidden="true" />}
              {status === 'loading' ? t('auth.creating') : t('auth.createAccount')}
            </button>
          </form>
        )}

        <p className="auth-switch">
          {t('auth.alreadyHave')} <a href="#" onClick={(e) => { e.preventDefault(); navigate('signin'); }}>{t('auth.signinTitle')}</a>
        </p>
      </div>
    </div>
  );
}
