import { useDeferredValue, useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import ListingCard from '../components/ListingCard';
import AuthGateModal from '../components/AuthGateModal';
import LocationPrompt from '../components/LocationPrompt';
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
        width: 'fit-content',
        maxWidth: '92%',
        margin: '12px auto 18px auto',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '1px solid #86efac',
        borderRadius: '20px',
        padding: '6px 14px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: '10px',
        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <span style={{
            background: '#16a34a',
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
            color: '#14532d',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {t('land.guideText', 'Want to know how farmland leasing works on Krishi Sangam?')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('about-land-leasing')}
          style={{
            background: '#15803d',
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
          {t('land.aboutBtn', 'About Land Leasing →')}
        </button>
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
      {loading && <div className="listings-empty">{t('common.loading')}</div>}
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
