import { useEffect, useRef, useState } from 'react';
import PageBanner from '../components/PageBanner';
import Icon from '../components/Icon';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import {
  getAdminStats, getPendingListings, approveListing, getAdminListings, deleteAdminListing,
  getAdminUsers, updateUserRole, deleteUser, getAdminHelpConversations, getThread, sendMessage,
  getAdminReviews, deleteAdminReview,
  getCatalogEquipment, getCatalogServices, createCatalogEquipment, updateCatalogEquipment,
  deleteCatalogEquipment, createCatalogService, updateCatalogService, deleteCatalogService,
  seedCatalogDefaults
} from '../lib/api';

const TAB_KEYS = {
  'admin-analytics': 'admin.tabAnalytics',
  'admin-pending': 'admin.tabPending',
  'admin-manage': 'admin.tabManage',
  'admin-catalog': 'admin.tabCatalog',
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
  const { view } = useNav();
  const [tab, setTab] = useState(() => (view === 'admin-catalog' ? 'admin-catalog' : 'admin-analytics'));

  useEffect(() => {
    if (view === 'admin-catalog') {
      setTab('admin-catalog');
    }
  }, [view]);

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

  // Catalog tab state (Equipments, Services & Regional Dialect Names)
  const [catalogSubTab, setCatalogSubTab] = useState('equipment'); // 'equipment' | 'services'
  const [catalogEquip, setCatalogEquip] = useState([]);
  const [catalogServices, setCatalogServices] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogRegionFilter, setCatalogRegionFilter] = useState('All');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('All');

  // Modals for Equipment & Services
  const [equipModalOpen, setEquipModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState(null);
  const [editingService, setEditingService] = useState(null);

  const defaultEquipForm = {
    name: '',
    category: 'Tractor & Tillage',
    regional_names: '',
    region: 'All Regions',
    default_rate: '1500',
    icon: 'wrench',
    description: '',
    is_active: 1
  };
  const [equipForm, setEquipForm] = useState(defaultEquipForm);

  const defaultServiceForm = {
    service_name: '',
    category: 'Land Preparation & Tilling',
    regional_names: '',
    region: 'All Regions',
    pricing_type: 'per_acre',
    description: '',
    is_active: 1
  };
  const [serviceForm, setServiceForm] = useState(defaultServiceForm);

  const loadCatalog = async () => {
    setCatalogLoading(true);
    try {
      const [eqRes, svRes] = await Promise.all([
        getCatalogEquipment('all=true'),
        getCatalogServices('all=true')
      ]);
      setCatalogEquip(eqRes.equipment || []);
      setCatalogServices(svRes.services || []);
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleOpenAddEquip = () => {
    setEditingEquip(null);
    setEquipForm(defaultEquipForm);
    setEquipModalOpen(true);
  };

  const handleOpenEditEquip = (item) => {
    setEditingEquip(item);
    setEquipForm({
      name: item.name || '',
      category: item.category || 'Tractor & Tillage',
      regional_names: item.regional_names || '',
      region: item.region || 'All Regions',
      default_rate: String(item.default_rate || '1500'),
      icon: item.icon || 'wrench',
      description: item.description || '',
      is_active: item.is_active !== undefined ? item.is_active : 1
    });
    setEquipModalOpen(true);
  };

  const handleSaveEquip = async (e) => {
    e.preventDefault();
    if (!equipForm.name.trim() || !equipForm.category.trim()) {
      showToast('Equipment name and category are required.');
      return;
    }
    try {
      const payload = {
        name: equipForm.name.trim(),
        category: equipForm.category.trim(),
        regional_names: equipForm.regional_names.trim(),
        region: equipForm.region.trim() || 'All Regions',
        default_rate: Number(equipForm.default_rate) || 1500,
        icon: equipForm.icon || 'wrench',
        description: equipForm.description.trim(),
        is_active: equipForm.is_active
      };
      if (editingEquip) {
        await updateCatalogEquipment(editingEquip.id, payload);
        showToast('Equipment updated successfully!');
      } else {
        await createCatalogEquipment(payload);
        showToast('New equipment added to catalog!');
      }
      setEquipModalOpen(false);
      loadCatalog();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleDeleteEquip = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete equipment "${name}" from the catalog?`)) return;
    try {
      await deleteCatalogEquipment(id);
      showToast('Equipment deleted from catalog.');
      loadCatalog();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleToggleEquipStatus = async (item) => {
    try {
      const newStatus = item.is_active === 1 ? 0 : 1;
      await updateCatalogEquipment(item.id, { is_active: newStatus });
      showToast(newStatus === 1 ? 'Equipment activated.' : 'Equipment disabled.');
      loadCatalog();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceForm(defaultServiceForm);
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (item) => {
    setEditingService(item);
    setServiceForm({
      service_name: item.service_name || '',
      category: item.category || 'Land Preparation & Tilling',
      regional_names: item.regional_names || '',
      region: item.region || 'All Regions',
      pricing_type: item.pricing_type || 'per_acre',
      description: item.description || '',
      is_active: item.is_active !== undefined ? item.is_active : 1
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.service_name.trim() || !serviceForm.category.trim()) {
      showToast('Service name and category are required.');
      return;
    }
    try {
      const payload = {
        service_name: serviceForm.service_name.trim(),
        category: serviceForm.category.trim(),
        regional_names: serviceForm.regional_names.trim(),
        region: serviceForm.region.trim() || 'All Regions',
        pricing_type: serviceForm.pricing_type || 'per_acre',
        description: serviceForm.description.trim(),
        is_active: serviceForm.is_active
      };
      if (editingService) {
        await updateCatalogService(editingService.id, payload);
        showToast('Agricultural service updated!');
      } else {
        await createCatalogService(payload);
        showToast('New agricultural service added!');
      }
      setServiceModalOpen(false);
      loadCatalog();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service "${name}" from the catalog?`)) return;
    try {
      await deleteCatalogService(id);
      showToast('Service deleted from catalog.');
      loadCatalog();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleToggleServiceStatus = async (item) => {
    try {
      const newStatus = item.is_active === 1 ? 0 : 1;
      await updateCatalogService(item.id, { is_active: newStatus });
      showToast(newStatus === 1 ? 'Service activated.' : 'Service disabled.');
      loadCatalog();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  const handleSyncDefaults = async () => {
    if (!window.confirm('Sync and restore default equipments and services catalog items?')) return;
    try {
      const res = await seedCatalogDefaults();
      showToast(res.message || 'Catalog synced successfully!');
      loadCatalog();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

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
    if (tab === 'admin-catalog') loadCatalog();
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

  const filteredEquip = catalogEquip.filter((e) => {
    if (catalogRegionFilter !== 'All' && !e.region?.toLowerCase().includes(catalogRegionFilter.toLowerCase()) && !e.region?.toLowerCase().includes('all')) return false;
    if (catalogCategoryFilter !== 'All' && e.category !== catalogCategoryFilter) return false;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      const matchName = e.name?.toLowerCase().includes(q);
      const matchAlias = e.regional_names?.toLowerCase().includes(q);
      const matchCat = e.category?.toLowerCase().includes(q);
      const matchDesc = e.description?.toLowerCase().includes(q);
      if (!matchName && !matchAlias && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  const filteredServices = catalogServices.filter((s) => {
    if (catalogRegionFilter !== 'All' && !s.region?.toLowerCase().includes(catalogRegionFilter.toLowerCase()) && !s.region?.toLowerCase().includes('all')) return false;
    if (catalogCategoryFilter !== 'All' && s.category !== catalogCategoryFilter) return false;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      const matchName = s.service_name?.toLowerCase().includes(q);
      const matchAlias = s.regional_names?.toLowerCase().includes(q);
      const matchCat = s.category?.toLowerCase().includes(q);
      const matchDesc = s.description?.toLowerCase().includes(q);
      if (!matchName && !matchAlias && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  return (
    <>
      <PageBanner title={<><Icon name="shield" size={26} style={{ verticalAlign: '-6px', marginRight: '10px' }} />{t('admin.title')}</>} color="slate" backTo="home" />
      <div className="admin-card-container">
        <div className="admin-subnav-tabs">
          {Object.entries(TAB_KEYS).map(([key, labelKey]) => (
            <button
              key={key}
              id={`tab-btn-${key}`}
              className={`admin-tab-btn ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {t(labelKey)}
            </button>
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

        {tab === 'admin-catalog' && (
          <div className="tab-pane">
            {/* Header section with description and action buttons */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon name="wrench" size={20} /> Equipments & Services Regional Catalog
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b', maxWidth: '780px' }}>
                    Add new equipment & agricultural services on demand and customize <strong>regional dialect names</strong> (e.g. within 20km distance: <em>Seed Drill / पाभर / Pabhara / पेरणी यंत्र / तिफण</em>, <em>Rotavator / रोटाव्हेटर / Churner</em>, <em>Plough / नांगर / नागर / Hal</em>).
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-small"
                    style={{ background: 'var(--green-mid)', color: 'white', fontWeight: 600, padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={catalogSubTab === 'equipment' ? handleOpenAddEquip : handleOpenAddService}
                  >
                    <Icon name="plus" size={16} /> {catalogSubTab === 'equipment' ? 'Add Equipment' : 'Add Agricultural Service'}
                  </button>
                  <button
                    type="button"
                    className="btn-small btn-small-outline"
                    style={{ padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={handleSyncDefaults}
                    title="Sync with standard defaults"
                  >
                    <Icon name="refresh" size={16} /> Sync Standards
                  </button>
                </div>
              </div>

              {/* Quick Summary Pill Counters */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <span className="tag-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="tractor" size={15} /> {catalogEquip.length} Equipment Types
                </span>
                <span className="tag-pill" style={{ background: '#f0fdf4', color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="wheat" size={15} /> {catalogServices.length} Agricultural Services
                </span>
                <span className="tag-pill" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="tag" size={15} /> {catalogEquip.filter(e => e.regional_names).length + catalogServices.filter(s => s.regional_names).length} Configured with Local Dialects
                </span>
              </div>
            </div>

            {/* Sub-navigation tabs: Equipments vs Agricultural Services */}
            <div className="admin-subnav-tabs" style={{ margin: '0 0 16px 0', padding: 0 }}>
              <button
                type="button"
                className={`admin-tab-btn ${catalogSubTab === 'equipment' ? 'active' : ''}`}
                onClick={() => { setCatalogSubTab('equipment'); setCatalogCategoryFilter('All'); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Icon name="tractor" size={16} /> Agricultural Equipments ({catalogEquip.length})
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${catalogSubTab === 'services' ? 'active' : ''}`}
                onClick={() => { setCatalogSubTab('services'); setCatalogCategoryFilter('All'); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Icon name="wheat" size={16} /> Agricultural Services ({catalogServices.length})
              </button>
            </div>

            {/* Search and Filters Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                className="form-input"
                placeholder={catalogSubTab === 'equipment' ? 'Search equipment (e.g. Seed Drill, पाभर, Rotavator)...' : 'Search services (e.g. Drone, भात लावणी, Leveling)...'}
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
              <select
                className="form-select"
                value={catalogCategoryFilter}
                onChange={(e) => setCatalogCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {catalogSubTab === 'equipment'
                  ? [...new Set(catalogEquip.map((e) => e.category))].filter(Boolean).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  : [...new Set(catalogServices.map((s) => s.category))].filter(Boolean).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))
                }
              </select>
              <select
                className="form-select"
                value={catalogRegionFilter}
                onChange={(e) => setCatalogRegionFilter(e.target.value)}
              >
                <option value="All">All Regions / Localities</option>
                <option value="All Regions">All Regions (Universal)</option>
                <option value="Western Maharashtra">Western Maharashtra</option>
                <option value="Nashik">Nashik Region</option>
                <option value="Pune">Pune Region</option>
                <option value="Marathwada">Marathwada</option>
                <option value="Vidarbha">Vidarbha</option>
                <option value="Konkan">Konkan & Coastal</option>
              </select>
            </div>

            {catalogLoading && <SkeletonLoader type="row" count={5} />}

            {/* ── Equipment List ── */}
            {!catalogLoading && catalogSubTab === 'equipment' && (
              <div>
                {filteredEquip.length === 0 ? (
                  <div className="listings-empty">
                    No equipment found matching criteria.{' '}
                    <button className="auth-gate-link" onClick={handleOpenAddEquip} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                      Add a new equipment now
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredEquip.map((item) => (
                      <div
                        key={item.id}
                        className="booking-card"
                        style={{
                          background: item.is_active === 1 ? '#ffffff' : '#f8fafc',
                          border: item.is_active === 1 ? '1px solid #cbd5e1' : '1px dashed #cbd5e1',
                          borderRadius: '12px',
                          padding: '16px 20px',
                          opacity: item.is_active === 1 ? 1 : 0.75
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ flex: '1 1 350px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                                {item.name}
                              </span>
                              <span className="tag-pill" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.8rem' }}>
                                {item.category}
                              </span>
                              <span className="tag-pill" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Icon name="pin" size={13} /> {item.region || 'All Regions'}
                              </span>
                              <span
                                className="status-badge"
                                style={{
                                  background: item.is_active === 1 ? '#dcfce7' : '#fee2e2',
                                  color: item.is_active === 1 ? '#15803d' : '#b91c1c',
                                  fontSize: '0.75rem',
                                  padding: '2px 8px'
                                }}
                              >
                                {item.is_active === 1 ? 'Active' : 'Disabled'}
                              </span>
                            </div>

                            {/* Regional dialect aliases */}
                            <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                                Local / 20km Regional Names:
                              </span>
                              {item.regional_names ? (
                                item.regional_names.split(',').map((alias, idx) => {
                                  const trimmed = alias.trim();
                                  if (!trimmed) return null;
                                  return (
                                    <span
                                      key={idx}
                                      style={{
                                        background: '#fef3c7',
                                        color: '#92400e',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        border: '1px solid #fde68a',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Icon name="tag" size={12} /> {trimmed}
                                    </span>
                                  );
                                })
                              ) : (
                                <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                  No regional aliases added yet
                                </span>
                              )}
                            </div>

                            {item.description && (
                              <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.4 }}>
                                {item.description}
                              </p>
                            )}

                            <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                              Default Rate: <strong>₹{item.default_rate || 1500} / day</strong>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn-small"
                              style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              onClick={() => handleOpenEditEquip(item)}
                            >
                              <Icon name="edit" size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn-small"
                              style={{
                                background: item.is_active === 1 ? '#d97706' : '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              onClick={() => handleToggleEquipStatus(item)}
                            >
                              {item.is_active === 1 ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              type="button"
                              className="btn-small"
                              style={{ background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              onClick={() => handleDeleteEquip(item.id, item.name)}
                            >
                              <Icon name="trash" size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Agricultural Services List ── */}
            {!catalogLoading && catalogSubTab === 'services' && (
              <div>
                {filteredServices.length === 0 ? (
                  <div className="listings-empty">
                    No agricultural services found matching criteria.{' '}
                    <button className="auth-gate-link" onClick={handleOpenAddService} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                      Add a new service now
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredServices.map((svc) => (
                      <div
                        key={svc.id}
                        className="booking-card"
                        style={{
                          background: svc.is_active === 1 ? '#ffffff' : '#f8fafc',
                          border: svc.is_active === 1 ? '1px solid #cbd5e1' : '1px dashed #cbd5e1',
                          borderRadius: '12px',
                          padding: '16px 20px',
                          opacity: svc.is_active === 1 ? 1 : 0.75
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ flex: '1 1 350px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                                {svc.service_name}
                              </span>
                              <span className="tag-pill" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.8rem' }}>
                                {svc.category}
                              </span>
                              <span className="tag-pill" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Icon name="pin" size={13} /> {svc.region || 'All Regions'}
                              </span>
                              <span
                                className="status-badge"
                                style={{
                                  background: svc.is_active === 1 ? '#dcfce7' : '#fee2e2',
                                  color: svc.is_active === 1 ? '#15803d' : '#b91c1c',
                                  fontSize: '0.75rem',
                                  padding: '2px 8px'
                                }}
                              >
                                {svc.is_active === 1 ? 'Active' : 'Disabled'}
                              </span>
                            </div>

                            {/* Regional dialect aliases */}
                            <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                                Local / 20km Regional Names:
                              </span>
                              {svc.regional_names ? (
                                svc.regional_names.split(',').map((alias, idx) => {
                                  const trimmed = alias.trim();
                                  if (!trimmed) return null;
                                  return (
                                    <span
                                      key={idx}
                                      style={{
                                        background: '#dbeafe',
                                        color: '#1e40af',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        border: '1px solid #bfdbfe',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Icon name="tag" size={12} /> {trimmed}
                                    </span>
                                  );
                                })
                              ) : (
                                <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                  No regional aliases added yet
                                </span>
                              )}
                            </div>

                            {svc.description && (
                              <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.4 }}>
                                {svc.description}
                              </p>
                            )}

                            <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                              Pricing Model: <strong>{svc.pricing_type ? svc.pricing_type.replace('_', ' ').toUpperCase() : 'PER ACRE'}</strong>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn-small"
                              style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              onClick={() => handleOpenEditService(svc)}
                            >
                              <Icon name="edit" size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn-small"
                              style={{
                                background: svc.is_active === 1 ? '#d97706' : '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              onClick={() => handleToggleServiceStatus(svc)}
                            >
                              {svc.is_active === 1 ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              type="button"
                              className="btn-small"
                              style={{ background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              onClick={() => handleDeleteService(svc.id, svc.service_name)}
                            >
                              <Icon name="trash" size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Modal: Add / Edit Equipment ── */}
            {equipModalOpen && (
              <div className="modal-backdrop" onClick={() => setEquipModalOpen(false)}>
                <div
                  className="modal-card"
                  onClick={(e) => e.stopPropagation()}
                  style={{ maxWidth: '600px', width: '95%', padding: '24px', borderRadius: '14px', background: '#ffffff', maxHeight: '90vh', overflowY: 'auto' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {editingEquip ? (
                        <><Icon name="edit" size={20} /> Edit Equipment Details</>
                      ) : (
                        <><Icon name="plus" size={20} /> Add New Equipment</>
                      )}
                    </h3>
                    <button
                      className="modal-close"
                      onClick={() => setEquipModalOpen(false)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <Icon name="x" size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEquip}>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                        Equipment Standard Name *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Seed Drill, Rotavator, Sugarcane Harvester"
                        value={equipForm.name}
                        onChange={(e) => setEquipForm({ ...equipForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                          Category *
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Tractor & Tillage, Sowing & Planting"
                          value={equipForm.category}
                          onChange={(e) => setEquipForm({ ...equipForm, category: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                          Target Region / 20km Band
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. All Regions, Nashik, Pune, Vidarbha"
                          value={equipForm.region}
                          onChange={(e) => setEquipForm({ ...equipForm, region: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Regional Dialect Names - Crucial field for the user's requirement */}
                    <div className="form-group" style={{ marginBottom: '14px', background: '#fffbeb', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Icon name="tag" size={16} /> Regional / Local Dialect Names (comma-separated)
                      </label>
                      <span style={{ fontSize: '0.8rem', color: '#b45309', display: 'block', marginBottom: '8px' }}>
                        Different 20km regions use different names for the same equipment. Enter all local variations so farmers can find it immediately.
                      </span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. पाभर, Pabhara, पेरणी यंत्र, तिफण (Tifan)"
                        value={equipForm.regional_names}
                        onChange={(e) => setEquipForm({ ...equipForm, regional_names: e.target.value })}
                      />
                    </div>

                    <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                          Default Estimated Rate (₹ / Day)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="e.g. 1500"
                          value={equipForm.default_rate}
                          onChange={(e) => setEquipForm({ ...equipForm, default_rate: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                          Icon Key
                        </label>
                        <select
                          className="form-select"
                          value={equipForm.icon}
                          onChange={(e) => setEquipForm({ ...equipForm, icon: e.target.value })}
                        >
                          <option value="tractor">Tractor</option>
                          <option value="wrench">Wrench / Mechanical</option>
                          <option value="leaf">Leaf / Sprayer</option>
                          <option value="shower">Shower / Irrigation</option>
                          <option value="wheat">Wheat / Harvest</option>
                          <option value="zap">Zap / Generator</option>
                          <option value="tree">Tree / Orchard</option>
                          <option value="drone">Drone</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                        Description & Usage Specifications
                      </label>
                      <textarea
                        className="form-textarea"
                        rows="3"
                        placeholder="Purpose, power requirement, suitable crops, attachments..."
                        value={equipForm.description}
                        onChange={(e) => setEquipForm({ ...equipForm, description: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                      <input
                        type="checkbox"
                        id="equipActiveCheck"
                        checked={equipForm.is_active === 1}
                        onChange={(e) => setEquipForm({ ...equipForm, is_active: e.target.checked ? 1 : 0 })}
                      />
                      <label htmlFor="equipActiveCheck" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                        Active & Available in User Dropdowns / Catalogue
                      </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn-small btn-small-outline"
                        onClick={() => setEquipModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-small"
                        style={{ background: 'var(--green-mid)', color: 'white', fontWeight: 600, padding: '8px 20px' }}
                      >
                        {editingEquip ? 'Save Changes' : 'Add to Catalog'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── Modal: Add / Edit Agricultural Service ── */}
            {serviceModalOpen && (
              <div className="modal-backdrop" onClick={() => setServiceModalOpen(false)}>
                <div
                  className="modal-card"
                  onClick={(e) => e.stopPropagation()}
                  style={{ maxWidth: '600px', width: '95%', padding: '24px', borderRadius: '14px', background: '#ffffff', maxHeight: '90vh', overflowY: 'auto' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {editingService ? (
                        <><Icon name="edit" size={20} /> Edit Agricultural Service</>
                      ) : (
                        <><Icon name="plus" size={20} /> Add New Agricultural Service</>
                      )}
                    </h3>
                    <button
                      className="modal-close"
                      onClick={() => setServiceModalOpen(false)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <Icon name="x" size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveService}>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                        Service Standard Name *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Drone Spraying, Paddy Transplantation, Laser Leveling"
                        value={serviceForm.service_name}
                        onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                          Category *
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Land Preparation, Sowing, Crop Protection"
                          value={serviceForm.category}
                          onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                          Target Region / District
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. All Regions, Konkan, Nashik, Pune"
                          value={serviceForm.region}
                          onChange={(e) => setServiceForm({ ...serviceForm, region: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Regional Dialect Names */}
                    <div className="form-group" style={{ marginBottom: '14px', background: '#eff6ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Icon name="tag" size={16} /> Regional / Local Dialect Names (comma-separated)
                      </label>
                      <span style={{ fontSize: '0.8rem', color: '#1d4ed8', display: 'block', marginBottom: '8px' }}>
                        Local dialect terms used by farmers (e.g. भात लावणी, Bhat Lavani, रोप लावणी, खुरपणी, छाटणी)
                      </span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. भात लावणी, Bhat Lavani, रोप लावणी"
                        value={serviceForm.regional_names}
                        onChange={(e) => setServiceForm({ ...serviceForm, regional_names: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                        Pricing Model
                      </label>
                      <select
                        className="form-select"
                        value={serviceForm.pricing_type}
                        onChange={(e) => setServiceForm({ ...serviceForm, pricing_type: e.target.value })}
                      >
                        <option value="per_acre">Per Acre (₹ / Acre)</option>
                        <option value="per_hour">Per Hour (₹ / Hour)</option>
                        <option value="per_day">Per Day (₹ / Day)</option>
                        <option value="fixed">Fixed Price (₹ / Job)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                        Description
                      </label>
                      <textarea
                        className="form-textarea"
                        rows="3"
                        placeholder="Service details, machinery used, output capacity..."
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                      <input
                        type="checkbox"
                        id="serviceActiveCheck"
                        checked={serviceForm.is_active === 1}
                        onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked ? 1 : 0 })}
                      />
                      <label htmlFor="serviceActiveCheck" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                        Active & Available for Booking & Listing
                      </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn-small btn-small-outline"
                        onClick={() => setServiceModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-small"
                        style={{ background: 'var(--green-mid)', color: 'white', fontWeight: 600, padding: '8px 20px' }}
                      >
                        {editingService ? 'Save Changes' : 'Add to Catalog'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
                          <Icon name="arrow-right" size={14} style={{ color: '#94a3b8' }} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                            For: {rev.reviewee_name || 'Provider'} ({rev.reviewee_role || 'owner'})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '6px 0' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                            {[1, 2, 3, 4, 5].map((starIdx) => (
                              <Icon
                                key={starIdx}
                                name="star"
                                size={16}
                                style={{
                                  color: starIdx <= rev.rating ? '#f59e0b' : '#cbd5e1',
                                  fill: starIdx <= rev.rating ? '#f59e0b' : 'none'
                                }}
                              />
                            ))}
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
