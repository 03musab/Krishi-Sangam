import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getProfile, updateProfile } from '../lib/api';
import Icon from './Icon';

export default function BankDetailsCard({ title, subtitle }) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    bank_account: '',
    ifsc: '',
    upi_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        bank_account: user.bank_account || '',
        ifsc: user.ifsc || '',
        upi_id: user.upi_id || ''
      });
    }
    getProfile()
      .then((d) => {
        if (d.user) {
          setForm({
            bank_account: d.user.bank_account || '',
            ifsc: d.user.ifsc || '',
            upi_id: d.user.upi_id || ''
          });
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const d = await updateProfile({
        bank_account: form.bank_account,
        ifsc: form.ifsc,
        upi_id: form.upi_id
      });
      if (d.user) refreshUser(d.user);
      setSaved(true);
      showToast(t('bank.savedSuccess', 'Bank details saved successfully!'));
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bank-details-card" style={{
      background: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '12px',
      padding: '22px 24px',
      marginTop: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="bank" size={22} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>
            {title || t('bank.title', 'Bank & Payout Details')}
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
            {subtitle || t('bank.subtitle', 'Add your bank details whenever you wish to receive payouts or refunds directly.')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
              {t('auth.bankAccount', 'Bank Account Number')}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 1234567890"
              value={form.bank_account}
              onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
              {t('auth.ifsc', 'IFSC Code')}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. HDFC0001234"
              value={form.ifsc}
              onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8', margin: '2px 0' }}>
          ── {t('auth.or', 'OR')} ──
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
            {t('auth.upiId', 'UPI ID / VPA')}
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. name@upi or mobile@paytm"
            value={form.upi_id}
            onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="lock" size={14} /> {t('bank.secureNote', 'Your payment details are stored safely and encrypted.')}
          </span>
          <button
            type="submit"
            className="btn-small"
            style={{
              background: saved ? '#16a34a' : '#15803d',
              color: '#ffffff',
              padding: '8px 18px',
              fontSize: '0.88rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            disabled={loading}
          >
            {loading ? t('common.saving', 'Saving...') : saved ? '✓ Saved!' : t('bank.saveBtn', 'Save Bank Details')}
          </button>
        </div>
      </form>
    </div>
  );
}
