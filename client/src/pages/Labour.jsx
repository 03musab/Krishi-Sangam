import { useState } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import BookLabourTeam from '../components/BookLabourTeam';
import ServiceBookingForm from '../components/ServiceBookingForm';
import AuthGateModal from '../components/AuthGateModal';
import Icon from '../components/Icon';
import { SERVICE_CATEGORIES } from '../data/services';

export default function Labour() {
  const { back } = useNav();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [flow, setFlow] = useState({ view: 'home', category: null, service: null });
  const [gateOpen, setGateOpen] = useState(false);

  // Requesting a labour team or service is a member action — logged-out
  // visitors can browse the categories but are asked to create an account first.
  const requireMember = (action) => {
    if (!user) { setGateOpen(true); return; }
    action();
  };

  if (flow.view === 'labour-team') {
    return <BookLabourTeam onBack={() => setFlow({ view: 'home' })} onSubmitted={() => setFlow({ view: 'home' })} />;
  }

  if (flow.view === 'service' && flow.category && flow.service) {
    return (
      <ServiceBookingForm
        category={flow.category}
        service={flow.service}
        onBack={() => setFlow({ view: 'category', category: flow.category })}
        onSubmitted={() => setFlow({ view: 'home' })}
      />
    );
  }

  if (flow.view === 'category' && flow.category) {
    const category = flow.category;
    return (
      <>
        <div className="service-booking-wrap">
          <div className="service-booking-head">
            <button className="btn-back-icon" onClick={() => setFlow({ view: 'home' })}>←</button>
            <span className="service-emoji"><Icon name={category.icon} size={40} /></span>
            <div>
              <h1 className="service-booking-title">{category.name}</h1>
              <p className="service-booking-subtitle">{category.tagline}</p>
            </div>
          </div>

          <div className="sub-service-list">
            {category.services.map((svc) => (
              <button
                key={svc.name}
                className="sub-service-item"
                onClick={() => requireMember(() => setFlow({ view: 'service', category, service: svc }))}
              >
                <div className="sub-service-main tip" data-tip={svc.desc}>
                  <span className="sub-service-name">{svc.name}</span>
                  <span className="sub-service-desc">{svc.desc}</span>
                </div>
                <span className="sub-service-arrow">›</span>
              </button>
            ))}
          </div>
        </div>

        {gateOpen && (
          <AuthGateModal
            title={t('labour.bookServices')}
            description={t('gate.labourDesc')}
            onClose={() => setGateOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="page-banner banner-purple">
        <button className="btn-back-icon" onClick={back} aria-label="Back">←</button>
        <h1 className="page-banner-title"><Icon name="worker" size={28} style={{ verticalAlign: '-6px', marginRight: '10px' }} />{t('labour.bookServices')}</h1>
      </div>

      {/* Book Labour Team — top option */}
      <div className="section labour-top-section">
        <button className="labour-team-card" onClick={() => requireMember(() => setFlow({ view: 'labour-team' }))}>
          <span className="labour-team-emoji"><Icon name="worker" size={44} /></span>
          <div className="labour-team-text">
            <h3>{t('labour.bookLabourTeam')}</h3>
            <p>{t('labour.teamSubtitleMatch')}</p>
            <span className="labour-team-link">{t('labour.bookNow')}</span>
          </div>
        </button>
      </div>

      {/* Agricultural Services — categories */}
      <section className="section agri-services-section">
        <h2 className="section-title"><Icon name="wheat" size={26} style={{ verticalAlign: '-4px', marginRight: '10px' }} />{t('labour.agriServices')}</h2>
        <p className="section-subtitle">{t('labour.pickCategory')}</p>
        <div className="service-category-grid">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="service-category-card"
              onClick={() => setFlow({ view: 'category', category: cat })}
            >
              <span className="service-category-emoji tip tip-left" data-tip={cat.desc || cat.tagline}><Icon name={cat.icon} size={34} /></span>
              <span className="service-category-name">{t(`cat.${cat.id}.name`, cat.name)}</span>
              <span className="service-category-tagline">{t(`cat.${cat.id}.tagline`, cat.tagline)}</span>
              <span className="service-category-count">{t('labour.xServices', { n: cat.services.length })}</span>
            </button>
          ))}
        </div>
      </section>

      {gateOpen && (
        <AuthGateModal
          title={t('labour.bookServices')}
          description={t('gate.labourDesc')}
          onClose={() => setGateOpen(false)}
        />
      )}
    </>
  );
}
