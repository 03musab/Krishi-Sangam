import { useEffect, useRef, useState } from 'react';
import PageBanner from '../components/PageBanner';
import Icon from '../components/Icon';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  getAdminStats, getPendingListings, approveListing, getAdminListings, deleteAdminListing,
  getAdminUsers, updateUserRole, deleteUser, getAdminHelpConversations, getThread, sendMessage,
  getAdminReviews, deleteAdminReview
} from '../lib/api';

const TAB_KEYS = {
  'admin-analytics': 'admin.tabAnalytics',
  'admin-pending': 'admin.tabPending',
  'admin-manage': 'admin.tabManage',
  'admin-users': 'admin.tabUsers',
  'admin-reviews': 'admin.tabReviews',
  'admin-help': 'admin.tabHelp'
};

const TYPE_KEYS = { land: 'admin.land', equipment: 'admin.equipment', labour: 'admin.labour', produce: 'admin.produce' };

const STATUS_FILTERS = [
  { value: '', labelKey: 'admin.statusAll' },
  { value: 'pending', labelKey: 'admin.statusPending' },
  { value: 'approved', labelKey: 'admin.statusApproved' },
  { value: 'rejected', labelKey: 'admin.statusRejected' }
];

const ROLES = ['farmer', 'owner', 'labourer', 'admin'];

