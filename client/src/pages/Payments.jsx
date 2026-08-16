import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import { useLanguage } from '../i18n/LanguageContext';
import { getMyPayments } from '../lib/api';

const STATUS_COLORS = { held: '#eab308', released: '#16a34a', refunded: '#dc2626' };
const STATUS_KEYS = { held: 'pay.held', released: 'pay.released', refunded: 'pay.refunded' };

export default function Payments() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPayments()
      .then((d) => setPayments(d.payments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageBanner title={t('pay.title')} color="emerald" />
      <div className="tab-pane">
        {loading && <div className="listings-empty">{t('common.loading')}</div>}
        {!loading && payments.length === 0 && <div className="listings-empty">{t('pay.noPayments')}</div>}
        {payments.map((p) => (
          <div key={p.id} className="payment-card">
            <div>
              <strong>{t(`seed.${p.listing_title}`, p.listing_title || p.listing_type)}</strong>
              <br />
              <span className="muted">{p.transaction_ref || ''}</span>
            </div>
            <div className="payment-right">
              <strong>₹{p.amount.toLocaleString()}</strong>
              <br />
              <span style={{ color: STATUS_COLORS[p.status] || '#6b7280', fontSize: 13, fontWeight: 600 }}>
                {t(STATUS_KEYS[p.status] || p.status || '').toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
