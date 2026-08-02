import { useDeferredValue, useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import ListingCard from '../components/ListingCard';
import { useNav } from '../context/NavContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getEquipment } from '../lib/api';

export default function EquipmentRental() {
  const { navigate } = useNav();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [count, setCount] = useState(0);
  // Defer the search value so the input stays responsive while results update
  const deferredSearch = useDeferredValue(search);

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

  return (
    <>
      <PageBanner title={t('equip.title')} color="orange" actionLabel={t('equip.action')} onAction={() => navigate('list-equipment')} />
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder={t('equip.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="listings-count-label">{t('common.count', { n: count, s: count !== 1 ? 's' : '' })}</div>
      {loading && <div className="listings-empty">{t('common.loading')}</div>}
      {!loading && error && <div className="listings-error">{t('common.error', { msg: error })}</div>}
      {!loading && !error && listings.length === 0 && (
        <div className="listings-empty">{t('equip.noListings')}</div>
      )}
      <div className="grid-cards-2col">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} type="equipment" />
        ))}
      </div>
    </>
  );
}
