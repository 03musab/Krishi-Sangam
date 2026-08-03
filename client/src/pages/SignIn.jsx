import { useEffect, useRef, useState } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { signin } from '../lib/api';
import WelcomeOverlay from '../components/WelcomeOverlay';

export default function SignIn() {
  const { navigate } = useNav();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const data = await signin({ username: username.trim(), password });
      login(data.token, data.user);
      requestLocationOnLogin();
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
        <h2 className="auth-title">{t('auth.signinTitle')}</h2>
        <form className="form-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.username')}</label>
            <input type="text" className="form-input" required autoComplete="username" placeholder={t('auth.username')} value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input type="password" className="form-input" required autoComplete="current-password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className={`btn-form-submit btn-green ${status === 'loading' ? 'loading' : ''}`} disabled={status !== 'idle'}>
            {status === 'loading' && <span className="btn-spinner" aria-hidden="true" />}
            {t('auth.signinTitle')}
          </button>
        </form>
        <p className="auth-switch">
          {t('auth.dontHave')} <a href="#" onClick={(e) => { e.preventDefault(); navigate('signup'); }}>{t('auth.signupTitle')}</a>
        </p>
      </div>
    </div>
  );
}
