import { useNav } from '../context/NavContext';

export default function About() {
  const { navigate } = useNav();

  return (
    <div style={{ paddingBottom: '60px' }}>
      <section className="section" style={{ background: 'var(--surface-2)', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-dark)' }}>About Us</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-mid)', marginTop: '20px', maxWidth: '800px', margin: '20px auto 0' }}>
          Discover the vision, mission, and people behind Krishi Setu.
        </p>
      </section>

      <section className="section" style={{ maxWidth: '900px', margin: '40px auto' }}>
        <h2 className="section-title">What is Krishi Setu?</h2>
        <p style={{ fontSize: '16px', color: 'var(--text-mid)', lineHeight: '1.8' }}>
          Krishi Setu is a digital platform that connects farmers with trusted land leasing, farm equipment, and agricultural services, making farming simpler, faster, and more accessible.
        </p>
      </section>

      <section className="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', maxWidth: '900px', margin: '0 auto 40px' }}>
        <div style={{ padding: '40px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--accent-orange)', marginBottom: '15px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>Our Mission</h3>
          <p style={{ color: 'var(--text-mid)', lineHeight: '1.6' }}>
            We aim to improve farmers’ livelihoods by making agricultural services, equipment, markets, finance, and knowledge easily accessible through one digital platform.
          </p>
        </div>
        <div style={{ padding: '40px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--accent-blue)', marginBottom: '15px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>Impact We Want to Create</h3>
          <p style={{ color: 'var(--text-mid)', lineHeight: '1.6' }}>
            To become India’s most trusted agricultural ecosystem by connecting every stakeholder in the farming value chain through technology, ensuring profitability and transparency for all.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'white', padding: '60px 24px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', maxWidth: '900px', margin: '0 auto 40px' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Meet the Founder</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--green-light)', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', color: 'var(--text-dark)' }}>Rushabh Jadhav</h3>
            <p style={{ color: 'var(--green-dark)', fontWeight: '600', marginBottom: '20px' }}>Founder, Krishi Setu</p>
            <div style={{ color: 'var(--text-mid)', fontSize: '16px', lineHeight: '1.8', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>
                Raised with deep roots in agriculture, Rushabh founded Krishi Setu to address the everyday challenges faced by India’s farming community. His paternal grandfather served as an Agriculture Officer, while his maternal grandfather was both a farmer and Chairman of the Agricultural Produce Market Committee (APMC). Growing up around farming and the agricultural ecosystem gave him firsthand insight into the challenges faced by farmers, landowners, and agricultural service providers.
              </p>
              <p>
                Combining his background in Business Analytics with his passion for technology and agriculture, Rushabh founded Krishi Setu with a vision to build a trusted digital platform that simplifies land leasing, farm equipment rentals, and agricultural services, while creating a connected ecosystem for Indian agriculture.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
