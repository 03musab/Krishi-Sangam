import { useState, useEffect } from 'react';
import { getMyAvailability, toggleAvailability } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function AvailabilityCalendar() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('unavailable');

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const res = await getMyAvailability();
      setAvailability(res.availability || []);
    } catch (err) {
      console.error('Failed to load availability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const handleToggle = async (dateStr, targetStatus, dateNote = '') => {
    try {
      const res = await toggleAvailability({
        date: dateStr,
        status: targetStatus,
        note: dateNote
      });
      setAvailability(res.availability || []);
      showToast(t('avail.updatedToast', 'Date availability updated!'));
      setSelectedDate('');
      setNote('');
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  // Generate next 30 days
  const today = new Date();
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const rec = availability.find((a) => a.date === iso);
    days.push({
      date: iso,
      dayNum: d.getDate(),
      month: d.toLocaleString('default', { month: 'short' }),
      weekday: d.toLocaleString('default', { weekday: 'short' }),
      isUnavailable: rec && rec.status === 'unavailable',
      note: rec?.note || ''
    });
  }

  return (
    <div className="availability-calendar-card" style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>📅 {t('avail.title', 'Provider Availability Calendar')}</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            {t('avail.subtitle', 'Click any date to mark it as Blocked/Unavailable for bookings')}
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>{t('common.loading', 'Loading calendar...')}</p>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {days.map((item) => (
              <button
                key={item.date}
                type="button"
                onClick={() => {
                  const newStatus = item.isUnavailable ? 'available' : 'unavailable';
                  handleToggle(item.date, newStatus);
                }}
                style={{
                  padding: '10px 4px',
                  borderRadius: '8px',
                  border: item.isUnavailable ? '1px solid #fca5a5' : '1px solid #bbf7d0',
                  background: item.isUnavailable ? '#fef2f2' : '#f0fdf4',
                  color: item.isUnavailable ? '#991b1b' : '#166534',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
                title={item.isUnavailable ? `Blocked (${item.note || 'No note'})` : 'Available'}
              >
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.8 }}>{item.weekday}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', margin: '2px 0' }}>{item.dayNum}</div>
                <div style={{ fontSize: '0.65rem' }}>{item.month}</div>
                <div style={{ fontSize: '0.7rem', marginTop: '2px', fontWeight: '600' }}>
                  {item.isUnavailable ? '🔴 Blocked' : '🟢 Free'}
                </div>
              </button>
            ))}
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#334155' }}>
              ➕ {t('avail.blockSpecificDate', 'Block / Update Specific Date')}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
              <div>
                <label className="form-label">{t('avail.date', 'Date')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">{t('avail.status', 'Status')}</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="unavailable">🔴 Blocked / Unavailable</option>
                  <option value="available">🟢 Available</option>
                </select>
              </div>
              <div>
                <label className="form-label">{t('avail.note', 'Reason / Note')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maintenance"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn-small"
                style={{ background: '#2563eb', padding: '10px 16px', borderRadius: '6px' }}
                onClick={() => {
                  if (selectedDate) handleToggle(selectedDate, status, note);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
