import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import { useToast } from '../context/ToastContext';
import { getMyBookings, getIncomingBookings, updateBooking } from '../lib/api';

const STATUS_COLORS = {
  pending: '#eab308',
  confirmed: '#3b82f6',
  active: '#16a34a',
  completed: '#6b7280',
  cancelled: '#dc2626'
};

function BookingItem({ booking, onRefresh }) {
  const { showToast } = useToast();
  const title = booking.listing_title || booking.listing_type;

  const updateStatus = async (status) => {
    try {
      await updateBooking(booking.id, { status });
      showToast('Updated!');
      onRefresh();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-card-top">
        <div>
          <strong>{title}</strong>
          <br />
          <span className="muted">{booking.listing_type} • ₹{booking.total_price.toLocaleString()}</span>
        </div>
        <span className="booking-status" style={{ color: STATUS_COLORS[booking.status] || '#6b7280' }}>
          {(booking.status || '').toUpperCase()}
        </span>
      </div>
      <div className="booking-actions">
        {booking.status === 'pending' && (
          <button className="btn-small" style={{ background: '#3b82f6' }} onClick={() => updateStatus('confirmed')}>Confirm</button>
        )}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <button className="btn-small" style={{ background: '#dc2626' }} onClick={() => updateStatus('cancelled')}>Cancel</button>
        )}
      </div>
    </div>
  );
}

export default function Bookings() {
  const [tab, setTab] = useState('bookings-outgoing');
  const [outgoing, setOutgoing] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <PageBanner title="My Bookings" color="blue" />
      <div className="admin-subnav-tabs">
        <button className={`admin-tab-btn ${tab === 'bookings-outgoing' ? 'active' : ''}`} onClick={() => setTab('bookings-outgoing')}>My Bookings</button>
        <button className={`admin-tab-btn ${tab === 'bookings-incoming' ? 'active' : ''}`} onClick={() => setTab('bookings-incoming')}>Incoming</button>
      </div>
      <div className="tab-pane">
        {loading && <div className="listings-empty">Loading...</div>}
        {!loading && tab === 'bookings-outgoing' && (outgoing.length ? outgoing.map((b) => (
          <BookingItem key={b.id} booking={b} onRefresh={load} />
        )) : <div className="listings-empty">No bookings yet.</div>)}
        {!loading && tab === 'bookings-incoming' && (incoming.length ? incoming.map((b) => (
          <BookingItem key={b.id} booking={b} onRefresh={load} />
        )) : <div className="listings-empty">No incoming bookings.</div>)}
      </div>
    </>
  );
}
