import PageBanner from '../components/PageBanner';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Icon from '../components/Icon';

export default function AboutFarmServices() {
  const { navigate } = useNav();
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="about-page-wrap" style={{ paddingBottom: '60px' }}>
      <PageBanner
        title={t('aboutFarm.bannerTitle', 'About Farm Services')}
        color="green"
      />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 20px' }}>

        {/* Hero Introduction */}
        <section style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: '16px',
          padding: '32px',
          marginTop: '28px',
          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.06)'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="tractor" size={26} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#1e3a8a', fontWeight: '800' }}>
                {t('aboutFarm.heroTitle', 'Complete Farm Machinery, Labour & Service Network')}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#1d4ed8', fontSize: '1rem', fontWeight: '500' }}>
                {t('aboutFarm.heroSub', 'Equipment Rentals with Operators, Skilled Worker Teams & Drone Technology')}
              </p>
            </div>
          </div>

          <p style={{ fontSize: '1.02rem', lineHeight: '1.7', color: '#334155', margin: '16px 0 24px 0' }}>
            {t('aboutFarm.heroDesc', 'Krishi Sangam’s Farm Services ecosystem connects farmers directly with local equipment owners, agricultural worker groups, and professional service providers. Whether you need a 75 HP tractor with a rotavator and operator, a 10-person labour team for harvesting, or precision drone spraying, our 25 km smart matching engine connects you with verified providers immediately.')}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn-hero"
              style={{ background: '#2563eb', color: 'white', padding: '12px 24px', fontSize: '0.95rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
              onClick={() => navigate('farm-services')}
            >
              🚜 {t('aboutFarm.exploreCta', 'Explore Farm Services')}
            </button>
            <button
              className="btn-hero"
              style={{ background: '#ffffff', color: '#1d4ed8', border: '2px solid #2563eb', padding: '12px 24px', fontSize: '0.95rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
              onClick={() => {
                if (!user) { navigate('signup'); return; }
                navigate('list-equipment');
              }}
            >
              🛠️ {t('aboutFarm.registerCta', 'Register as a Provider')}
            </button>
          </div>
        </section>

        {/* 3 Core Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '36px' }}>
          
          {/* 1. Equipment Rental */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Icon name="tractor" size={22} />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1e293b' }}>{t('aboutFarm.p1Title', '1. Equipment Rental ("Tractor + Operator Always")')}</h3>
            <ul style={{ paddingLeft: '18px', margin: 0, color: '#475569', lineHeight: '1.7', fontSize: '0.94rem' }}>
              <li>{t('aboutFarm.p1L1', 'Tractors are ALWAYS supplied WITH an experienced driver/operator.')}</li>
              <li>{t('aboutFarm.p1L2', 'Filter by Horsepower (HP), Attachment (rotavator, plough, seed drill, harvester), and date.')}</li>
              <li>{t('aboutFarm.p1L3', 'Smart 25 km radius matching finds nearby available machinery.')}</li>
            </ul>
          </div>

          {/* 2. Labour Booking */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3e8ff', color: '#6b21a8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Icon name="worker" size={22} />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1e293b' }}>{t('aboutFarm.p2Title', '2. Labour Worker Teams')}</h3>
            <ul style={{ paddingLeft: '18px', margin: 0, color: '#475569', lineHeight: '1.7', fontSize: '0.94rem' }}>
              <li>{t('aboutFarm.p2L1', 'Capacity matching: Request exact worker count (num_workers) needed for your farm.')}</li>
              <li>{t('aboutFarm.p2L2', 'Matches verified labour teams whose registered team size >= requested workers.')}</li>
              <li>{t('aboutFarm.p2L3', 'Experienced crew for sowing, weeding, harvesting, spraying, and irrigation.')}</li>
            </ul>
          </div>

          {/* 3. Professional Services */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Icon name="drone" size={22} />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1e293b' }}>{t('aboutFarm.p3Title', '3. Professional Services & Drone Tech')}</h3>
            <ul style={{ paddingLeft: '18px', margin: 0, color: '#475569', lineHeight: '1.7', fontSize: '0.94rem' }}>
              <li>{t('aboutFarm.p3L1', 'Category-based booking for Land Prep, Drone Spraying, Soil Testing, and Harvesting.')}</li>
              <li>{t('aboutFarm.p3L2', 'Service-specific custom questions (soil type, crop stage, chemical/bio type).')}</li>
              <li>{t('aboutFarm.p3L3', 'Calendar availability checks ensure zero double-booking on chosen dates.')}</li>
            </ul>
          </div>

        </div>

        {/* Security & OTP Feature */}
        <section style={{
          marginTop: '40px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '14px',
          padding: '28px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="shield" size={22} /> {t('aboutFarm.secTitle', '100% Protected Escrow & OTP Work Verification')}
          </h3>
          <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: '1.7', margin: 0 }}>
            {t('aboutFarm.secBody', 'Every farm service booking is protected by the Krishi Escrow ledger. When a booking is confirmed, funds are securely deposited in Escrow. The farmer receives a 4-digit OTP; the provider must enter the OTP on-site to start work (In Progress). Upon completion, funds are released safely to the provider and the farmer can rate the service 1-5 stars.')}
          </p>
        </section>

      </div>
    </div>
  );
}