function StatBox({ icon, value, label, cls }) {
  return (
    <div className="admin-stat-box">
      <span className="admin-stat-icon"><Icon name={icon} size={24} /></span>
      <span className="admin-stat-bigval">{value}</span>
      <span className="admin-stat-desc">{label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const { t } = useLanguage();
  const color = status === 'approved' ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#d97706';
  const bg = status === 'approved' ? '#dcfce7' : status === 'rejected' ? '#fee2e2' : '#fef3c7';
  return (
    <span className="status-badge" style={{ background: bg, color }}>
      {status ? t(`admin.status${status[0].toUpperCase()}${status.slice(1)}`) : '—'}
    </span>
  );
}

export default function Admin() {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { user: me } = useAuth();
  const [tab, setTab] = useState('admin-analytics');
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState({ land: [], equipment: [], labour: [], produce: [] });
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Manage-listings tab state
  const [manageType, setManageType] = useState('land');
  const [manageStatus, setManageStatus] = useState('');
  const [manage, setManage] = useState({ land: [], equipment: [], labour: [], produce: [] });
  const [manageLoading, setManageLoading] = useState(false);

  // Help Requests tab state
  const [helpConvos, setHelpConvos] = useState([]);
  const [helpLoading, setHelpLoading] = useState(false);
  const [activeHelp, setActiveHelp] = useState(null);
  const [helpThread, setHelpThread] = useState([]);
  const [helpMsg, setHelpMsg] = useState('');
  const [helpSending, setHelpSending] = useState(false);
  const helpThreadRef = useRef(null);

  const loadStats = () => getAdminStats().then((d) => setStats(d.stats)).catch(() => {});
  const loadPending = () => getPendingListings().then((d) => setPending(d)).catch(() => {});
  const loadUsers = () => getAdminUsers().then((d) => setUsers(d.users)).catch(() => {});
  const loadReviews = () => {
    setReviewsLoading(true);
    getAdminReviews()
      .then((d) => setReviews(d.reviews || []))
      .catch((err) => showToast(t('common.error', { msg: err.message })))
      .finally(() => setReviewsLoading(false));
  };
  const loadHelp = () => {
    setHelpLoading(true);
    getAdminHelpConversations()
      .then((d) => setHelpConvos(d.conversations || []))
      .catch(() => {})
      .finally(() => setHelpLoading(false));
  };
  const openHelp = async (otherUser) => {
    setActiveHelp(otherUser);
    try {
      const d = await getThread(otherUser.id);
      setHelpThread(d.messages || []);
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };
  const sendHelpReply = async () => {
    const text = helpMsg.trim();
    if (!text || !activeHelp || helpSending) return;
    setHelpSending(true);
    try {
      await sendMessage({ receiver_id: activeHelp.id, content: text });
      setHelpMsg('');
      const d = await getThread(activeHelp.id);
      setHelpThread(d.messages || []);
      loadHelp();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setHelpSending(false);
    }
  };
  const loadManage = () => {
    setManageLoading(true);
    getAdminListings(manageType, manageStatus)
      .then((d) => setManage(d))
      .catch(() => {})
      .finally(() => setManageLoading(false));
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    if (tab === 'admin-pending') loadPending();
    if (tab === 'admin-manage') loadManage();
    if (tab === 'admin-users') loadUsers();
    if (tab === 'admin-reviews') loadReviews();
    if (tab === 'admin-help') loadHelp();
  }, [tab]);

  // Keep an open help thread fresh so new user messages appear automatically
  useEffect(() => {
    if (tab !== 'admin-help' || !activeHelp) return;
    const iv = setInterval(() => {
      getThread(activeHelp.id)
        .then((d) => setHelpThread(d.messages || []))
        .catch(() => {});
      getAdminHelpConversations()
        .then((d) => setHelpConvos(d.conversations || []))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(iv);
  }, [tab, activeHelp]);

  useEffect(() => {
    if (helpThreadRef.current) helpThreadRef.current.scrollTop = helpThreadRef.current.scrollHeight;
  }, [helpThread]);

  // Reload the manage list whenever its type/status filters change
  useEffect(() => {
    if (tab === 'admin-manage') loadManage();
  }, [manageType, manageStatus]);

  const handleApprove = async (type, id, status) => {
    try {
      await approveListing(type, id, status);
      showToast(t('admin.listingStatus', { status }));
      loadPending();
      loadStats();
      if (tab === 'admin-manage') loadManage();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleDeleteListing = async (type, id) => {
    if (!window.confirm(t('admin.deleteListing'))) return;
    try {
      await deleteAdminListing(type, id);
      showToast(t('common.toast.deleted'));
      loadManage();
      loadStats();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteAdminReview(id);
      showToast(t('common.toast.deleted'));
      loadReviews();
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

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);
      showToast(t('admin.roleUpdated', { role }));
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

  const manageItems = manage[manageType] || [];

  return (
    <>
      <PageBanner title={<><Icon name="shield" size={26} style={{ verticalAlign: '-6px', marginRight: '10px' }} />{t('admin.title')}</>} color="slate" backTo="home" />
      <div className="admin-card-container">
        <div className="admin-subnav-tabs">
          {Object.entries(TAB_KEYS).map(([key, labelKey]) => (
            <button key={key} className={`admin-tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{t(labelKey)}</button>
          ))}
        </div>

        {tab === 'admin-analytics' && (
          <div className="tab-pane">
            <div className="admin-grid-4stats">
              <StatBox icon="users" value={stats ? stats.totalUsers : 0} label={t('admin.users')} />
              <StatBox icon="clipboard" value={totalListings} label={t('admin.totalListings')} />
              <StatBox icon="money" value={stats ? `₹${(stats.totalRevenue || 0).toLocaleString()}` : '₹0'} label={t('admin.revenue')} />
              <StatBox icon="package" value={stats ? stats.totalBookings : 0} label={t('admin.bookings')} />
            </div>
            <div className="admin-pending-alert">
              <div className="pending-alert-title"><Icon name="alert" size={16} style={{ verticalAlign: '-3px', marginRight: '7px' }} />{t('admin.pendingReview')}</div>
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
                    const rawNm = i.title || i.name || i.crop_name || i.worker_name;
                    const nm = t(`seed.${rawNm}`, rawNm);
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

        {tab === 'admin-manage' && (
          <div className="tab-pane">
            <div className="manage-filters">
              <div className="admin-subnav-tabs" style={{ margin: 0 }}>
                {Object.entries(TYPE_KEYS).map(([key, labelKey]) => (
                  <button
                    key={key}
                    className={`admin-tab-btn ${manageType === key ? 'active' : ''}`}
                    onClick={() => { setManageType(key); }}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
              <div className="manage-status-filters">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value || 'all'}
                    className={`status-filter-btn ${manageStatus === f.value ? 'active' : ''}`}
                    onClick={() => { setManageStatus(f.value); }}
                  >
                    {t(f.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {manageLoading && <SkeletonLoader type="row" count={4} />}
            {!manageLoading && !manageItems.length && <div className="listings-empty">{t('admin.noListings')}</div>}
            {!manageLoading && manageItems.map((i) => {
              const rawNm = i.title || i.name || i.crop_name || i.worker_name;
              const nm = t(`seed.${rawNm}`, rawNm);
              const owner = i.owner_name || i.worker_name || i.seller_name;
              const loc = i.location || '';
              return (
                <div key={i.id} className="pending-item">
                  <div>
                    <strong>{nm}</strong>
                    <br />
                    <span className="muted">{loc}{owner ? ` • ${t('admin.postedBy')} ${owner}` : ''}</span>
                  </div>
                  <div className="pending-actions">
                    <StatusBadge status={i.status} />
                    {i.status === 'pending' && (
                      <>
                        <button className="btn-small" style={{ background: '#16a34a' }} onClick={() => handleApprove(manageType, i.id, 'approved')}>{t('admin.approve')}</button>
                        <button className="btn-small" style={{ background: '#dc2626' }} onClick={() => handleApprove(manageType, i.id, 'rejected')}>{t('admin.reject')}</button>
                      </>
                    )}
                    <button className="btn-small btn-small-outline" onClick={() => handleDeleteListing(manageType, i.id)}>{t('admin.delete')}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'admin-help' && (
          <div className="tab-pane" style={{ padding: 0 }}>
            <div className="messages-layout" style={{ margin: '0 auto' }}>
              {/* Help requests list */}
              <div className="conversations-list">
                {helpLoading && <SkeletonLoader type="row" count={3} />}
                {!helpLoading && helpConvos.length === 0 && (
                  <div className="listings-empty">{t('admin.noHelp')}</div>
                )}
                {helpConvos.map((cv) => (
                  <div
                    key={cv.other_user_id}
                    className={`conversation-item ${activeHelp && activeHelp.id === cv.other_user_id ? 'active' : ''}`}
                    onClick={() => openHelp({ id: cv.other_user_id, username: cv.other_username })}
                  >
                    <div className="conversation-main">
                      <strong>{cv.other_username}</strong>
                      <span className="muted">{cv.last_message || t('admin.noMessagesYet')}</span>
                    </div>
                    {cv.unread_count > 0 && <span className="unread-badge">{cv.unread_count}</span>}
                  </div>
                ))}
              </div>

              {/* Thread */}
              <div className="message-thread">
                <div className="thread-header">
                  {activeHelp ? activeHelp.username : t('admin.selectHelp')}
                </div>
                <div className="thread-messages" ref={helpThreadRef}>
                  {activeHelp && helpThread.length === 0 && <div className="listings-empty">{t('msg.noMessages')}</div>}
                  {helpThread.map((m) => {
                    const isMe = m.sender_id === me?.id;
                    return (
                      <div key={m.id} className={`message-row ${isMe ? 'me' : 'them'}`}>
                        <div className="message-bubble">
                          {m.image_url && (
                            <img className="message-image" src={m.image_url} alt="" loading="lazy" />
                          )}
                          {m.content && <span className="message-bubble-text">{m.content}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {activeHelp && (
                  <div className="thread-input">
                    <input
                      type="text"
                      placeholder={t('msg.typeMessage')}
                      value={helpMsg}
                      onChange={(e) => setHelpMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendHelpReply()}
                      disabled={helpSending}
                    />
                    <button onClick={sendHelpReply} disabled={helpSending || !helpMsg.trim()}>
                      {helpSending ? <span className="btn-spinner btn-spinner-sm" aria-hidden="true" /> : t('msg.send')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'admin-users' && (
          <div className="tab-pane">
            {users.map((u) => (
              <div key={u.id} className="pending-item">
                <div>
                  <strong>{u.username}</strong>
                  <br />
                  <span className="muted">{u.email} • <span className="role-badge">{u.role}</span></span>
                </div>
                <div className="pending-actions">
                  <select
                    className="admin-role-select"
                    value={u.role}
                    disabled={me && me.id === u.id}
                    title={t('admin.roleChange')}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button
                    className="btn-small"
                    style={{ background: '#dc2626' }}
                    disabled={me && me.id === u.id}
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    {t('admin.delete')}
                  </button>
                </div>
              </div>
            ))}
            {!users.length && <div className="listings-empty">{t('admin.noUsers')}</div>}
          </div>
        )}

        {tab === 'admin-reviews' && (
          <div className="tab-pane">
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>Ratings & User Reviews</h2>
              <span className="tag-pill tag-green" style={{ fontSize: '0.85rem' }}>Total Reviews: {reviews.length}</span>
            </div>
            {reviewsLoading ? (
              <SkeletonLoader type="row" count={4} />
            ) : reviews.length === 0 ? (
              <div className="listings-empty">No reviews submitted yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} className="booking-card" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                            {rev.reviewer_name || 'Anonymous User'}
                          </span>
                          {rev.reviewer_phone && (
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({rev.reviewer_phone})</span>
                          )}
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>➔</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                            For: {rev.reviewee_name || 'Provider'} ({rev.reviewee_role || 'owner'})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '6px 0' }}>
                          <span style={{ color: '#eab308', fontSize: '1.1rem', fontWeight: 700 }}>
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </span>
                          <strong style={{ fontSize: '0.9rem', color: '#334155' }}>{rev.rating} / 5 Stars</strong>
                        </div>
                        {rev.comment && (
                          <p style={{ margin: '6px 0 0 0', color: '#475569', fontSize: '0.92rem', fontStyle: 'italic', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            "{rev.comment}"
                          </p>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
                          Submitted on: {new Date(rev.created_at).toLocaleString()}
                        </div>
                      </div>
                      <button
                        className="btn-small"
                        style={{ background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => handleDeleteReview(rev.id)}
                      >
                        Delete Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
