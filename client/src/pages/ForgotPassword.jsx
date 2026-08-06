import { useEffect, useRef, useState } from 'react';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { sendOtp, resetPassword } from '../lib/api';
import OtpInput from '../components/OtpInput';
import OtpResend from '../components/OtpResend';
import Icon from '../components/Icon';

export default function ForgotPassword() {
  const { navigate, back } = useNav();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const navTimer = useRef(null);

  // Clear the pending navigation timer if the user navigates away mid-animation
  useEffect(() => () => clearTimeout(navTimer.current), []);

  const doSendOtp = async () => {
    if (!/^\d{10}$/.test(phone.trim())) {
      showToast(t('auth.phoneInvalid'));
      return;
    }
    const res = await sendOtp({ phone: phone.trim() });
    setOtpSent(true);
    if (res.devOtp) {
      showToast(t('auth.otpSent', { otp: res.devOtp }), 5000);
    } else {
      showToast(t('auth.otpSentReal'));
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await doSendOtp();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setStatus('idle');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otpSent) return;
    setStatus('loading');
    try {
      await resetPassword({ phone: phone.trim(), otp: otp.trim(), newPassword });
      showToast(t('auth.passwordReset'));
      setStatus('success');
      navTimer.current = setTimeout(() => navigate('signin', { replace: true }), 900);
    } catch (err) {
      setStatus('idle');
      setOtp('');
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <div className="form-card-container auth-container">
      <div className="form-card">
        <button className="btn-back-icon" onClick={back} aria-label="Back" style={{ marginBottom: '14px' }}>←</button>
        <h2 className="auth-title">
          <Icon name="lock" size={20} style={{ verticalAlign: '-4px', marginRight: '8px' }} />
          {t('auth.forgotTitle')}
        </h2>
        <p className="auth-subtitle">{t('auth.forgotDesc')}</p>

        {!otpSent ? (
          <form className="form-body" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">{t('auth.mobile')} *</label>
              <div className="otp-row">
                <input
                  type="tel"
                  className="form-input"
                  placeholder={t('auth.enterRegisteredPhone')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn-small"
                  style={{ background: '#15803d', whiteSpace: 'nowrap' }}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? t('common.loading') : t('auth.sendOtp')}
                </button>
              </div>
            </div>
            <p className="auth-switch">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('signin'); }}>{t('auth.signinTitle')} →</a>
            </p>
          </form>
        ) : (
          <form className="form-body" onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">{t('auth.enterOtp')} *</label>
              <OtpInput value={otp} onChange={setOtp} autoFocus />
            </div>
            <div className="otp-resend-row">
              <OtpResend onResend={doSendOtp} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.newPassword')} *</label>
              <input
                type="password"
                className="form-input"
                minLength="6"
                autoComplete="new-password"
                placeholder="••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className={`btn-form-submit btn-green ${status === 'loading' ? 'loading' : ''}`}
              disabled={status !== 'idle'}
            >
              {status === 'loading' && <span className="btn-spinner" aria-hidden="true" />}
              {status === 'loading' ? t('common.loading') : t('auth.resetPassword')}
            </button>
            <button type="button" className="btn-form-submit btn-slate" onClick={() => { setOtpSent(false); setOtp(''); }}>
              {t('common.back')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
