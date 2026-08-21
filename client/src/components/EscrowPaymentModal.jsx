import { useState } from 'react';
import { createPayment } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function EscrowPaymentModal({ booking, onClose, onSuccess }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [method, setMethod] = useState('upi');
  const [submitting, setSubmitting] = useState(false);

  const amount = booking?.total_price || booking?.price || 0;

  const handlePay = async () => {
    setSubmitting(true);
    try {
      await createPayment({
        booking_id: booking.id,
        method
      });
      showToast(t('escrow.paidSuccess', 'Payment deposited into Escrow ledger safely!'));
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px'
    }}>
      <div className="modal-card" style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '440px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>🛡️ {t('escrow.modalTitle', 'Krishi Escrow Payment')}</h3>
          <button className="btn-close" onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '600' }}>🔒 {t('escrow.protectionBanner', '100% Protected Escrow')}</div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#15803d' }}>
            {t('escrow.protectionDesc', 'Payment is safely held in Escrow and ONLY released to the provider after you confirm work completion at your farm.')}
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('escrow.bookingFor', 'Booking Details')}</div>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
            {booking?.listing_title || booking?.service_name || 'Agricultural Service'}
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>
            ₹{amount.toLocaleString()}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="form-label">{t('escrow.selectMethod', 'Select Payment Method')}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              border: method === 'upi' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              background: method === 'upi' ? '#eff6ff' : '#ffffff'
            }}>
              <input type="radio" name="payMethod" value="upi" checked={method === 'upi'} onChange={() => setMethod('upi')} />
              <span>📱 Google Pay / PhonePe / BHIM UPI</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              border: method === 'card' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              background: method === 'card' ? '#eff6ff' : '#ffffff'
            }}>
              <input type="radio" name="payMethod" value="card" checked={method === 'card'} onChange={() => setMethod('card')} />
              <span>💳 Debit / Credit Card</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              border: method === 'pod' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              background: method === 'pod' ? '#eff6ff' : '#ffffff'
            }}>
              <input type="radio" name="payMethod" value="pod" checked={method === 'pod'} onChange={() => setMethod('pod')} />
              <span>💵 Pay Cash on Arrival (Escrow Hold)</span>
            </label>
          </div>
        </div>

        <button
          className="btn-form-submit"
          style={{ width: '100%', background: '#16a34a', padding: '12px' }}
          onClick={handlePay}
          disabled={submitting}
        >
          {submitting ? t('common.processing', 'Processing...') : `Pay ₹${amount.toLocaleString()} to Escrow`}
        </button>
      </div>
    </div>
  );
}
