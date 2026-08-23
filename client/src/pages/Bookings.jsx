import { startTransition, useOptimistic, useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import EscrowPaymentModal from '../components/EscrowPaymentModal';
import RatingReviewModal from '../components/RatingReviewModal';
import BankDetailsCard from '../components/BankDetailsCard';
import SkeletonLoader from '../components/SkeletonLoader';
import OtpInput from '../components/OtpInput';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getMyBookings, getIncomingBookings, updateBooking,
  getEquipmentIncoming, getMyServices, updateService,
  verifyServiceOtp, completeServiceWork
} from '../lib/api';

const STATUS_CONFIG = {
  pending: {
    label: '🟡 Finding Nearby Provider...',
    color: '#d97706',
    bg: '#fef3c7',
    step: 1
  },
  confirmed: {
    label: '🟢 Provider Confirmed & Scheduled',
    color: '#2563eb',
    bg: '#dbeafe',
    step: 2
  },
  active: {
    label: '⚡ Work in Progress',
    color: '#16a34a',
    bg: '#dcfce7',
    step: 3
  },
  completed: {
    label: '✅ Service Completed',
    color: '#475569',
    bg: '#f1f5f9',
    step: 4
  },
  cancelled: {
    label: '❌ Request Cancelled',
    color: '#dc2626',
    bg: '#fee2e2',
    step: 0
  }
};

