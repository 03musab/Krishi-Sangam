import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getAdminStats, getPendingListings, approveListing, getAdminUsers, deleteUser } from '../lib/api';

const TAB_KEYS = {
  'admin-analytics': 'admin.tabAnalytics',
  'admin-pending': 'admin.tabPending',
  'admin-users': 'admin.tabUsers'
};

function StatBox({ icon, value, label, cls }) {
  return (
    <div className="admin-stat-box">
      <span className="admin-stat-icon">{icon}</span>
      <span className="admin-stat-bigval">{value}</span>
      <span className="admin-stat-desc">{label}</span>
    </div>
  );
}

export default function Admin() {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [tab, setTab] = useState('admin-analytics');
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState({ land: [], equipment: [], labour: [], produce: [] });
  const [users, setUsers] = useState([]);

  const loadStats = () => getAdminStats().then((d) => setStats(d.stats)).catch(() => {});
  const loadPending = () => getPendingListings().then((d) => setPending(d)).catch(() => {});
  const loadUsers = () => getAdminUsers().then((d) => setUsers(d.users)).catch(() => {});

  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    if (tab === 'admin-pending') loadPending();
    if (tab === 'admin-users') loadUsers();
  }, [tab]);

  const handleApprove = async (type, id, status) => {
    try {
      await approveListing(type, id, status);
      showToast(t('admin.listingStatus', { status }));
      loadPending();
      loadStats();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm(t('admin.deleteUser'))) return;
    try {
      await deleteUser(id);
      showToast(t('common.toast.deleted'));
      loadUsers();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const pendingGroups = [
    { key: 'land', labelKey: 'admin.land' },
    { key: 'equipment', labelKey: 'admin.equipment' },
    { key: 'labour', labelKey: 'admin.labour' },
    { key: 'produce', labelKey: 'admin.produce' }
  ];

  const totalListings = stats ? (stats.totalLand || 0) + (stats.totalEquipment || 0) + (stats.totalLabour || 0) + (stats.totalProduce || 0) : 0;

  return (
    <>
      <PageBanner title={`🛡️ ${t('admin.title')}`} color="slate" backTo="home" />
      <div className="admin-card-container">
        <div className="admin-subnav-tabs">
          {Object.entries(TAB_KEYS).map(([key, labelKey]) => (
            <button key={key} className={`admin-tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{t(labelKey)}</button>
          ))}
        </div>

        {tab === 'admin-analytics' && (
          <div className="tab-pane">
            <div className="admin-grid-4stats">
              <StatBox icon="👥" value={stats ? stats.totalUsers : 0} label={t('admin.users')} />
              <StatBox icon="📋" value={totalListings} label={t('admin.totalListings')} />
              <StatBox icon="💰" value={stats ? `₹${(stats.totalRevenue || 0).toLocaleString()}` : '₹0'} label={t('admin.revenue')} />
              <StatBox icon="📦" value={stats ? stats.totalBookings : 0} label={t('admin.bookings')} />
            </div>
            <div className="admin-pending-alert">
              <div className="pending-alert-title">⚠️ {t('admin.pendingReview')}</div>
              <div className="pending-alert-list">
                <div>{t('admin.land')}: <strong>{stats ? stats.pendingLand : 0}</strong></div>
                <div>{t('admin.equipment')}: <strong>{stats ? stats.pendingEquip : 0}</strong></div>
                <div>{t('admin.labour')}: <strong>{stats ? stats.pendingLabour : 0}</strong></div>
                <div>{t('admin.produce')}: <strong>{stats ? stats.pendingProduce : 0}</strong></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'admin-pending' && (
          <div className="tab-pane">
            {pendingGroups.map((g) => {
              const items = pending[g.key] || [];
              if (!items.length) return null;
              return (
                <div key={g.key}>
                  <h3 className="pending-group-title">{t(g.labelKey)} ({items.length})</h3>
                  {items.map((i) => {
                    const nm = i.title || i.name || i.crop_name || i.worker_name;
                    const loc = i.location || '';
                    return (
                      <div key={i.id} className="pending-item">
                        <div>
                          <strong>{nm}</strong>
                          <br />
                          <span className="muted">{loc}</span>
                        </div>
                        <div className="pending-actions">
                          <button className="btn-small" style={{ background: '#16a34a' }} onClick={() => handleApprove(g.key, i.id, 'approved')}>{t('admin.approve')}</button>
                          <button className="btn-small" style={{ background: '#dc2626' }} onClick={() => handleApprove(g.key, i.id, 'rejected')}>{t('admin.reject')}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {!pendingGroups.some((g) => (pending[g.key] || []).length) && (
              <div className="listings-empty">{t('admin.noPending')}</div>
            )}
          </div>
        )}

        {tab === 'admin-users' && (
          <div className="tab-pane">
            {users.map((u) => (
              <div key={u.id} className="pending-item">
                <div>
                  <strong>{u.username}</strong>
                  <br />
                  <span className="muted">{u.email} • {u.role}</span>
                </div>
                <button className="btn-small" style={{ background: '#dc2626' }} onClick={() => handleDeleteUser(u.id)}>{t('admin.delete')}</button>
              </div>
            ))}
            {!users.length && <div className="listings-empty">{t('admin.noUsers')}</div>}
          </div>
        )}
      </div>
    </>
  );
}
