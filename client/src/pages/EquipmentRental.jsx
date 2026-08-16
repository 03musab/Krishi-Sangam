import { useDeferredValue, useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import ListingCard from '../components/ListingCard';
import AuthGateModal from '../components/AuthGateModal';
import LocationPrompt from '../components/LocationPrompt';
import BookEquipmentWithOperator from '../components/BookEquipmentWithOperator';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { getEquipment, getMyBookings } from '../lib/api';
import { sortListingsByProximity } from '../lib/geo';
import { EQUIPMENT_CATEGORIES } from '../data/services';
import { getTrustTier } from '../lib/trust';
import Icon from '../components/Icon';
import { FEATURES } from '../config';

export default function EquipmentRental() {
  const { navigate } = useNav();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [count, setCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [gateOpen, setGateOpen] = useState(false);
  const [bookGateOpen, setBookGateOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [sortedListings, setSortedListings] = useState([]);
  // Defer the search value so the input stays responsive while results update
  const deferredSearch = useDeferredValue(search);
  const { status: locStatus, coords: locCoords, place: locPlace } = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEquipment(deferredSearch ? `search=${encodeURIComponent(deferredSearch)}` : '')
      .then((d) => {
        if (cancelled) return;
        setListings(d.listings);
        setCount(d.count);
        setError('');
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [deferredSearch]);

  // Sort by distance from the user once location is available
  useEffect(() => {
    let cancelled = false;
    if (!listings.length) {
      setSortedListings(listings);
      return;
    }
    if (locStatus === 'granted' && locCoords) {
      sortListingsByProximity(listings, locCoords.lat, locCoords.lng, locPlace)
        .then((sorted) => !cancelled && setSortedListings(sorted))
        .catch(() => !cancelled && setSortedListings(listings));
    } else {
      setSortedListings(listings);
    }
    return () => { cancelled = true; };
  }, [listings, locStatus, locCoords, locPlace]);

  // Trust tier — count successful (completed) rentals for this member
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
    setSearch((prev) => (prev === item ? '' : item));
  };

  if (bookingOpen) {
    return <BookEquipmentWithOperator onBack={() => setBookingOpen(false)} onSubmitted={() => setBookingOpen(false)} />;
  }

  return (
    <>
      <PageBanner title={t('equip.title')} color="orange" actionLabel={t('equip.action')} onAction={() => {
        if (!user) { setGateOpen(true); return; }
        navigate('list-equipment');
      }} />

      <LocationPrompt />

      {/* Book Equipment with Operator — top option */}
      <div className="section labour-top-section" style={{ paddingBottom: '8px' }}>
        <button
          className="labour-team-card equipment"
          onClick={() => {
            if (!user) { setBookGateOpen(true); return; }
            setBookingOpen(true);
          }}
        >
          <span className="labour-team-emoji"><Icon name="tractor" size={44} /></span>
          <div className="labour-team-text">
            <h3>{t('equipBook.title')}</h3>
            <p>{t('equipBook.hireEquip')}</p>
            <span className="labour-team-link">{t('labour.bookNow')}</span>
          </div>
        </button>
      </div>

      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder={t('equip.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Browse equipment catalogue — hidden behind the equipmentCatalogue feature flag */}
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
                      className={`equip-browse-chip ${search === item ? 'active' : ''}`}
                      onClick={() => toggleItem(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {search && (
            <button className="equip-browse-clear" onClick={() => setSearch('')}>
              <Icon name="x" size={15} style={{ marginRight: '6px' }} />{t('equip.allEquipment')}
            </button>
          )}
        </section>
      )}

      <div className="listings-count-label">{t('common.count', { n: count, s: count !== 1 ? 's' : '' })}</div>
      {loading && <div className="listings-empty">{t('common.loading')}</div>}
      {!loading && error && <div className="listings-error">{t('common.error', { msg: error })}</div>}
      {!loading && !error && listings.length === 0 && (
        <div className="listings-empty">{search ? t('equip.noListingsFilter', { q: search }) : t('equip.noListings')}</div>
      )}
      <div className="grid-cards-2col">
        {sortedListings.map((l) => (
          <ListingCard key={l.id} listing={l} type="equipment" trustTier={tier} />
        ))}
      </div>

      {gateOpen && (
        <AuthGateModal
          title={t('equip.action')}
          description={t('gate.listDesc')}
          onClose={() => setGateOpen(false)}
        />
      )}

      {bookGateOpen && (
        <AuthGateModal
          title={t('equipBook.title')}
          description={t('gate.labourDesc')}
          onClose={() => setBookGateOpen(false)}
        />
      )}
    </>
  );
}
