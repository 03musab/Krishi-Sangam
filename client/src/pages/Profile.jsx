import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getProfile, updateProfile, changePassword } from '../lib/api';

export default function Profile() {
  const { navigate } = useNav();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState({ username: '', phone: '', location: '', bio: '', skills: '' });
  const [pw, setPw] = useState({ current: '', next: '' });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setPwField = (key) => (e) => setPw({ ...pw, [key]: e.target.value });

  useEffect(() => {
    if (!user) { navigate('signin', { replace: true }); return; }
    getProfile()
      .then((d) => {
        const u = d.user;
        setForm({ username: u.username || '', phone: u.phone || '', location: u.location || '', bio: u.bio || '', skills: u.skills || '' });
      })
      .catch(() => showToast(t('profile.loadError')));
  }, []);

  const handleProfile = async (e) => {
    e.preventDefault();
    try {
      const d = await updateProfile({
        username: form.username, phone: form.phone, location: form.location,
        bio: form.bio, skills: form.skills
      });
      refreshUser(d.user);
      showToast(t('profile.updated'));
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handlePw = async (e) => {
    e.preventDefault();
    try {
      await changePassword({ current_password: pw.current, new_password: pw.next });
      showToast(t('profile.pwChanged'));
      setPw({ current: '', next: '' });
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const isProvider = user && (user.role === 'owner' || user.role === 'labourer' || user.role === 'admin' || user.skills);

  return (
    <>
      <PageBanner title={t('profile.title', 'User Profile & Settings')} color="slate" />
      <div className="form-card-container profile-container">
        <div className="form-card">
          <form className="form-body" onSubmit={handleProfile}>
            <div className="form-group">
              <label className="form-label">{t('profile.username')}</label>
              <input type="text" className="form-input" value={form.username} onChange={set('username')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('profile.phone')}</label>
              <input type="tel" className="form-input" placeholder="10-digit mobile" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('profile.location')}</label>
              <input type="text" className="form-input" placeholder="City, State" value={form.location} onChange={set('location')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('profile.bio')}</label>
              <textarea className="form-textarea" placeholder="Tell us about yourself..." value={form.bio} onChange={set('bio')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('profile.skills')}</label>
              <input type="text" className="form-input" placeholder="e.g. farming, tractor operator, irrigation" value={form.skills} onChange={set('skills')} />
            </div>
            <button type="submit" className="btn-form-submit btn-slate">{t('profile.save')}</button>
          </form>
        </div>

        {/* ── Provider Availability Calendar Section ── */}
        <AvailabilityCalendar />

        <hr className="form-divider" />

        <div className="form-card">
          <h3 className="form-section-title">{t('profile.changePw')}</h3>
          <form className="form-body" onSubmit={handlePw}>
            <div className="form-group">
              <label className="form-label">{t('profile.currentPw')}</label>
              <input type="password" className="form-input" value={pw.current} onChange={setPwField('current')} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('profile.newPw')}</label>
              <input type="password" className="form-input" minLength="6" value={pw.next} onChange={setPwField('next')} required />
            </div>
            <button type="submit" className="btn-form-submit btn-danger">{t('profile.changePwBtn')}</button>
          </form>
        </div>
      </div>
    </>
  );
}
