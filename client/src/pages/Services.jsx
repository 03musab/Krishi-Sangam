import { useNav } from '../context/NavContext';
import { useLanguage } from '../i18n/LanguageContext';
import PageBanner from '../components/PageBanner';

const SERVICES = [
  {
    id: 'land',
    view: 'land-leasing',
    img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'equipment',
    view: 'equipment-rental',
    img: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'labour',
    view: 'labour',
    img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'produce',
    view: 'produce',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
  }
];

const COMING_SOON = [
  { key: 'cs1', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80' },
  { key: 'cs2', img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80' },
  { key: 'cs3', img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80' },
  { key: 'cs4', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80' },
  { key: 'cs5', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80' }
];

export default function Services() {
  const { navigate } = useNav();
  const { t } = useLanguage();

  return (
    <div style={{ paddingBottom: '60px' }}>
      <PageBanner title={t('services.title')} />

      <section className="section" style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <p style={{ fontSize: 'var(--fs-md)', color: 'var(--text-mid)', lineHeight: '1.7', textAlign: 'center', maxWidth: '800px', margin: '0 auto 32px' }}>
          {t('services.subtitle')}
        </p>

        <div className="services-grid">
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className="service-card hover-lift"
              onClick={() => navigate(s.view)}
            >
              <img
                src={s.img}
                alt={t(`services.${s.id}`)}
                loading="lazy"
                style={{ width: 'calc(100% + 48px)', height: '150px', objectFit: 'cover', display: 'block', margin: '-28px -24px 18px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
              />
              <h3>{t(`services.${s.id}`)}</h3>
              <p>{t(`services.${s.id}Body`)}</p>
              <span className="service-card-link">
                {t('services.cta')} <span aria-hidden="true">→</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface-2)', marginTop: '32px' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <h2 className="section-title section-title-center" style={{ marginBottom: '16px' }}>{t('home.comingSoon')}</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-mid)', maxWidth: '650px', margin: '0 auto 32px', fontSize: '16px', lineHeight: '1.7' }}>
            {t('home.comingSoonSub')}
          </p>
          <div className="coming-soon-grid">
            {COMING_SOON.map((c) => (
              <div key={c.key} className="coming-soon-card hover-lift">
                <img src={c.img} alt={t(`home.${c.key}Title`)} loading="lazy" style={{ width: 'calc(100% + 48px)', height: '110px', objectFit: 'cover', display: 'block', margin: '-24px -24px 14px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }} />
                <h4>{t(`home.${c.key}Title`)}</h4>
                <p>{t(`home.${c.key}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