function BookingTrackerBar({ currentStep }) {
  if (currentStep === 0) return null; // Cancelled

  const steps = [
    { num: 1, label: 'Order Placed' },
    { num: 2, label: 'Provider Confirmed' },
    { num: 3, label: 'Work Started' },
    { num: 4, label: 'Completed' }
  ];

  return (
    <div style={{ margin: '14px 0 16px 0', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '10%',
          right: '10%',
          height: '3px',
          background: '#e2e8f0',
          zIndex: 1
        }}>
          <div style={{
            height: '100%',
            background: '#16a34a',
            width: `${Math.min(100, Math.max(0, ((currentStep - 1) / 3) * 100))}%`,
            transition: 'width 0.4s ease'
          }} />
        </div>

        {steps.map((s) => {
          const isDone = currentStep >= s.num;
          const isCurrent = currentStep === s.num;
          return (
            <div key={s.num} style={{ zIndex: 2, textAlign: 'center', flex: 1 }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: isDone ? '#16a34a' : '#ffffff',
                color: isDone ? '#ffffff' : '#94a3b8',
                border: isDone ? '2px solid #16a34a' : '2px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                margin: '0 auto 4px auto',
                boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isDone ? '✓' : s.num}
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: isCurrent ? '700' : '500',
                color: isCurrent ? '#0f172a' : isDone ? '#16a34a' : '#94a3b8'
              }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingItem({ booking, onStatusChange, onPayEscrow, onOpenReview, t, isService, isIncoming }) {
  const { showToast } = useToast();
  const [otpInput, setOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const rawTitle = booking.listing_title || booking.service_name || booking.listing_type || 'Agri Service';
  const title = t(`seed.${rawTitle}`, rawTitle);
  const partnerName = isIncoming ? (booking.booker_name || booking.user_name || 'Farmer') : (booking.owner_name || booking.provider_name || 'Assigned Provider');
  const price = booking.total_price || booking.price || 0;

  const currentStatus = (booking.status || 'pending').toLowerCase();
  const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.trim().length !== 4) {
      showToast('Please enter the 4-digit OTP provided by the farmer.');
      return;
    }
    setVerifyingOtp(true);
    try {
      await verifyServiceOtp(booking.id, otpInput.trim());
      showToast('✅ OTP verified! Work has officially started.');
      onStatusChange();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCompleteWork = async () => {
    try {
      await completeServiceWork(booking.id);
      showToast('🎉 Work completed! Payment released from Escrow.');
      onStatusChange();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <div className="booking-card" style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      padding: '18px 20px',
      marginBottom: '18px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
    }}>
      <div className="booking-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{title}</strong>
            {price > 0 && (
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15803d', background: '#f0fdf4', padding: '2px 8px', borderRadius: '6px' }}>
                ₹{price.toLocaleString()}
              </span>
            )}
          </div>
          <span className="muted" style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
            {partnerName && `${isIncoming ? 'Farmer: ' : 'Provider: '}${partnerName}`}
            {booking.farm_for && ` • ${booking.farm_for === 'my_farm' ? '🌾 Saved Farm' : '📍 Custom Location'}`}
          </span>
          {booking.location && <span className="muted" style={{ fontSize: '0.84rem', color: '#475569', display: 'block', marginTop: '2px' }}>📍 {booking.location}</span>}
          {booking.description && <span className="muted" style={{ fontSize: '0.84rem', color: '#475569', display: 'block', marginTop: '2px' }}>💬 {booking.description}</span>}
          {booking.farm_details && <span className="muted" style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginTop: '2px' }}>🏡 {booking.farm_details}</span>}
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className="booking-status" style={{
            color: statusCfg.color,
            fontWeight: '700',
            fontSize: '0.82rem',
            padding: '5px 12px',
            background: statusCfg.bg,
            borderRadius: '20px',
            display: 'inline-block'
          }}>
            {statusCfg.label}
          </span>

          {booking.payment_status && (
            <div style={{
              fontSize: '0.78rem',
              marginTop: '6px',
              fontWeight: '600',
              color: booking.payment_status === 'escrow' ? '#16a34a' : booking.payment_status === 'released' ? '#059669' : '#64748b'
            }}>
              {booking.payment_status === 'escrow' ? '🛡️ Payment Secured in Escrow' :
               booking.payment_status === 'released' ? '💳 Payment Released' :
               `Payment: ${booking.payment_status}`}
            </div>
          )}
        </div>
      </div>

      {/* ── Swiggy-like Step Progress Tracker ── */}
      <BookingTrackerBar currentStep={statusCfg.step} />

      {/* ── OTP DISPLAY FOR FARMER ── */}
      {!isIncoming && booking.otp_code && booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '10px', marginTop: '12px' }}>
          <span style={{ fontSize: '0.88rem', color: '#1e40af', fontWeight: '600' }}>
            🔑 Start Work OTP: <strong style={{ fontSize: '1.15rem', letterSpacing: '2px', background: '#dbeafe', padding: '2px 10px', borderRadius: '6px', color: '#1e3a8a' }}>{booking.otp_code}</strong>
          </span>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#3b82f6' }}>
            Share this 4-digit OTP with the provider when they arrive at your farm to start work.
          </p>
        </div>
      )}

      {/* ── OTP VERIFICATION INPUT FOR PROVIDER ── */}
      {isIncoming && booking.status !== 'completed' && booking.status !== 'cancelled' && booking.status !== 'active' && (
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '12px 16px', borderRadius: '10px', marginTop: '12px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#854d0e', marginBottom: '8px' }}>
            🔑 Enter Farmer's OTP to Start Work:
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <OtpInput value={otpInput} onChange={setOtpInput} length={4} autoFocus />
            <button
              className="btn-small"
              style={{ background: '#16a34a', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
              onClick={handleVerifyOtp}
              disabled={verifyingOtp}
            >
              {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </div>
      )}

      {/* ── ACTIONS BAR ── */}
      <div className="booking-actions" style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Owner Accept/Confirm Request */}
        {isIncoming && booking.status === 'pending' && (
          <button className="btn-small" style={{ background: '#2563eb', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontWeight: 600 }} onClick={() => onStatusChange(booking, 'confirmed', isService)}>
            ✓ Accept Booking
          </button>
        )}

        {/* Booker Pay into Escrow */}
        {!isIncoming && (booking.status === 'confirmed' || booking.status === 'pending') && booking.payment_status !== 'escrow' && booking.payment_status !== 'released' && (
          <button className="btn-small" style={{ background: '#16a34a', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontWeight: 600 }} onClick={() => onPayEscrow(booking)}>
            🛡️ Pay into Escrow
          </button>
        )}

        {/* Work In Progress / Complete buttons */}
        {(booking.status === 'active' || booking.status === 'confirmed') && (
          <button className="btn-small" style={{ background: '#059669', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontWeight: 600 }} onClick={handleCompleteWork}>
            ✅ Mark Work Complete & Release Payout
          </button>
        )}

        {/* Rate & Review Provider on Completed */}
        {!isIncoming && booking.status === 'completed' && (
          <button className="btn-small" style={{ background: '#f59e0b', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontWeight: 600 }} onClick={() => onOpenReview(booking)}>
            {booking.rating ? `⭐ Rated ${booking.rating}/5 (Edit Review)` : '⭐ Rate & Review Provider'}
          </button>
        )}

        {/* Cancel */}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <button className="btn-small" style={{ background: '#dc2626', color: '#fff', borderRadius: '8px', padding: '8px 14px' }} onClick={() => onStatusChange(booking, 'cancelled', isService)}>
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
}

export default function Bookings() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [tab, setTab] = useState('bookings-outgoing');
  const [outgoing, setOutgoing] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [payBooking, setPayBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([getMyBookings(), getMyServices(), getIncomingBookings(), getEquipmentIncoming()])
      .then(([my, mySvc, inc, eqInc]) => {
        const allMy = [...(my.bookings || []), ...(mySvc.bookings || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const allInc = [...(inc.bookings || []), ...(eqInc.bookings || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setOutgoing(allMy);
        setIncoming(allInc);
      })
      .catch((err) => console.error('Load bookings error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (booking, status, isService) => {
    try {
      if (isService || booking.kind) {
        await updateService(booking.id, { status });
      } else {
        await updateBooking(booking.id, { status });
      }
      showToast(t('common.toast.updated', 'Booking updated!'));
      load();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <>
      <PageBanner title={t('booking.title', 'My Bookings & Service Requests')} color="blue" />
      <div className="admin-subnav-tabs">
        <button className={`admin-tab-btn ${tab === 'bookings-outgoing' ? 'active' : ''}`} onClick={() => setTab('bookings-outgoing')}>
          {t('booking.tabMy', 'My Requests / Bookings')} ({outgoing.length})
        </button>
        <button className={`admin-tab-btn ${tab === 'bookings-incoming' ? 'active' : ''}`} onClick={() => setTab('bookings-incoming')}>
          {t('booking.tabIncoming', 'Incoming Provider Requests')} ({incoming.length})
        </button>
      </div>

      <div className="tab-pane">
        {loading && <SkeletonLoader type="row" count={3} />}

        {!loading && tab === 'bookings-outgoing' && (
          outgoing.length ? outgoing.map((b) => (
            <BookingItem
              key={b.id}
              booking={b}
              isService={!!b.kind}
              isIncoming={false}
              onStatusChange={changeStatus}
              onPayEscrow={(item) => setPayBooking(item)}
              onOpenReview={(item) => setReviewBooking(item)}
              t={t}
            />
          )) : <div className="listings-empty">{t('booking.noBookings', 'No active bookings or service requests.')}</div>
        )}

        {!loading && tab === 'bookings-incoming' && (
          incoming.length ? incoming.map((b) => (
            <BookingItem
              key={b.id}
              booking={b}
              isService={!!b.kind}
              isIncoming={true}
              onStatusChange={changeStatus}
              onPayEscrow={(item) => setPayBooking(item)}
              onOpenReview={(item) => setReviewBooking(item)}
              t={t}
            />
          )) : <div className="listings-empty">{t('booking.noIncoming', 'No incoming requests for your listings or services.')}</div>
        )}

        {/* Bank & Payout Details Card — Optionally added whenever user wishes */}
        <BankDetailsCard
          title={t('bank.bookingsSectionTitle', 'Bank & Payout Account Details')}
          subtitle={t('bank.bookingsSectionSubtitle', 'Add or update your bank account or UPI ID below whenever you want to receive earnings or refunds.')}
        />
      </div>

      {payBooking && (
        <EscrowPaymentModal
          booking={payBooking}
          onClose={() => setPayBooking(null)}
          onSuccess={() => load()}
        />
      )}

      {reviewBooking && (
        <RatingReviewModal
          booking={reviewBooking}
          isService={!!reviewBooking.kind}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => load()}
        />
      )}
    </>
  );
}
