import { useDeferredValue, useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import ListingCard from '../components/ListingCard';
import AuthGateModal from '../components/AuthGateModal';
import LocationPrompt from '../components/LocationPrompt';
import BookEquipmentWithOperator from '../components/BookEquipmentWithOperator';
import BookLabourTeam from '../components/BookLabourTeam';
import ServiceBookingForm from '../components/ServiceBookingForm';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { getEquipment, getMyBookings } from '../lib/api';
import { sortListingsByProximity } from '../lib/geo';
import { EQUIPMENT_CATEGORIES, SERVICE_CATEGORIES } from '../data/services';
import MOCK_LABOUR from '../data/mockLabour';
import { getTrustTier } from '../lib/trust';
import Icon from '../components/Icon';
import { FEATURES } from '../config';

export default function FarmServices() {
  const { navigate } = useNav();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { status: locStatus, coords: locCoords, place: locPlace } = useLocation();

  // ── Collapsible sections ──
  const [browseOpen, setBrowseOpen] = useState(false);
  const [labBrowseOpen, setLabBrowseOpen] = useState(false);
  const [agriBrowseOpen, setAgriBrowseOpen] = useState(false);

  // ── Equipment state ──
  const [eqListings, setEqListings] = useState([]);
  const [eqLoading, setEqLoading] = useState(true);
  const [eqError, setEqError] = useState('');
  const [eqSearch, setEqSearch] = useState('');
  const [eqCount, setEqCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [sortedListings, setSortedListings] = useState([]);
  const deferredEqSearch = useDeferredValue(eqSearch);

  // ── Labour state (mock) ──
  const [labListings, setLabListings] = useState([]);
  const [labSearch, setLabSearch] = useState('');
  const [labCount, setLabCount] = useState(0);
  const [sortedLabListings, setSortedLabListings] = useState([]);
  const deferredLabSearch = useDeferredValue(labSearch);

  // ── Auth gates ──
  const [gateOpen, setGateOpen] = useState(false);
  const [bookEqGateOpen, setBookEqGateOpen] = useState(false);
  const [listEqGateOpen, setListEqGateOpen] = useState(false);
  const [listLabGateOpen, setListLabGateOpen] = useState(false);

  // ── Sub-flows ──
  const [eqBookingOpen, setEqBookingOpen] = useState(false);
  const [labFlow, setLabFlow] = useState({ view: 'home', category: null, service: null });

  // ── Fetch equipment listings ──
  useEffect(() => {
    let cancelled = false;
    setEqLoading(true);
    getEquipment(deferredEqSearch ? `search=${encodeURIComponent(deferredEqSearch)}` : '')
      .then((d) => {
        if (cancelled) return;
        setEqListings(d.listings);
        setEqCount(d.count);
        setEqError('');
      })
      .catch((e) => !cancelled && setEqError(e.message))
      .finally(() => !cancelled && setEqLoading(false));
    return () => { cancelled = true; };
  }, [deferredEqSearch]);

  // ── Sort equipment by distance ──
  useEffect(() => {
    let cancelled = false;
    if (!eqListings.length) {
      setSortedListings(eqListings);
      return;
    }
    if (locStatus === 'granted' && locCoords) {
      sortListingsByProximity(eqListings, locCoords.lat, locCoords.lng, locPlace)
        .then((sorted) => !cancelled && setSortedListings(sorted))
        .catch(() => !cancelled && setSortedListings(eqListings));
    } else {
      setSortedListings(eqListings);
    }
    return () => { cancelled = true; };
  }, [eqListings, locStatus, locCoords, locPlace]);

  // ── Filter + sort labour listings (mock) ──
  useEffect(() => {
    const q = deferredLabSearch.toLowerCase().trim();
    let filtered = MOCK_LABOUR;
    if (q) {
      filtered = MOCK_LABOUR.filter(
        (l) =>
          l.worker_name.toLowerCase().includes(q) ||
          l.skills.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
      );
    }
    setLabListings(filtered);
    setLabCount(filtered.length);
  }, [deferredLabSearch]);

  useEffect(() => {
    let cancelled = false;
    if (!labListings.length) {
      setSortedLabListings(labListings);
      return;
    }
    if (locStatus === 'granted' && locCoords) {
      sortListingsByProximity(labListings, locCoords.lat, locCoords.lng, locPlace)
        .then((sorted) => !cancelled && setSortedLabListings(sorted))
        .catch(() => !cancelled && setSortedLabListings(labListings));
    } else {
      setSortedLabListings(labListings);
    }
    return () => { cancelled = true; };
  }, [labListings, locStatus, locCoords, locPlace]);

  // ── Trust tier ──
  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    getMyBookings()
      .then((d) => {
        if (cancelled) return;
        setCompletedCount((d.bookings || []).filter((b) => b.status === 'completed').length);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  const tier = getTrustTier(completedCount);

  const toggleItem = (item) => {
    setEqSearch((prev) => (prev === item ? '' : item));
  };

  const requireMember = (action) => {
    if (!user) { setGateOpen(true); return; }
    action();
  };

  // ── Sub-flow renders ──
  if (eqBookingOpen) {
    return <BookEquipmentWithOperator onBack={() => setEqBookingOpen(false)} onSubmitted={() => setEqBookingOpen(false)} />;
  }

  if (labFlow.view === 'labour-team') {
    return <BookLabourTeam onBack={() => setLabFlow({ view: 'home' })} onSubmitted={() => setLabFlow({ view: 'home' })} />;
  }

  if (labFlow.view === 'service' && labFlow.category && labFlow.service) {
    return (
      <ServiceBookingForm
        category={labFlow.category}
        service={labFlow.service}
        onBack={() => setLabFlow({ view: 'category', category: labFlow.category })}
        onSubmitted={() => setLabFlow({ view: 'home' })}
      />
    );
  }

  if (labFlow.view === 'category' && labFlow.category) {
    const category = labFlow.category;
    return (
      <div className="service-booking-wrap">
        <div className="service-booking-head">
          <button className="btn-back-icon" onClick={() => setLabFlow({ view: 'home' })}>←</button>
          <span className="service-emoji"><Icon name={category.icon} size={40} /></span>
          <div>
            <h1 className="service-booking-title">{t(`cat.${category.id}.name`, category.name)}</h1>
            <p className="service-booking-subtitle">{t(`cat.${category.id}.tagline`, category.tagline)}</p>
          </div>
        </div>

        <div className="sub-service-list">
          {category.services.map((svc) => (
            <button
              key={svc.name}
              className="sub-service-item"
              onClick={() => requireMember(() => setLabFlow({ view: 'service', category, service: svc }))}
            >
              <div className="sub-service-main tip" data-tip={t(`svc.${svc.name}.desc`, svc.desc)}>
                <span className="sub-service-name">{t(`svc.${svc.name}.name`, svc.name)}</span>
                <span className="sub-service-desc">{t(`svc.${svc.name}.desc`, svc.desc)}</span>
              </div>
              <span className="sub-service-arrow">›</span>
            </button>
          ))}
        </div>

        {gateOpen && (
          <AuthGateModal
            title={t('labour.bookServices')}
            description={t('gate.labourDesc')}
            onClose={() => setGateOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <PageBanner title={t('farmServices.title')} color="green" />

      <div style={{
        width: 'fit-content',
        maxWidth: '92%',
        margin: '12px auto 18px auto',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '1px solid #93c5fd',
        borderRadius: '20px',
        padding: '6px 14px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: '10px',
        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <span style={{
            background: '#2563eb',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: '800',
            padding: '2px 8px',
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}>{t('guide.badge', 'GUIDE')}</span>
          <span style={{
            fontSize: '0.82rem',
            color: '#1e3a8a',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {t('farmServices.guideText', 'Want to know how farm services work on Krishi Sangam?')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('about-farm-services')}
          style={{
            background: '#1d4ed8',
            color: '#ffffff',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '14px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          {t('farmServices.aboutBtn', 'About Farm Services →')}
        </button>
      </div>

      <LocationPrompt />

      {/* ═══════════════════════════════════════════════════════
          Section 1 — Equipment Rental
         ═══════════════════════════════════════════════════════ */}
      <section className="section farm-service-section">
        <div className="farm-service-card">
          <div className="farm-service-card-header">
            <div className="farm-service-icon-wrap farm-service-icon-orange">
              <Icon name="tractor" size={26} />
            </div>
            <div>
              <h2 className="farm-dropdown-title">{t('farmServices.equipmentRental')}</h2>
              <p className="farm-dropdown-desc">{t('farmServices.equipmentRentalDesc')}</p>
            </div>
          </div>

          <div className="farm-card-divider" />

          <div className="farm-service-actions">
            <button
              className="farm-service-btn farm-service-btn-primary"
              onClick={() => {
                if (!user) { setBookEqGateOpen(true); return; }
                setEqBookingOpen(true);
              }}
            >
              {t('farmServices.book')}
            </button>
            <button
              className="farm-service-btn farm-service-btn-secondary"
              onClick={() => {
                if (!user) { setListEqGateOpen(true); return; }
                navigate('list-equipment');
              }}
            >
              {t('farmServices.list')}
            </button>
          </div>

          <div className="farm-card-divider" />

          <button className="farm-browse-toggle" onClick={() => setBrowseOpen((o) => !o)}>
            <span className="farm-browse-toggle-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>
                <span className="farm-browse-toggle-title">{t('farmServices.browseDiscover')}</span>
                <span className="farm-browse-toggle-desc">{t('farmServices.browseDiscoverDesc')}</span>
              </span>
            </span>
            <svg className={`farm-dropdown-chevron ${browseOpen ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {browseOpen && (
            <div className="farm-browse-body">
              <div className="search-filter-bar">
                <div className="search-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input type="text" placeholder={t('equip.search')} value={eqSearch} onChange={(e) => setEqSearch(e.target.value)} />
                </div>
              </div>

              {FEATURES.equipmentCatalogue && (
                <section className="equip-browse">
                  <div className="equip-browse-head">
                    <h2 className="equip-browse-title"><Icon name="toolbox" size={24} style={{ verticalAlign: '-5px', marginRight: '8px' }} />{t('equip.browseTitle')}</h2>
                    <p className="equip-browse-sub">{t('equip.browseSub')}</p>
                  </div>
                  <div className="equip-browse-grid">
                    {EQUIPMENT_CATEGORIES.map((cat) => (
                      <div key={cat.label} className="equip-browse-card">
                        <div className="equip-browse-card-head">
                          <span className="equip-browse-emoji"><Icon name={cat.icon} size={24} /></span>
                          <span className="equip-browse-label">{cat.label}</span>
                        </div>
                        <div className="equip-browse-chips">
                          {cat.items.map((item) => (
                            <button
                              key={item}
                              className={`equip-browse-chip ${eqSearch === item ? 'active' : ''}`}
                              onClick={() => toggleItem(item)}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {eqSearch && (
                    <button className="equip-browse-clear" onClick={() => setEqSearch('')}>
                      <Icon name="x" size={15} style={{ marginRight: '6px' }} />{t('equip.allEquipment')}
                    </button>
                  )}
                </section>
              )}

              <div className="listings-count-label">{t('common.count', { n: eqCount, s: eqCount !== 1 ? 's' : '' })}</div>
              {eqLoading && <div className="listings-empty">{t('common.loading')}</div>}
              {!eqLoading && eqError && <div className="listings-error">{t('common.error', { msg: eqError })}</div>}
              {!eqLoading && !eqError && eqListings.length === 0 && (
                <div className="listings-empty">{eqSearch ? t('equip.noListingsFilter', { q: eqSearch }) : t('equip.noListings')}</div>
              )}
              <div className="grid-cards-2col">
                {sortedListings.map((l) => (
                  <ListingCard key={l.id} listing={l} type="equipment" trustTier={tier} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 2 — Labour (Hire Farm Workers)
         ═══════════════════════════════════════════════════════ */}
      <section className="section farm-service-section">
        <div className="farm-service-card">
          <div className="farm-service-card-header">
            <div className="farm-service-icon-wrap farm-service-icon-purple">
              <Icon name="worker" size={26} />
            </div>
            <div>
              <h2 className="farm-dropdown-title">{t('farmServices.labour')}</h2>
              <p className="farm-dropdown-desc">{t('farmServices.labourDesc')}</p>
            </div>
          </div>

          <div className="farm-card-divider" />

          <div className="farm-service-actions">
            <button
              className="farm-service-btn farm-service-btn-primary"
              onClick={() => requireMember(() => setLabFlow({ view: 'labour-team' }))}
            >
              {t('farmServices.book')}
            </button>
            <button
              className="farm-service-btn farm-service-btn-secondary"
              onClick={() => {
                if (!user) { setListLabGateOpen(true); return; }
                navigate('list-labour');
              }}
            >
              {t('farmServices.list')}
            </button>
          </div>

          <div className="farm-card-divider" />

          <button className="farm-browse-toggle" onClick={() => setLabBrowseOpen((o) => !o)}>
            <span className="farm-browse-toggle-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>
                <span className="farm-browse-toggle-title">{t('farmServices.browseDiscover')}</span>
                <span className="farm-browse-toggle-desc">{t('farmServices.labourBrowseDesc')}</span>
              </span>
            </span>
            <svg className={`farm-dropdown-chevron ${labBrowseOpen ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {labBrowseOpen && (
            <div className="farm-browse-body">
              <div className="search-filter-bar">
                <div className="search-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input type="text" placeholder={t('labour.searchWorkers')} value={labSearch} onChange={(e) => setLabSearch(e.target.value)} />
                </div>
              </div>

              <div className="listings-count-label">{t('common.count', { n: labCount, s: labCount !== 1 ? 's' : '' })}</div>
              {labListings.length === 0 && (
                <div className="listings-empty">{labSearch ? t('labour.noWorkersFilter', { q: labSearch }) : t('labour.noWorkers')}</div>
              )}
              <div className="grid-cards-2col">
                {sortedLabListings.map((l) => (
                  <ListingCard key={l.id} listing={l} type="labour" trustTier={tier} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 3 — Agricultural Services (categories)
         ═══════════════════════════════════════════════════════ */}
      <section className="section farm-service-section">
        <div className="farm-service-card">
          <div className="farm-service-card-header">
            <div className="farm-service-icon-wrap farm-service-icon-teal">
              <Icon name="wheat" size={26} />
            </div>
            <div>
              <h2 className="farm-dropdown-title">{t('farmServices.agriServices')}</h2>
              <p className="farm-dropdown-desc">{t('farmServices.agriServicesDesc')}</p>
            </div>
          </div>

          <div className="farm-card-divider" />

          <button className="farm-browse-toggle" onClick={() => setAgriBrowseOpen((o) => !o)}>
            <span className="farm-browse-toggle-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>
                <span className="farm-browse-toggle-title">{t('farmServices.browseDiscover')}</span>
                <span className="farm-browse-toggle-desc">{t('labour.pickCategory')}</span>
              </span>
            </span>
            <svg className={`farm-dropdown-chevron ${agriBrowseOpen ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {agriBrowseOpen && (
            <div className="farm-browse-body">
              <div className="service-category-grid">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className="service-category-card"
                    onClick={() => setLabFlow({ view: 'category', category: cat })}
                  >
                    <span className="service-category-emoji tip tip-left" data-tip={cat.desc || cat.tagline}><Icon name={cat.icon} size={34} /></span>
                    <span className="service-category-name">{t(`cat.${cat.id}.name`, cat.name)}</span>
                    <span className="service-category-tagline">{t(`cat.${cat.id}.tagline`, cat.tagline)}</span>
                    <span className="service-category-count">{t('labour.xServices', { n: cat.services.length })}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Auth Gates ── */}
      {gateOpen && (
        <AuthGateModal
          title={t('labour.bookServices')}
          description={t('gate.labourDesc')}
          onClose={() => setGateOpen(false)}
        />
      )}
      {bookEqGateOpen && (
        <AuthGateModal
          title={t('farmServices.book')}
          description={t('gate.labourDesc')}
          onClose={() => setBookEqGateOpen(false)}
        />
      )}
      {listEqGateOpen && (
        <AuthGateModal
          title={t('farmServices.list')}
          description={t('gate.listDesc')}
          onClose={() => setListEqGateOpen(false)}
        />
      )}
      {listLabGateOpen && (
        <AuthGateModal
          title={t('farmServices.list')}
          description={t('gate.labourDesc')}
          onClose={() => setListLabGateOpen(false)}
        />
      )}
    </>
  );
}
