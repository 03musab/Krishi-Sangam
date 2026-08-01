import { useState } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { signout } from '../lib/api';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', view: 'home' },
  { id: 'land', label: 'Land Leasing', view: 'land-leasing' },
  { id: 'equipment', label: 'Equipment', view: 'equipment-rental' },
  { id: 'labour', label: 'Labour', view: 'labour' },
  { id: 'produce', label: 'Produce', view: 'produce' },
  { id: 'admin', label: 'Admin', view: 'admin', adminOnly: true }
];

const DROPDOWN_ITEMS = [
  { id: 'bookings', label: '📅 My Bookings', view: 'bookings' },
  { id: 'messages', label: '💬 Messages', view: 'messages' },
  { id: 'produce', label: '🌾 My Produce', view: 'produce' },
  { id: 'payments', label: '💰 Payments', view: 'payments' },
  { id: 'profile', label: '👤 Profile', view: 'profile' }
];

export default function Navbar() {
  const { view, navigate } = useNav();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);

  const handleNav = (navItem) => {
    if (navItem.adminOnly && (!user || user.role !== 'admin')) {
      showToast('Admin access required.');
      return;
    }
    navigate(navItem.view);
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    try { await signout(); } catch (e) { /* noop */ }
    logout();
    setDdOpen(false);
    showToast('Signed out.');
    navigate('home');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate('home')}>
        <div className="brand-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" opacity="0.3"/>
            <path d="M7 13c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5z" fill="white"/>
            <path d="M12 4v2M12 18v2M4 12H2M22 12h-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="brand-name">Krishi Sangam</span>
      </div>

      <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
        {NAV_ITEMS.filter((i) => !i.adminOnly || (user && user.role === 'admin')).map((item) => (
          <li key={item.id}>
            <a
              href="#"
              className={`nav-item ${view === item.view || (item.view === 'home' && view === 'home') ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNav(item); }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        {!user && (
          <>
            <button className="nav-auth-btn" onClick={() => navigate('signin')}>Sign In</button>
            <button className="nav-auth-btn nav-auth-btn-primary" onClick={() => navigate('signup')}>Sign Up</button>
          </>
        )}
        {user && (
          <div className="nav-user-menu">
            <button className="nav-user-btn" onClick={() => setDdOpen((o) => !o)}>
              <span className="nav-user-avatar">🌾</span>
              <span className="nav-user-name">{user.username}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {ddOpen && (
              <>
                <div className="dropdown-backdrop" onClick={() => setDdOpen(false)} />
                <div className="nav-user-dropdown">
                  {DROPDOWN_ITEMS.map((item) => (
                    <button key={item.id} className="nav-user-dropdown-item" onClick={() => { setDdOpen(false); navigate(item.view); }}>
                      {item.label}
                    </button>
                  ))}
                  {user.role === 'admin' && (
                    <button className="nav-user-dropdown-item" onClick={() => { setDdOpen(false); navigate('admin'); }}>
                      🛡️ Admin Panel
                    </button>
                  )}
                  <hr style={{ margin: '6px 8px', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                  <button className="nav-user-dropdown-item" onClick={handleSignOut}>🚪 Sign Out</button>
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
