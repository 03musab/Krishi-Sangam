import { useDeferredValue, useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import ListingCard from '../components/ListingCard';
import AuthGateModal from '../components/AuthGateModal';
import LocationPrompt from '../components/LocationPrompt';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { getProduce } from '../lib/api';
import { sortListingsByProximity } from '../lib/geo';

export default function Produce() {
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
    getProduce(deferredSearch ? `search=${encodeURIComponent(deferredSearch)}` : '')
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
      <PageBanner title={t('produce.title')} color="amber" actionLabel={t('produce.action')} onAction={() => {
        if (!user) { setGateOpen(true); return; }
        navigate('list-produce');
      }} />
      <LocationPrompt />
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder={t('produce.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="listings-count-label">{t('common.count', { n: count, s: count !== 1 ? 's' : '' })}</div>
      {loading && <div className="listings-empty">{t('common.loading')}</div>}
      {!loading && error && <div className="listings-error">{t('common.error', { msg: error })}</div>}
      {!loading && !error && listings.length === 0 && (
        <div className="listings-empty">{t('produce.noListings')}</div>
      )}
      <div className="grid-cards-2col">
        {sortedListings.map((l) => (
          <ListingCard key={l.id} listing={l} type="produce" />
        ))}
      </div>

      {gateOpen && (
        <AuthGateModal
          title={t('produce.action')}
          description={t('gate.listDesc')}
          onClose={() => setGateOpen(false)}
        />
      )}
    </>
  );
}
