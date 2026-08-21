import { startTransition, useOptimistic, useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import EscrowPaymentModal from '../components/EscrowPaymentModal';
import RatingReviewModal from '../components/RatingReviewModal';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getMyBookings, getIncomingBookings, updateBooking,
  getEquipmentIncoming, getMyServices, updateService,
  verifyServiceOtp, completeServiceWork
} from '../lib/api';

const STATUS_COLORS = {
  pending: '#eab308',
  confirmed: '#3b82f6',
  active: '#16a34a',
  completed: '#6b7280',
  cancelled: '#dc2626'
};

function BookingItem({ booking, onStatusChange, onPayEscrow, onOpenReview, t, isService, isIncoming }) {
  const { showToast } = useToast();
  const [otpInput, setOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const rawTitle = booking.listing_title || booking.service_name || booking.listing_type || booking.kind || 'Booking';
  const title = t(`seed.${rawTitle}`, rawTitle);
  const partnerName = isIncoming ? (booking.booker_name || booking.user_name || 'Farmer') : (booking.owner_name || booking.provider_name || 'Provider');
  const price = booking.total_price || booking.price || 0;

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
    <div className="booking-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
      <div className="booking-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{title}</strong>
          <br />
          <span className="muted" style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {booking.kind ? `Service (${booking.kind})` : booking.listing_type}
            {partnerName && ` • ${isIncoming ? 'Farmer: ' : 'Provider: '}${partnerName}`}
            {price ? ` • ₹${price.toLocaleString()}` : ''}
            {booking.farm_for && ` • ${booking.farm_for === 'my_farm' ? '🌾 My Farm' : '📍 Other Farm'}`}
          </span>
          {booking.location && <><br /><span className="muted" style={{ fontSize: '0.85rem' }}>📍 Location: {booking.location}</span></>}
          {booking.description && <><br /><span className="muted" style={{ fontSize: '0.85rem' }}>💬 {booking.description}</span></>}
          {booking.farm_details && <><br /><span className="muted" style={{ fontSize: '0.82rem', color: '#475569' }}>🏡 Details: {booking.farm_details}</span></>}
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className="booking-status" style={{
            color: STATUS_COLORS[booking.status] || '#6b7280',
            fontWeight: '700',
            fontSize: '0.82rem',
            padding: '4px 8px',
            background: `${STATUS_COLORS[booking.status] || '#6b7280'}15`,
            borderRadius: '6px'
          }}>
            {(booking.status || 'PENDING').toUpperCase()}
          </span>

          {booking.payment_status && (
            <div style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: '600', color: booking.payment_status === 'escrow' ? '#2563eb' : booking.payment_status === 'released' ? '#16a34a' : '#64748b' }}>
              💳 Payment: {booking.payment_status.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* ── OTP DISPLAY FOR FARMER ── */}
      {!isIncoming && booking.otp_code && booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <div style={{ background: '#eff6ff', border: '1px border #bfdbfe', padding: '10px 14px', borderRadius: '8px', marginTop: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: '600' }}>
            🔑 Start Work OTP: <strong style={{ fontSize: '1.1rem', letterSpacing: '2px', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>{booking.otp_code}</strong>
          </span>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#3b82f6' }}>
            Share this 4-digit OTP with the provider when they arrive at your farm to start work.
          </p>
        </div>
      )}

      {/* ── OTP VERIFICATION INPUT FOR PROVIDER ── */}
      {isIncoming && booking.status !== 'completed' && booking.status !== 'cancelled' && booking.status !== 'active' && (
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '10px 14px', borderRadius: '8px', marginTop: '12px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#854d0e', marginBottom: '6px' }}>
            🔑 Enter Farmer's OTP to Start Work:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="4-digit OTP"
              maxLength="4"
              style={{ width: '120px', padding: '6px 10px', fontSize: '1rem', letterSpacing: '2px', textAlign: 'center' }}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
            />
            <button
              className="btn-small"
              style={{ background: '#16a34a', color: '#fff', padding: '6px 14px', borderRadius: '6px' }}
              onClick={handleVerifyOtp}
              disabled={verifyingOtp}
            >
              {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </div>
      )}

      {/* ── ACTIONS BAR ── */}
      <div className="booking-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
        {/* Owner Accept/Confirm Request */}
        {isIncoming && booking.status === 'pending' && (
          <button className="btn-small" style={{ background: '#3b82f6', color: '#fff' }} onClick={() => onStatusChange(booking, 'confirmed', isService)}>
            ✓ Accept Booking
          </button>
        )}

        {/* Booker Pay into Escrow */}
        {!isIncoming && (booking.status === 'confirmed' || booking.status === 'pending') && booking.payment_status !== 'escrow' && booking.payment_status !== 'released' && (
          <button className="btn-small" style={{ background: '#16a34a', color: '#fff' }} onClick={() => onPayEscrow(booking)}>
            🛡️ Pay into Escrow
          </button>
        )}

        {/* Work In Progress / Complete buttons */}
        {(booking.status === 'active' || booking.status === 'confirmed') && (
          <button className="btn-small" style={{ background: '#059669', color: '#fff' }} onClick={handleCompleteWork}>
            ✅ Mark Work Complete & Release Payout
          </button>
        )}

        {/* Rate & Review Provider on Completed */}
        {!isIncoming && booking.status === 'completed' && (
          <button className="btn-small" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => onOpenReview(booking)}>
            ⭐ Rate & Review Provider
          </button>
        )}

        {/* Cancel */}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <button className="btn-small" style={{ background: '#dc2626', color: '#fff' }} onClick={() => onStatusChange(booking, 'cancelled', isService)}>
            Cancel
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
        {loading && <div className="listings-empty">{t('common.loading', 'Loading bookings...')}</div>}

        {!loading && tab === 'bookings-outgoing' && (
          outgoing.length ? outgoing.map((b) => (
            <BookingItem
              key={b.id}
              booking={b}
              isService={!!b.kind}
              isIncoming={false}
              onStatusChange={() => load()}
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
              onStatusChange={() => load()}
              onPayEscrow={(item) => setPayBooking(item)}
              onOpenReview={(item) => setReviewBooking(item)}
              t={t}
            />
          )) : <div className="listings-empty">{t('booking.noIncoming', 'No incoming requests for your listings or services.')}</div>
        )}
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
