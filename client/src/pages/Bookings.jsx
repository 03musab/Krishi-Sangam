import { startTransition, useOptimistic, useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getMyBookings, getIncomingBookings, updateBooking } from '../lib/api';

const STATUS_COLORS = {
  pending: '#eab308',
  confirmed: '#3b82f6',
  active: '#16a34a',
  completed: '#6b7280',
  cancelled: '#dc2626'
};

const STATUS_KEYS = {
  pending: 'booking.pending',
  confirmed: 'booking.confirmed',
  active: 'booking.active',
  completed: 'booking.completed',
  cancelled: 'booking.cancelled'
};

function BookingItem({ booking, onStatusChange }) {
  const { t } = useLanguage();
  const title = booking.listing_title || booking.listing_type;

  return (
    <div className="booking-card">
      <div className="booking-card-top">
        <div>
          <strong>{title}</strong>
          <br />
          <span className="muted">{booking.listing_type} • ₹{booking.total_price.toLocaleString()}</span>
        </div>
        <span className="booking-status" style={{ color: STATUS_COLORS[booking.status] || '#6b7280' }}>
          {t(STATUS_KEYS[booking.status] || booking.status || '').toUpperCase()}
        </span>
      </div>
      <div className="booking-actions">
        {booking.status === 'pending' && (
          <button className="btn-small" style={{ background: '#3b82f6' }} onClick={() => onStatusChange(booking, 'confirmed')}>{t('booking.confirm')}</button>
        )}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <button className="btn-small" style={{ background: '#dc2626' }} onClick={() => onStatusChange(booking, 'cancelled')}>{t('booking.cancel')}</button>
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

  // Optimistic lists — status changes apply instantly, then sync with the server
  const [optimisticOutgoing, setOptimisticOutgoing] = useOptimistic(outgoing, (current, { id, status }) =>
    current.map((b) => (b.id === id ? { ...b, status } : b))
  );
  const [optimisticIncoming, setOptimisticIncoming] = useOptimistic(incoming, (current, { id, status }) =>
    current.map((b) => (b.id === id ? { ...b, status } : b))
  );

  const load = () => {
    setLoading(true);
    Promise.all([getMyBookings(), getIncomingBookings()])
      .then(([my, inc]) => {
        setOutgoing(my.bookings);
        setIncoming(inc.bookings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeStatus = (booking, status) => {
    startTransition(async () => {
      setOptimisticOutgoing({ id: booking.id, status });
      setOptimisticIncoming({ id: booking.id, status });
      try {
        await updateBooking(booking.id, { status });
        showToast(t('common.toast.updated'));
      } catch (err) {
        showToast(t('common.error', { msg: err.message }));
      } finally {
        load();
      }
    });
  };

  return (
    <>
      <PageBanner title={t('booking.title')} color="blue" />
      <div className="admin-subnav-tabs">
        <button className={`admin-tab-btn ${tab === 'bookings-outgoing' ? 'active' : ''}`} onClick={() => setTab('bookings-outgoing')}>{t('booking.tabMy')}</button>
        <button className={`admin-tab-btn ${tab === 'bookings-incoming' ? 'active' : ''}`} onClick={() => setTab('bookings-incoming')}>{t('booking.tabIncoming')}</button>
      </div>
      <div className="tab-pane">
        {loading && <div className="listings-empty">{t('common.loading')}</div>}
        {!loading && tab === 'bookings-outgoing' && (optimisticOutgoing.length ? optimisticOutgoing.map((b) => (
          <BookingItem key={b.id} booking={b} onStatusChange={changeStatus} />
        )) : <div className="listings-empty">{t('booking.noBookings')}</div>)}
        {!loading && tab === 'bookings-incoming' && (optimisticIncoming.length ? optimisticIncoming.map((b) => (
          <BookingItem key={b.id} booking={b} onStatusChange={changeStatus} />
        )) : <div className="listings-empty">{t('booking.noIncoming')}</div>)}
      </div>
    </>
  );
}
