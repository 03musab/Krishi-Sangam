import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProfile, updateProfile, changePassword } from '../lib/api';

export default function Profile() {
  const { navigate } = useNav();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ username: '', phone: '', location: '', bio: '', skills: '' });
  const [pw, setPw] = useState({ current: '', next: '' });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setPwField = (key) => (e) => setPw({ ...pw, [key]: e.target.value });

  useEffect(() => {
    if (!user) { navigate('signin'); return; }
    getProfile()
      .then((d) => {
        const u = d.user;
        setForm({ username: u.username || '', phone: u.phone || '', location: u.location || '', bio: u.bio || '', skills: u.skills || '' });
      })
      .catch(() => showToast('Error loading profile.'));
  }, []);

  const handleProfile = async (e) => {
    e.preventDefault();
    try {
      const d = await updateProfile({
        username: form.username, phone: form.phone, location: form.location,
        bio: form.bio, skills: form.skills
      });
      refreshUser(d.user);
      showToast('Profile updated!');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handlePw = async (e) => {
    e.preventDefault();
    try {
      await changePassword({ current_password: pw.current, new_password: pw.next });
      showToast('Password changed!');
      setPw({ current: '', next: '' });
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <>
      <PageBanner title="My Profile" color="slate" />
      <div className="form-card-container profile-container">
        <div className="form-card">
          <form className="form-body" onSubmit={handleProfile}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" className="form-input" value={form.username} onChange={set('username')} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" placeholder="10-digit mobile" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input" placeholder="City, State" value={form.location} onChange={set('location')} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" placeholder="Tell us about yourself..." value={form.bio} onChange={set('bio')} />
            </div>
            <div className="form-group">
              <label className="form-label">Skills (comma-separated)</label>
              <input type="text" className="form-input" placeholder="e.g. farming, irrigation" value={form.skills} onChange={set('skills')} />
            </div>
            <button type="submit" className="btn-form-submit btn-slate">Save Profile</button>
          </form>
        </div>

        <hr className="form-divider" />

        <div className="form-card">
          <h3 className="form-section-title">Change Password</h3>
          <form className="form-body" onSubmit={handlePw}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={pw.current} onChange={setPwField('current')} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" minLength="6" value={pw.next} onChange={setPwField('next')} required />
            </div>
            <button type="submit" className="btn-form-submit btn-danger">Change Password</button>
          </form>
        </div>
      </div>
    </>
  );
}
