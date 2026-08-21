import PageBanner from '../components/PageBanner';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Icon from '../components/Icon';

export default function AboutLandLeasing() {
  const { navigate } = useNav();
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="about-page-wrap" style={{ paddingBottom: '60px' }}>
      <PageBanner
        title={t('aboutLand.bannerTitle', 'About Land Leasing')}
        color="green"
      />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 20px' }}>

        {/* Hero Introduction */}
        <section style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '16px',
          padding: '32px',
          marginTop: '28px',
          boxShadow: '0 4px 16px rgba(22, 101, 52, 0.06)'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="leaf" size={26} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#14532d', fontWeight: '800' }}>
                {t('aboutLand.heroTitle', 'Transparent & Secure Farmland Leasing')}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#166534', fontSize: '1rem', fontWeight: '500' }}>
                {t('aboutLand.heroSub', 'Connecting Landowners & Farmers Directly Across India')}
              </p>
            </div>
          </div>

          <p style={{ fontSize: '1.02rem', lineHeight: '1.7', color: '#334155', margin: '16px 0 24px 0' }}>
            {t('aboutLand.heroDesc', 'Krishi Sangam’s Land Leasing module is built to eliminate traditional agricultural delays, hidden brokerage fees, and unverified land contracts. We enable verified landowners to list idle or available agricultural land while giving farmers easy access to fertile farmland with complete clarity on soil quality, water source, and lease pricing.')}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn-hero"
              style={{ background: '#16a34a', color: 'white', padding: '12px 24px', fontSize: '0.95rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
              onClick={() => navigate('land-leasing')}
            >
              🌾 {t('aboutLand.browseCta', 'Browse Land Listings')}
            </button>
            <button
              className="btn-hero"
              style={{ background: '#ffffff', color: '#15803d', border: '2px solid #16a34a', padding: '12px 24px', fontSize: '0.95rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
              onClick={() => {
                if (!user) { navigate('signup'); return; }
                navigate('list-land');
              }}
            >
              📍 {t('aboutLand.listCta', 'List Your Land for Lease')}
            </button>
          </div>
        </section>

        {/* Benefits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '36px' }}>
          
          {/* For Farmers */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.8rem' }}>👨‍🌾</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{t('aboutLand.farmersTitle', 'For Farmers (Lessees)')}</h3>
            </div>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.8', fontSize: '0.96rem' }}>
              <li><strong>{t('aboutLand.f1Bold', 'Verified Land Specs:')}</strong> {t('aboutLand.f1Body', 'View exact acreage, soil type (Black Regur, Red, Sandy, Loamy), and water sources (Borewell, Canal, River, Well).')}</li>
              <li><strong>{t('aboutLand.f2Bold', 'Proximity Sorting:')}</strong> {t('aboutLand.f2Body', 'Locate farmland closest to your village using smart 25 km Haversine sorting.')}</li>
              <li><strong>{t('aboutLand.f3Bold', 'Flexible Leases:')}</strong> {t('aboutLand.f3Body', 'Choose seasonal (Kharif/Rabi), monthly, or multi-year lease agreements.')}</li>
              <li><strong>{t('aboutLand.f4Bold', 'Direct Negotiation:')}</strong> {t('aboutLand.f4Body', 'Connect directly with verified landowners without broker margins.')}</li>
            </ul>
          </div>

          {/* For Landowners */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.8rem' }}>🏞️</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{t('aboutLand.ownersTitle', 'For Landowners (Lessors)')}</h3>
            </div>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.8', fontSize: '0.96rem' }}>
              <li><strong>{t('aboutLand.o1Bold', 'Monetise Idle Land:')}</strong> {t('aboutLand.o1Body', 'Earn reliable, transparent rental income from verified local farmers.')}</li>
              <li><strong>{t('aboutLand.o2Bold', 'Tenant Trust Verification:')}</strong> {t('aboutLand.o2Body', 'Access tenant profiles and user ratings before agreeing to lease terms.')}</li>
              <li><strong>{t('aboutLand.o3Bold', 'Custom Pricing:')}</strong> {t('aboutLand.o3Body', 'Set per-season or per-year lease rates, security deposits, and crop restrictions.')}</li>
              <li><strong>{t('aboutLand.o4Bold', 'Admin Quality Approval:')}</strong> {t('aboutLand.o4Body', 'Every listing is reviewed by admin to maintain high network trust.')}</li>
            </ul>
          </div>
        </div>

        {/* 4-Step Process */}
        <section style={{ marginTop: '44px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.5rem', color: '#1e293b', marginBottom: '24px', fontWeight: '800' }}>
            {t('aboutLand.stepsHeader', 'How Land Leasing Works on Krishi Sangam')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>1</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>{t('aboutLand.s1Title', 'Search & Filter')}</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>{t('aboutLand.s1Body', 'Filter nearby farmland by size, soil type, and irrigation source.')}</p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>2</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>{t('aboutLand.s2Title', 'Inspect Specs')}</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>{t('aboutLand.s2Body', 'Review land location coordinates, photos, and owner contact options.')}</p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>3</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>{t('aboutLand.s3Title', 'Contact Landowner')}</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>{t('aboutLand.s3Body', 'Call or message the landowner directly to schedule a site visit.')}</p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#16a34a', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>4</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>{t('aboutLand.s4Title', 'Start Farming')}</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>{t('aboutLand.s4Body', 'Finalise the transparent agreement and begin cultivation smoothly.')}</p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
