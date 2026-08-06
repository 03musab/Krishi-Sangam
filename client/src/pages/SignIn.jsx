import { useEffect, useRef, useState } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { signin, signinOtp, sendOtp } from '../lib/api';
import WelcomeOverlay from '../components/WelcomeOverlay';
import OtpInput from '../components/OtpInput';
import OtpResend from '../components/OtpResend';

export default function SignIn() {
  const { navigate, back } = useNav();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [mode, setMode] = useState('password'); // 'password' | 'otp'

  // Password mode fields
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // OTP mode fields
  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [welcomeName, setWelcomeName] = useState('');
  const navTimer = useRef(null);

  // Clear the pending navigation timer if the user navigates away mid-animation
  useEffect(() => () => clearTimeout(navTimer.current), []);

  const requestLocationOnLogin = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        localStorage.setItem('krishisangam_location', JSON.stringify(coords));
      },
      () => {
        // Ignore location denial errors here; the browser prompt is the important part.
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const finishLogin = (data) => {
    login(data.token, data.user);
    requestLocationOnLogin();
    setWelcomeName(data.user.full_name || data.user.username || '');
    setStatus('success');
    // Show the full-screen welcome overlay, then land on the home page
    navTimer.current = setTimeout(() => {
      showToast(t('common.toast.welcome', { name: data.user.full_name || data.user.username }));
      navigate('home');
    }, 1400);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const isPhone = /^\d{10}$/.test(loginId.trim());
      const data = await signin(
        isPhone ? { phone: loginId.trim(), password } : { email: loginId.trim(), password }
      );
      finishLogin(data);
    } catch (err) {
      setStatus('idle');
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const doSendOtp = async () => {
    if (!/^\d{10}$/.test(otpPhone.trim())) {
      showToast(t('auth.phoneInvalid'));
      return;
    }
    const res = await sendOtp({ phone: otpPhone.trim() });
    setOtpSent(true);
    if (res.devOtp) {
      // Dev mode: SMS provider not configured — surface the code in a toast.
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

  const submitOtpCode = async (code) => {
    const codeToCheck = (code || otp).trim();
    if (!otpSent || codeToCheck.length !== 6) return;
    setStatus('loading');
    try {
      const data = await signinOtp({ phone: otpPhone.trim(), otp: codeToCheck });
      finishLogin(data);
    } catch (err) {
      setStatus('idle');
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    await submitOtpCode();
  };

  const switchMode = (m) => {
    setMode(m);
    setStatus('idle');
    setOtpSent(false);
    setOtp('');
  };

  return (
    <div className="form-card-container auth-container">
      {status === 'success' && <WelcomeOverlay name={welcomeName} />}
      <div className="form-card">
        <button className="btn-back-icon" onClick={back} aria-label="Back" style={{ marginBottom: '14px' }}>←</button>
        <h2 className="auth-title">{t('auth.signinTitle')}</h2>

        {/* Mode tabs */}
        <div className="admin-subnav-tabs" style={{ maxWidth: 'none', margin: '0 0 18px', padding: 0, justifyContent: 'center' }}>
          <button
            type="button"
            className={`admin-tab-btn ${mode === 'password' ? 'active' : ''}`}
            onClick={() => switchMode('password')}
          >
            {t('auth.signinPassword')}
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${mode === 'otp' ? 'active' : ''}`}
            onClick={() => switchMode('otp')}
          >
            {t('auth.signinOtp')}
          </button>
        </div>

        {mode === 'password' && (
          <form className="form-body" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth.emailOrPhone')}</label>
              <input
                type="text"
                className="form-input"
                required
                autoComplete="username"
                placeholder={t('auth.emailOrPhone')}
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input
                type="password"
                className="form-input"
                required
                autoComplete="current-password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className={`btn-form-submit btn-green ${status === 'loading' ? 'loading' : ''}`} disabled={status !== 'idle'}>
              {status === 'loading' && <span className="btn-spinner" aria-hidden="true" />}
              {status === 'loading' ? t('common.loading') : t('auth.signinTitle')}
            </button>
            <p className="auth-switch">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('forgot-password'); }}>{t('auth.forgotPassword')}</a>
            </p>
          </form>
        )}

        {mode === 'otp' && (
          <form className="form-body" onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth.mobile')} *</label>
              <div className="otp-row">
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10-digit mobile"
                  value={otpPhone}
                  onChange={(e) => setOtpPhone(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-small"
                  style={{ background: '#15803d', whiteSpace: 'nowrap' }}
                  onClick={handleSendOtp}
                >
                  {t('auth.sendOtp')}
                </button>
              </div>
            </div>
            {otpSent && (
              <div className="form-group">
                <label className="form-label">{t('auth.enterOtp')} *</label>
                <OtpInput value={otp} onChange={setOtp} autoFocus onComplete={submitOtpCode} />
                <div className="otp-resend-row">
                  <OtpResend onResend={doSendOtp} />
                </div>
              </div>
            )}
            <button
              type="submit"
              className={`btn-form-submit btn-green ${status === 'loading' ? 'loading' : ''}`}
              disabled={status !== 'idle' || !otpSent}
            >
              {status === 'loading' && <span className="btn-spinner" aria-hidden="true" />}
              {status === 'loading' ? t('common.loading') : t('auth.signinOtp')}
            </button>
          </form>
        )}

        <p className="auth-switch">
          {t('auth.dontHave')} <a href="#" onClick={(e) => { e.preventDefault(); navigate('signup'); }}>{t('auth.signupTitle')}</a>
        </p>
      </div>
    </div>
  );
}