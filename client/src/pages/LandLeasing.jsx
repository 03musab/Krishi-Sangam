import { useDeferredValue, useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import ListingCard from '../components/ListingCard';
import AuthGateModal from '../components/AuthGateModal';
import LocationPrompt from '../components/LocationPrompt';
import SkeletonLoader from '../components/SkeletonLoader';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { getLand } from '../lib/api';
import { sortListingsByProximity } from '../lib/geo';

export default function LandLeasing() {
  const { navigate } = useNav();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [count, setCount] = useState(0);
  const [gateOpen, setGateOpen] = useState(false);
  const [sortedListings, setSortedListings] = useState([]);
  // Defer the search value so the input stays responsive while results update
  const deferredSearch = useDeferredValue(search);
  const { status: locStatus, coords: locCoords, place: locPlace } = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLand(deferredSearch ? `search=${encodeURIComponent(deferredSearch)}` : '')
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

  return (
    <>
      <PageBanner title={t('land.title')} color="green" actionLabel={t('land.action')} onAction={() => {
        if (!user) { setGateOpen(true); return; }
        navigate('list-land');
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '12px auto 6px auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'flex-start'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '3px 12px 3px 8px',
          fontSize: '0.78rem',
          color: '#475569'
        }}>
          <span style={{
            background: '#e2e8f0',
            color: '#475569',
            fontSize: '0.64rem',
            fontWeight: '800',
            padding: '1px 6px',
            borderRadius: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            flexShrink: 0
          }}>{t('guide.badge', 'GUIDE')}</span>
          <span style={{ fontWeight: '500', color: '#64748b' }}>
            {t('land.guideText', 'Want to know how farmland leasing works on Krishi Sangam?')}
          </span>
          <button
            type="button"
            onClick={() => navigate('about-land-leasing')}
            style={{
              background: 'transparent',
              color: '#15803d',
              border: 'none',
              padding: '0 4px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              textDecoration: 'underline'
            }}
          >
            {t('land.aboutBtn', 'About Land Leasing →')}
          </button>
        </div>
      </div>

      <LocationPrompt />
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder={t('land.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="listings-count-label">{t('common.count', { n: count, s: count !== 1 ? 's' : '' })}</div>
      {loading && <SkeletonLoader count={6} type="card" />}
      {!loading && error && <div className="listings-error">{t('common.error', { msg: error })}</div>}
      {!loading && !error && listings.length === 0 && (
        <div className="listings-empty">{t('land.noListings')}</div>
      )}
      <div className="grid-cards-2col">
        {sortedListings.map((l) => (
          <ListingCard key={l.id} listing={l} type="land" />
        ))}
      </div>

      {gateOpen && (
        <AuthGateModal
          title={t('land.action')}
          description={t('gate.listDesc')}
          onClose={() => setGateOpen(false)}
        />
      )}
    </>
  );
}
