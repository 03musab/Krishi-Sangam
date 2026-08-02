import { useState, useEffect, useRef } from 'react';
import krishiSangamLogo from '../assets/krishisangam_logo.png';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { signout } from '../lib/api';

const NAV_ITEMS = [
  { id: 'land', labelKey: 'nav.land', view: 'land-leasing' },
  { id: 'equipment', labelKey: 'nav.equipment', view: 'equipment-rental' },
  { id: 'labour', labelKey: 'nav.labour', view: 'labour' },
  { id: 'contact', labelKey: 'nav.contact', view: 'contact' },
  { id: 'admin', labelKey: 'nav.admin', view: 'admin', adminOnly: true }
];

const ICON_PROPS = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const DROPDOWN_ITEMS = [
  {
    id: 'about', labelKey: 'nav.about', view: 'about',
    icon: <svg {...ICON_PROPS}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
  },
  {
    id: 'bookings', labelKey: 'nav.bookings', view: 'bookings',
    icon: <svg {...ICON_PROPS}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
  },
  {
    id: 'messages', labelKey: 'nav.messages', view: 'messages',
    icon: <svg {...ICON_PROPS}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  },
  {
    id: 'produce', labelKey: 'nav.produce', view: 'produce',
    icon: <svg {...ICON_PROPS}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
  },
  {
    id: 'payments', labelKey: 'nav.payments', view: 'payments',
    icon: <svg {...ICON_PROPS}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
  },
  {
    id: 'profile', labelKey: 'nav.profile', view: 'profile',
    icon: <svg {...ICON_PROPS}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  }
];

export default function Navbar() {
  const { view, navigate } = useNav();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { t, lang, setLang, languages } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleNav = (navItem) => {
    if (navItem.adminOnly && (!user || user.role !== 'admin')) {
      showToast(t('common.toast.adminRequired'));
      return;
    }
    navigate(navItem.view);
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try { await signout(); } catch (e) { /* noop */ }
    logout();
    setSigningOut(false);
    setDdOpen(false);
    showToast(t('common.toast.signedOut'));
    navigate('home');
  };

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  return (
    <nav className="navbar">
      <div className={`nav-brand ${view === 'home' ? 'active' : ''}`} title="Go to Home" onClick={() => { navigate('home'); setMenuOpen(false); }}>
        <div className="brand-logo">
          <img src={krishiSangamLogo} alt="Krishi Sangam" className="brand-logo-img" />
        </div>
        <span className="brand-name">Krishi Sangam</span>
      </div>

      <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
        {NAV_ITEMS.filter((i) => !i.adminOnly || (user && user.role === 'admin')).map((item) => (
          <li key={item.id}>
            <a
              href="#"
              className={`nav-item ${view === item.view ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNav(item); }}
            >
              {t(item.labelKey)}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        <div className="nav-lang" ref={langRef}>
          <button className="nav-lang-btn" onClick={() => setLangOpen((o) => !o)} title={t('nav.selectLanguage')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="nav-lang-label">{currentLang.native}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {langOpen && (
            <div className="nav-lang-dropdown">
              {languages.map((l) => (
                <button
                  key={l.code}
                  className={`nav-lang-option ${l.code === lang ? 'active' : ''}`}
                  onClick={() => { setLang(l.code); setLangOpen(false); }}
                >
                  <span className="nav-lang-native">{l.native}</span>
                  <span className="nav-lang-name">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!user && (
          <>
            <button className="nav-auth-btn" onClick={() => navigate('signin')}>{t('nav.signin')}</button>
            <button className="nav-auth-btn nav-auth-btn-primary" onClick={() => navigate('signup')}>{t('nav.signup')}</button>
          </>
        )}
        {user && (
          <div className="nav-user-menu">
            <button className="nav-user-btn" onClick={() => setDdOpen((o) => !o)}>
              <span className="nav-user-avatar">
                <svg {...ICON_PROPS} width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </span>
              <span className="nav-user-name">{user.username}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {ddOpen && (
              <>
                <div className="dropdown-backdrop" onClick={() => setDdOpen(false)} />
                <div className="nav-user-dropdown">
                  {DROPDOWN_ITEMS.map((item) => (
                    <button key={item.id} className="nav-user-dropdown-item" onClick={() => { setDdOpen(false); navigate(item.view); }}>
                      {item.icon} {t(item.labelKey)}
                    </button>
                  ))}
                  {user.role === 'admin' && (
                    <button className="nav-user-dropdown-item" onClick={() => { setDdOpen(false); navigate('admin'); }}>
                      <svg {...ICON_PROPS}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> {t('nav.adminPanel')}
                    </button>
                  )}
                  <hr style={{ margin: '6px 8px', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                  <button className="nav-user-dropdown-item" onClick={handleSignOut} disabled={signingOut}>
                    {signingOut
                      ? <span className="btn-spinner btn-spinner-dark" aria-hidden="true" />
                      : <svg {...ICON_PROPS}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>}
                    {t('nav.signout')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        <button className="hamburger" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}
