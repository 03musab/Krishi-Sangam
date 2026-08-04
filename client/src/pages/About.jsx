import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import founderImg from '../assets/fouder.jpeg';
import Icon from '../components/Icon';

const WHY_CARDS = [
  { key: 'why1', color: 'var(--green-mid)', bg: 'var(--green-light)', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg> },
  { key: 'why2', color: 'var(--accent-gold)', bg: '#fef3c7', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { key: 'why3', color: 'var(--accent-teal)', bg: '#f0fdfa', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { key: 'why4', color: 'var(--accent-blue)', bg: '#eff6ff', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { key: 'why5', color: 'var(--green-dark)', bg: 'var(--green-pale)', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: 'why6', color: 'var(--accent-purple)', bg: '#f5f3ff', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> }
];

export default function About() {
  const { navigate, back } = useNav();
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '16px 24px 0' }}>
        <button className="btn-back-icon" onClick={back} aria-label="Back">←</button>
      </div>
      {/* Header */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(20, 83, 45, 0.88), rgba(15, 63, 33, 0.9))', textAlign: 'center', padding: '56px 24px' }}>
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '40px', fontWeight: '800', color: 'white', textShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>{t('about.title')}</h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.92)', marginTop: '20px', maxWidth: '800px', margin: '20px auto 0', textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* What is Krishi Sangam */}
      <section className="section" style={{ maxWidth: '1120px', margin: '12px auto 0', padding: '24px 24px' }}>
        <h2 className="section-title">{t('about.whatIsTitle')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <p style={{ fontSize: '17px', color: 'var(--text-mid)', lineHeight: '1.85' }}>
            {t('about.whatIsBody')}
          </p>
          <img
            src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=900&q=80"
            alt="Rows of crops in a farm field"
            loading="lazy"
            style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}
          />
        </div>
      </section>

      {/* Our Vision */}
      <section className="section" style={{ maxWidth: '1120px', margin: '12px auto 0', padding: '24px 24px' }}>
        <div className="vision-block hover-lift">
          <div className="vision-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div className="vision-text">
            <h3>{t('home.visionTitle')}</h3>
            <p>{t('home.visionBody')}</p>
          </div>
        </div>
      </section>

      {/* Our Mission — paired with Vision */}
      <section className="section" style={{ maxWidth: '1120px', margin: '12px auto 0', padding: '24px 24px' }}>
        <div className="vision-block hover-lift">
          <div className="vision-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div className="vision-text">
            <h3>{t('about.mission')}</h3>
            <p>{t('about.missionBody')}</p>
          </div>
        </div>
      </section>

      {/* Why Farmers Choose Krishi Sangam */}
      <section className="section" style={{ maxWidth: '1120px', margin: '12px auto 0', padding: '24px 24px' }}>
        <h2 className="section-title section-title-center" style={{ marginBottom: '20px' }}>{t('home.whyTitle')}</h2>
        <div className="why-grid">
          {WHY_CARDS.map((c) => (
            <div key={c.key} className="why-card hover-lift">
              <div className="why-card-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
              <h4>{t(`home.${c.key}Title`)}</h4>
              <p>{t(`home.${c.key}Body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet the Founder */}      <section className="section" style={{ background: 'linear-gradient(135deg, var(--green-light), #ffffff 55%)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', maxWidth: '1120px', margin: '12px auto 0', padding: '24px 24px' }}>
        <h2 className="section-title section-title-center" style={{ marginBottom: '20px' }}>{t('about.founder')}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 14px 34px rgba(22, 101, 52, 0.3)', border: '6px solid white', outline: '3px solid var(--green-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={founderImg} alt={t('about.founderName')} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'var(--green-mid)', color: 'white', fontSize: '12px', fontWeight: '700', padding: '5px 12px', borderRadius: '999px', boxShadow: '0 4px 10px rgba(22, 101, 52, 0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="seedling" size={14} /></span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '26px', color: 'var(--text-dark)', marginBottom: '4px' }}>{t('about.founderName')}</h3>
            <p style={{ color: 'var(--green-dark)', fontWeight: '700', fontSize: '17px', marginBottom: '20px' }}>{t('about.founderTitle')}</p>
            <div style={{ color: 'var(--text-mid)', fontSize: '16px', lineHeight: '1.8', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
              <p>{t('about.founderP1')}</p>
              <p>{t('about.founderP2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ maxWidth: '1120px', margin: '12px auto 0', padding: '24px 24px' }}>
        <div style={{ position: 'relative', overflow: 'hidden', padding: '56px 40px', background: 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(240,253,244,0.96))', borderRadius: 'var(--radius-xl)', textAlign: 'center', color: '#0b0f0c', boxShadow: '0 16px 32px rgba(22, 101, 52, 0.18)' }}>
          <img
            src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1400&q=80"
            alt=""
            aria-hidden="true"
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '28px', color: '#0b0f0c', marginBottom: '16px' }}>{t('home.ctaTitle')}</h2>
            <p style={{ fontSize: '17px', maxWidth: '680px', margin: '0 auto 32px', color: '#111827', lineHeight: '1.6' }}>
              {t('home.ctaBody')}
            </p>
            <button className="btn-hero" style={{ background: '#ffffff', color: '#0b0f0c', padding: '14px 36px', fontSize: '16px', border: '2px solid #0b0f0c', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }} onClick={() => navigate(user ? 'profile' : 'signup')}>
              {t('home.ctaButton')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
