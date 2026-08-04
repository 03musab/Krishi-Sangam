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
  const { navigate, back } = useNav();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', password: '',
    gender: 'Male', dob: '', govt_id_url: '', id_type: '', id_number: '',
    district: '', state: '',
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
  const otpInput = useRef(null);
  const navTimer = useRef(null);

  // Clear the pending navigation timer if the user navigates away mid-animation
  useEffect(() => () => clearTimeout(navTimer.current), []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const isDetailed = role === 'labourer' || role === 'owner';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      showToast(t('auth.phoneInvalid'));
      return;
    }
    try {
      const res = await sendOtp({ phone: form.phone });
      setOtpSent(true);
      if (res.devOtp) {
        // Dev mode: SMS provider not configured — surface the code in a toast.
        showToast(t('auth.otpSent', { otp: res.devOtp }), 5000);
      } else {
        showToast(t('auth.otpSentReal'));
      }
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
        farm_lat: farmCoords?.lat,
        farm_lng: farmCoords?.lng
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
        <button className="btn-back-icon" onClick={back} aria-label="Back" style={{ marginBottom: '14px' }}>←</button>
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

        {step === 1 && (
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

        <p className="auth-switch">
          {t('auth.alreadyHave')} <a href="#" onClick={(e) => { e.preventDefault(); navigate('signin'); }}>{t('auth.signinTitle')}</a>
        </p>
      </div>
    </div>
  );
}
