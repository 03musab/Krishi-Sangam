import { useState } from 'react';
import { useNav } from '../context/NavContext';
import BookLabourTeam from '../components/BookLabourTeam';
import ServiceBookingForm from '../components/ServiceBookingForm';
import { SERVICE_CATEGORIES } from '../data/services';

export default function Labour() {
  const { navigate } = useNav();
  const [flow, setFlow] = useState({ view: 'home', category: null, service: null });

  if (flow.view === 'labour-team') {
    return <BookLabourTeam />;
  }

  if (flow.view === 'service' && flow.category && flow.service) {
    return <ServiceBookingForm category={flow.category} service={flow.service} />;
  }

  if (flow.view === 'category' && flow.category) {
    const category = flow.category;
    return (
      <>
        <div className="service-booking-wrap">
          <div className="service-booking-head">
            <button className="btn-back-icon" onClick={() => setFlow({ view: 'home' })}>←</button>
            <span className="service-emoji">{category.emoji}</span>
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
                onClick={() => setFlow({ view: 'service', category, service: svc })}
              >
                <div className="sub-service-main">
                  <span className="sub-service-name">{svc.name}</span>
                  <span className="sub-service-desc">{svc.desc}</span>
                </div>
                <span className="sub-service-arrow">›</span>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-banner banner-purple">
        <button className="btn-back-icon" onClick={() => navigate('home')}>←</button>
        <h1 className="page-banner-title">👷 Book Services</h1>
        <button
          className="banner-action-btn purple"
          onClick={() => setFlow({ view: 'labour-team' })}
        >
          + Book Labour Team
        </button>
      </div>

      {/* Book Labour Team — top option */}
      <div className="section labour-top-section">
        <button className="labour-team-card" onClick={() => setFlow({ view: 'labour-team' })}>
          <span className="labour-team-emoji">👷</span>
          <div className="labour-team-text">
            <h3>Book Labour Team</h3>
            <p>Hire farm workers on a daily basis. Choose workers, team type, skill level, date &amp; farm location.</p>
            <span className="labour-team-link">Book Now →</span>
          </div>
        </button>
      </div>

      {/* Agricultural Services — categories */}
      <section className="section agri-services-section">
        <h2 className="section-title">🌾 Agricultural Services</h2>
        <p className="section-subtitle">Pick a service category to explore available options</p>
        <div className="service-category-grid">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="service-category-card"
              onClick={() => setFlow({ view: 'category', category: cat })}
            >
              <span className="service-category-emoji">{cat.emoji}</span>
              <span className="service-category-name">{cat.name}</span>
              <span className="service-category-tagline">{cat.tagline}</span>
              <span className="service-category-count">{cat.services.length} services</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
