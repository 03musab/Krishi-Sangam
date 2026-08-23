import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import BankDetailsCard from '../components/BankDetailsCard';
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
      <PageBanner title={t('pay.title', 'Bank & Payments')} color="emerald" />
      <div className="tab-pane" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px' }}>
        <BankDetailsCard />

        <h3 style={{ marginTop: '32px', marginBottom: '14px', fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
          {t('pay.historyTitle', 'Escrow Payment Transactions')}
        </h3>

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
