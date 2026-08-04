import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import ContactSection from '../components/ContactSection';
import Chatbot from '../components/Chatbot';
import Icon from '../components/Icon';

const WHY_CARDS = [
  { key: 'why1', color: 'var(--green-mid)', bg: 'var(--green-light)', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg> },
  { key: 'why2', color: 'var(--accent-gold)', bg: '#fef3c7', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { key: 'why3', color: 'var(--accent-teal)', bg: '#f0fdfa', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { key: 'why4', color: 'var(--accent-blue)', bg: '#eff6ff', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { key: 'why5', color: 'var(--green-dark)', bg: 'var(--green-pale)', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: 'why6', color: 'var(--accent-purple)', bg: '#f5f3ff', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> }
];

export default function Home() {
  const { navigate } = useNav();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleGetStarted = () => {
    if (user) {
      navigate('profile');
    } else {
      navigate('signup');
    }
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1170&q=80"
            alt="Lush green farm field"
            className="hero-img"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content" style={{ maxWidth: '900px' }}>
          <h1 className="hero-title" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
            {t('home.hero.title')}
          </h1>
          <p className="hero-subtitle" style={{ fontSize: 'clamp(16px, 2vw, 20px)', marginTop: '24px', lineHeight: '1.6' }}>
            {t('home.hero.subtitle')}
          </p>
          <div className="hero-actions" style={{ marginTop: '40px' }}>
            <button className="btn-hero" style={{ background: 'var(--green-mid)', color: 'white', border: 'none', padding: '14px 32px' }} onClick={handleGetStarted}>
              {t('home.getStarted')}
            </button>
            <button className="btn-hero btn-outline" style={{ padding: '14px 32px' }} onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}>
              {t('home.exploreServices')}
            </button>
          </div>
        </div>
      </section>

      {/* 2. About Krishi Sangam */}
      <section className="section">
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <h2 className="section-title section-title-center" style={{ marginBottom: '32px' }}>{t('home.aboutTitle')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '17px', color: 'var(--text-mid)', lineHeight: '1.85' }}>{t('home.aboutP1')}</p>
              <p style={{ fontSize: '17px', color: 'var(--text-mid)', lineHeight: '1.85' }}>{t('home.aboutP2')}</p>
              <p style={{ fontSize: '17px', color: 'var(--text-mid)', lineHeight: '1.85' }}>{t('home.aboutP3')}</p>
            </div>
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=900&q=80"
                alt="Vibrant green farm fields"
                loading="lazy"
                style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}
              />
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(255, 255, 255, 0.94)', borderRadius: '999px', padding: '8px 18px', fontWeight: '700', fontSize: '13px', color: 'var(--green-dark)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="wheat" size={16} /> Krishi Sangam
              </div>
            </div>
          </div>

          {/* Our Vision — separate feature block */}
          <div className="vision-block hover-lift" style={{ marginTop: '55px' }}>
            <div className="vision-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <div className="vision-text">
              <h3>{t('home.visionTitle')}</h3>
              <p>{t('home.visionBody')}</p>
            </div>
          </div>

          {/* Our Mission — paired feature block */}
          <div className="vision-block hover-lift" style={{ marginTop: '24px' }}>
            <div className="vision-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <div className="vision-text">
              <h3>{t('about.mission')}</h3>
              <p>{t('about.missionBody')}</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              className="btn-hero"
              style={{ background: 'var(--green-mid)', color: 'white', border: 'none', padding: '14px 32px', fontSize: '16px', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.35)' }}
              onClick={() => navigate('about')}
            >
              {t('home.aboutCta')} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>


      {/* 3. Services — What We Offer Today */}
      <section id="services" className="section">
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <h2 className="section-title section-title-center" style={{ marginBottom: '32px' }}>{t('home.offerTitle')}</h2>
          <div className="services-grid">
            <div className="service-card hover-lift" onClick={() => navigate('land-leasing')}>
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
                alt={t('home.landLeasing')}
                loading="lazy"
                style={{ width: 'calc(100% + 48px)', height: '150px', objectFit: 'cover', display: 'block', margin: '-28px -24px 18px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
              />
              <h3>{t('home.landLeasing')}</h3>
              <p>{t('home.landLeasingBody')}</p>
              <span className="service-card-link">{t('services.cta')} <span aria-hidden="true">→</span></span>
            </div>

            <div className="service-card hover-lift" onClick={() => navigate('equipment-rental')}>
              <img
                src="https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80"
                alt={t('home.equipmentRental')}
                loading="lazy"
                style={{ width: 'calc(100% + 48px)', height: '150px', objectFit: 'cover', display: 'block', margin: '-28px -24px 18px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
              />
              <h3>{t('home.equipmentRental')}</h3>
              <p>{t('home.equipmentRentalBody')}</p>
              <span className="service-card-link">{t('services.cta')} <span aria-hidden="true">→</span></span>
            </div>

            <div className="service-card hover-lift" onClick={() => navigate('labour')}>
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80"
                alt={t('home.labourServices')}
                loading="lazy"
                style={{ width: 'calc(100% + 48px)', height: '150px', objectFit: 'cover', display: 'block', margin: '-28px -24px 18px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
              />
              <h3>{t('home.labourServices')}</h3>
              <p>{t('home.labourServicesBody')}</p>
              <span className="service-card-link">{t('services.cta')} <span aria-hidden="true">→</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Farmers Choose Krishi Sangam */}
      <section className="section" style={{ background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <h2 className="section-title section-title-center" style={{ marginBottom: '32px' }}>{t('home.whyTitle')}</h2>
          <div className="why-grid">
            {WHY_CARDS.map((c) => (
              <div key={c.key} className="why-card hover-lift">
                <div className="why-card-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                <h4>{t(`home.${c.key}Title`)}</h4>
                <p>{t(`home.${c.key}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', marginTop: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title section-title-center" style={{ marginBottom: '32px' }}>{t('home.howItWorks')}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px' }}>
            {[
              { step: 1, title: t('home.step1'), icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
              { step: 2, title: t('home.step2'), icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { step: 3, title: t('home.step3'), icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { step: 4, title: t('home.step4'), icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
              { step: 5, title: t('home.step5'), icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
            ].map((s) => (
              <div key={s.step} style={{ flex: '1 1 180px', maxWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--green-mid)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', position: 'relative', zIndex: 2, boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)' }}>
                  {s.icon}
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '28px', height: '28px', background: 'var(--text-dark)', color: 'white', borderRadius: '50%', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>{s.step}</div>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-dark)', lineHeight: '1.5' }}>{s.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ marginTop: '32px' }}>
        <div style={{ position: 'relative', overflow: 'hidden', padding: '64px 40px', background: 'linear-gradient(135deg, rgba(20, 83, 45, 0.9), rgba(15, 63, 33, 0.93))', borderRadius: 'var(--radius-xl)', textAlign: 'center', color: 'white', boxShadow: '0 20px 40px rgba(22, 101, 52, 0.3)' }}>
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80"
            alt=""
            aria-hidden="true"
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '36px', color: 'white', marginBottom: '16px' }}>{t('home.ctaTitle')}</h2>
            <p style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto 32px', opacity: '0.95', lineHeight: '1.6' }}>
              {t('home.ctaBody')}
            </p>
            <button className="btn-hero" style={{ background: 'white', color: 'var(--green-dark)', padding: '16px 40px', fontSize: '18px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} onClick={handleGetStarted}>
              {t('home.ctaButton')}
            </button>
          </div>
        </div>
      </section>

      {/* Contact — above the footer */}
      <section id="contact" className="section" style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', marginTop: '32px', scrollMarginTop: '90px' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <h2 className="section-title section-title-center" style={{ marginBottom: '16px' }}>{t('contact.title')}</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-mid)', maxWidth: '680px', margin: '0 auto 32px', fontSize: '16px', lineHeight: '1.7' }}>
            {t('contact.subtitle')}
          </p>
          <ContactSection />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '64px 24px 32px', marginTop: '48px' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '32px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: 'white', fontSize: '24px', marginBottom: '15px' }}>Krishi Sangam</h3>
            <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>{t('home.footer.tagline')}</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('services'); }}>{t('nav.services')}</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('about'); }}>{t('home.footer.aboutUs')}</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); }}>{t('nav.contact')}</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('terms'); }}>{t('home.footer.terms')}</a>
            </div>
          </div>

          <div style={{ flex: '1 1 300px' }}>
            <h4 style={{ color: 'white', fontSize: '18px', marginBottom: '15px' }}>{t('home.footer.contact')}</h4>
            <p style={{ lineHeight: '1.6', marginBottom: '10px' }}>
              <strong>{t('home.footer.regOffice')}</strong><br />
              S.No. 192/2A & 2B, Cosmos, Horizen,<br />
              Pokharan Road No. 2, Wagle Industrial Estate,<br />
              Thane – 400604, Maharashtra.
            </p>
            <p style={{ marginBottom: '10px' }}><strong>{t('home.footer.phone')}</strong> +91-8828473778</p>
            <p><strong>{t('home.footer.email')}</strong> jaijaikuber@gmail.com</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingTop: '30px', fontSize: '14px' }}>
          {t('home.footer.rights')}
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}
