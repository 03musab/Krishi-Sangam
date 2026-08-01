import { useState } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { signin } from '../lib/api';

export default function SignIn() {
  const { navigate } = useNav();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await signin({ email: email.trim(), password });
      login(data.token, data.user);
      showToast('Welcome, ' + data.user.username + '!');
      navigate('home');
    } catch (err) {
      showToast('Sign in error: ' + err.message);
    }
  };

  return (
    <div className="form-card-container auth-container">
      <div className="form-card">
        <h2 className="auth-title">Sign In</h2>
        <form className="form-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" required placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-form-submit btn-green">Sign In</button>
        </form>
        <p className="auth-switch">
          Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('signup'); }}>Sign Up</a>
        </p>
      </div>
    </div>
  );
}
