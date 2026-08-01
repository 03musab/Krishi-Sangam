import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { navigate } = useNav();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('profile');
    } else {
      navigate('signup');
    }
  };

  return (
    <div>
      {/* Hero Section */}
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
            India’s Digital Bridge for Farmers, Buyers, and Agricultural Services
          </h1>
          <p className="hero-subtitle" style={{ fontSize: 'clamp(16px, 2vw, 20px)', marginTop: '24px', lineHeight: '1.6' }}>
            Krishi Setu connects farmers with verified buyers, farm equipment, agricultural services, storage solutions, financial support, and expert guidance, making farming more profitable, transparent, and accessible.
          </p>
          <div className="hero-actions" style={{ marginTop: '40px' }}>
            <button className="btn-hero" style={{ background: 'var(--green-mid)', color: 'white', border: 'none', padding: '14px 32px' }} onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="btn-hero btn-outline" style={{ padding: '14px 32px' }} onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}>
              Explore Services
            </button>
          </div>
        </div>
      </section>

      {/* What is Krishi Setu? */}
      <section className="section" style={{ textAlign: 'center', maxWidth: '800px', margin: '40px auto 20px' }}>
        <h2 className="section-title" style={{ display: 'inline-block' }}>What is Krishi Setu?</h2>
        <h3 style={{ fontSize: '24px', color: 'var(--green-dark)', marginTop: '10px' }}>Agriculture Made Simple.</h3>
        <p style={{ fontSize: '18px', color: 'var(--text-mid)', marginTop: '20px', lineHeight: '1.8' }}>
          Krishi Setu is a digital platform connecting farmers with trusted land leasing, equipment, and services. We make farming simpler, faster, and more accessible for everyone.
        </p>
      </section>

      {/* What We Offer Today */}
      <section id="services" className="section" style={{ background: 'var(--surface-2)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>What We Offer Today</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            
            <div style={{ background: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s', cursor: 'pointer', color: 'var(--text-dark)' }} onClick={() => navigate('land-leasing')} className="hover-lift">
              <div style={{ color: 'var(--green-mid)', marginBottom: '20px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
              </div>
              <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>Land Leasing</h3>
              <p style={{ color: 'var(--text-mid)', lineHeight: '1.6' }}>
                Connect landowners and farmers through a secure platform to lease agricultural land with transparency and ease. Whether you’re looking to lease your land or find farmland for cultivation, Krishi Setu simplifies the process.
              </p>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s', cursor: 'pointer', color: 'var(--text-dark)' }} onClick={() => navigate('equipment-rental')} className="hover-lift">
              <div style={{ color: 'var(--accent-orange)', marginBottom: '20px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
              </div>
              <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>Equipment Rental</h3>
              <p style={{ color: 'var(--text-mid)', lineHeight: '1.6' }}>
                Access tractors, harvesters, rotavators, seed drills, sprayers, and other essential farm machinery from verified equipment owners. Reduce costs by renting the equipment you need, when you need it.
              </p>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s', cursor: 'pointer', color: 'var(--text-dark)' }} onClick={() => navigate('labour')} className="hover-lift">
              <div style={{ color: 'var(--accent-blue)', marginBottom: '20px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>Agricultural Labour & Farm Services</h3>
              <p style={{ color: 'var(--text-mid)', lineHeight: '1.6' }}>
                Find trusted agricultural workers and service providers for sowing, harvesting, spraying, irrigation, land preparation, and other farming activities, all in one place.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Coming Soon & Why Choose */}
      <section className="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', alignItems: 'start' }}>
        
        <div style={{ padding: '40px', background: 'linear-gradient(135deg, var(--green-pale), #dbeafe)', borderRadius: 'var(--radius-lg)' }}>
          <h2 className="section-title" style={{ marginBottom: '20px' }}>Coming Soon</h2>
          <p style={{ marginBottom: '25px', color: 'var(--text-mid)', fontSize: '16px' }}>
            Krishi Setu is continuously expanding to become India’s complete agricultural ecosystem. Upcoming services include:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px', fontWeight: '500' }}>
              <span style={{ color: 'var(--green-mid)', display: 'flex' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></span> Seeds, Fertilizers & Farm Inputs
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px', fontWeight: '500' }}>
              <span style={{ color: 'var(--accent-orange)', display: 'flex' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></span> Buy & Sell Crops Marketplace
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px', fontWeight: '500' }}>
              <span style={{ color: 'var(--accent-blue)', display: 'flex' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span> Storage & Cold Chain Logistics
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px', fontWeight: '500' }}>
              <span style={{ color: 'var(--accent-gold)', display: 'flex' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span> Financial Support, Loans & Insurance
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px', fontWeight: '500' }}>
              <span style={{ color: 'var(--text-dark)', display: 'flex' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span> Expert Agricultural Consultation & Advisory
            </li>
          </ul>
        </div>

        <div>
          <h2 className="section-title">Why Farmers Choose Krishi Setu</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '30px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--green-light)', color: 'var(--green-dark)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h4 style={{ fontSize: '18px', marginBottom: '6px' }}>Verified Network</h4>
                <p style={{ color: 'var(--text-mid)', fontSize: '15px' }}>Every service provider and business goes through verification for greater trust and transparency.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '50px', height: '50px', background: '#fef3c7', color: '#b45309', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <h4 style={{ fontSize: '18px', marginBottom: '6px' }}>Save Time</h4>
                <p style={{ color: 'var(--text-mid)', fontSize: '15px' }}>Reduce the effort spent searching for machinery, labor, and agricultural services.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '50px', height: '50px', background: '#ede9fe', color: 'var(--accent-purple)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <h4 style={{ fontSize: '18px', marginBottom: '6px' }}>Built for Every Farmer</h4>
                <p style={{ color: 'var(--text-mid)', fontSize: '15px' }}>Whether you own 2 acres or 200 acres, Krishi Setu is designed for farms of every size.</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'white', padding: '60px 24px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', marginTop: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title" style={{ display: 'inline-block', marginBottom: '50px' }}>How It Works</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px' }}>
            
            {[
              { step: 1, title: 'Create your free account.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
              { step: 2, title: 'Select the service you need.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { step: 3, title: 'Connect with verified providers.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { step: 4, title: 'Complete transaction securely.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
              { step: 5, title: 'Rate your experience.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
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
      <section className="section" style={{ marginTop: '20px' }}>
        <div style={{ padding: '60px 40px', background: 'linear-gradient(135deg, var(--green-dark), #0f3f21)', borderRadius: 'var(--radius-xl)', textAlign: 'center', color: 'white', boxShadow: '0 20px 40px rgba(22, 101, 52, 0.3)' }}>
          <h2 style={{ fontSize: '36px', color: 'white', marginBottom: '20px' }}>Join the Future of Agriculture</h2>
          <p style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto 35px', opacity: '0.9', lineHeight: '1.6' }}>
            Whether you’re a farmer, landowner, equipment owner, or agricultural service provider, Krishi Setu helps you connect, grow, and succeed.
          </p>
          <button className="btn-hero" style={{ background: 'white', color: 'var(--green-dark)', padding: '16px 40px', fontSize: '18px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} onClick={handleGetStarted}>
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '60px 24px 30px', marginTop: '60px' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '40px' }}>
          
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: 'white', fontSize: '24px', marginBottom: '15px' }}>Krishi Sangam</h3>
            <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>Empowering farmers with a complete digital agricultural ecosystem.</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('about'); }}>About Us</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('terms'); }}>Terms & Conditions</a>
            </div>
          </div>

          <div style={{ flex: '1 1 300px' }}>
            <h4 style={{ color: 'white', fontSize: '18px', marginBottom: '15px' }}>Contact Us</h4>
            <p style={{ lineHeight: '1.6', marginBottom: '10px' }}>
              <strong>Registered Office:</strong><br />
              S.No. 192/2A & 2B, Cosmos, Horizen,<br />
              Pokharan Road No. 2, Wagle Industrial Estate,<br />
              Thane – 400604, Maharashtra.
            </p>
            <p style={{ marginBottom: '10px' }}><strong>Phone:</strong> +91-8828473778</p>
            <p><strong>Email:</strong> jaijaikuber@gmail.com</p>
          </div>
          
        </div>
        <div style={{ textAlign: 'center', paddingTop: '30px', fontSize: '14px' }}>
          &copy; 2026 Krishi Setu. All rights reserved.
        </div>
      </footer>
      
      <style>{`
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

