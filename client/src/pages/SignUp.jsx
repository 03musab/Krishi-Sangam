import { useRef, useState } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { register, sendOtp, verifyOtp } from '../lib/api';
import PhotoUpload from '../components/PhotoUpload';

const ROLES = [
  { value: 'farmer', label: '👨‍🌾 Farmer', desc: 'I grow crops and need services' },
  { value: 'owner', label: '🚜 Land / Equipment Owner', desc: 'I want to list land or equipment' },
  { value: 'labourer', label: '👷 Labourer', desc: 'I offer farm labour services' }
];

function StepIndicator({ current }) {
  const steps = ['Role', 'Details', 'Verify'];
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

  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', password: '',
    gender: 'Male', dob: '', govt_id_url: '',
    village: '', taluka: '', district: '', state: '',
    labour_category: '', skill_level: 'Skilled',
    bank_account: '', ifsc: '', upi_id: '',
    farm_size: ''
  });
  const [farmCoords, setFarmCoords] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const otpInput = useRef(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const isDetailed = role === 'labourer' || role === 'owner';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      showToast('Enter a valid 10-digit mobile number.');
      return;
    }
    try {
      const res = await sendOtp({ phone: form.phone });
      setOtpSent(true);
      showToast(`OTP sent! Use ${res.devOtp} in this demo.`, 5000);
      setTimeout(() => otpInput.current?.focus(), 100);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp({ phone: form.phone, otp });
      showToast('Phone verified!');
      setOtpSent(false);
      setStep(2);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        full_name: form.full_name,
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
      showToast('Welcome, ' + data.user.username + '!');
      navigate('home');
    } catch (err) {
      showToast('Registration error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card-container auth-container">
      <div className="form-card">
        <h2 className="auth-title">Create Account</h2>
        <StepIndicator current={step} />

        {step === 0 && (
          <div className="role-select">
            {ROLES.map((r) => (
              <button
                key={r.value}
                className={`role-option ${role === r.value ? 'selected' : ''}`}
                onClick={() => setRole(r.value)}
              >
                <span className="role-emoji">{r.label.split(' ')[0]}</span>
                <span className="role-label">{r.label.replace(/^[^\s]+\s/, '')}</span>
                <span className="role-desc">{r.desc}</span>
              </button>
            ))}
            <button className="btn-form-submit" disabled={!role} onClick={() => setStep(1)}>
              Continue
            </button>
          </div>
        )}

        {step === 1 && (
          <form className="form-body" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" placeholder="Your full name" value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <div className="otp-row">
                <input type="tel" className="form-input" placeholder="10-digit mobile" value={form.phone} onChange={set('phone')} required />
                <button type="submit" className="btn-small" style={{ background: '#15803d', whiteSpace: 'nowrap' }}>
                  Send OTP
                </button>
              </div>
            </div>
            {otpSent && (
              <div className="form-group">
                <label className="form-label">Enter OTP *</label>
                <div className="otp-row">
                  <input ref={otpInput} type="text" className="form-input" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  <button type="button" className="btn-small" style={{ background: '#0d9488', whiteSpace: 'nowrap' }} onClick={handleVerifyOtp}>
                    Verify
                  </button>
                </div>
              </div>
            )}
            <button type="button" className="btn-form-submit btn-slate" onClick={() => setStep(0)}>Back</button>
          </form>
        )}

        {step === 2 && (
          <form className="form-body" onSubmit={handleSubmit}>
            {isDetailed ? (
              <>
                <h3 className="form-section-title">Identity & Address</h3>
                <div className="form-grid-row">
                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select className="form-select" value={form.gender} onChange={set('gender')}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth *</label>
                    <input type="date" className="form-input" value={form.dob} onChange={set('dob')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Government ID (Aadhaar / Voter ID / Driving Licence) *</label>
                  <span className="form-hint" style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Front image only (or both sides if your verification process requires it)</span>
                  <PhotoUpload onUploaded={(url) => setForm({ ...form, govt_id_url: url })} />
                </div>
                <div className="form-grid-row">
                  <div className="form-group">
                    <label className="form-label">Village / Town *</label>
                    <input type="text" className="form-input" value={form.village} onChange={set('village')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Taluka *</label>
                    <input type="text" className="form-input" value={form.taluka} onChange={set('taluka')} required />
                  </div>
                </div>
                <div className="form-grid-row">
                  <div className="form-group">
                    <label className="form-label">District *</label>
                    <input type="text" className="form-input" value={form.district} onChange={set('district')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input type="text" className="form-input" value={form.state} onChange={set('state')} required />
                  </div>
                </div>

                <h3 className="form-section-title">Work Profile</h3>
                <div className="form-grid-row">
                  <div className="form-group">
                    <label className="form-label">Labour Category *</label>
                    <select className="form-select" value={form.labour_category} onChange={set('labour_category')} required>
                      <option value="">Select category</option>
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
                    <label className="form-label">Skill Level *</label>
                    <select className="form-select" value={form.skill_level} onChange={set('skill_level')}>
                      <option>Skilled</option><option>Semi-Skilled</option><option>Unskilled</option>
                    </select>
                  </div>
                </div>

                <h3 className="form-section-title">Payment Details</h3>
                <div className="form-grid-row">
                  <div className="form-group">
                    <label className="form-label">Bank Account Number</label>
                    <input type="text" className="form-input" value={form.bank_account} onChange={set('bank_account')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IFSC Code</label>
                    <input type="text" className="form-input" placeholder="e.g. HDFC0001234" value={form.ifsc} onChange={set('ifsc')} />
                  </div>
                </div>
                <div className="payment-or">— OR —</div>
                <div className="form-group">
                  <label className="form-label">UPI ID</label>
                  <input type="text" className="form-input" placeholder="e.g. name@upi" value={form.upi_id} onChange={set('upi_id')} />
                </div>
              </>
            ) : (
              <>
                <h3 className="form-section-title">Identity Verification</h3>
                <div className="form-group">
                  <label className="form-label">Government ID (Optional)</label>
                  <PhotoUpload onUploaded={(url) => setForm({ ...form, govt_id_url: url })} />
                </div>
                
                <h3 className="form-section-title">Address</h3>
                <div className="form-grid-row">
                  <div className="form-group">
                    <label className="form-label">Village / Town *</label>
                    <input type="text" className="form-input" value={form.village} onChange={set('village')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Taluka *</label>
                    <input type="text" className="form-input" value={form.taluka} onChange={set('taluka')} required />
                  </div>
                </div>
                <div className="form-grid-row">
                  <div className="form-group">
                    <label className="form-label">District *</label>
                    <input type="text" className="form-input" value={form.district} onChange={set('district')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input type="text" className="form-input" value={form.state} onChange={set('state')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Farm Location (Map Pin) *</label>
                  <input type="text" className="form-input" placeholder="Village, Taluka" value={form.village} onChange={set('village')} />
                  <div className="coords-chip">
                    📌 Map pin: {farmCoords ? `${farmCoords.lat.toFixed(5)}, ${farmCoords.lng.toFixed(5)}` : 'Not set'}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Farm Size (Acres) *</label>
                  <input type="text" className="form-input" placeholder="e.g. 5" value={form.farm_size} onChange={set('farm_size')} required />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Password (min 6 characters) *</label>
              <input type="password" className="form-input" minLength="6" value={form.password} onChange={set('password')} required />
            </div>

            <button type="submit" className="btn-form-submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('signin'); }}>Sign In</a>
        </p>
      </div>
    </div>
  );
}
