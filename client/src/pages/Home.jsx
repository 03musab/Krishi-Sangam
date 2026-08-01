import { useNav } from '../context/NavContext';

export default function Home() {
  const { navigate } = useNav();

  const heroActions = [
    { id: 'findLandBtn', icon: <rect x="3" y="3" width="18" height="18" rx="2"/>, label: 'Find Land', view: 'land-leasing' },
    { id: 'findEquipmentBtn', icon: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></>, label: 'Find Equipment', view: 'equipment-rental' },
    { id: 'findProfessionalsBtn', icon: <><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></>, label: 'Find Professionals', view: 'labour' }
  ];

  const quickActions = [
    { id: 'actionSellProduce', img: 'https://images.unsplash.com/photo-1571771894824-269f85b51621?auto=format&fit=crop&w=600&q=80', badge: 'Sell Produce', view: 'list-produce' },
    { id: 'actionListLand', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80', badge: 'List Your Land', view: 'list-land' },
    { id: 'actionListEquipment', img: 'https://images.unsplash.com/photo-1615254849233-531de933076a?auto=format&fit=crop&w=600&q=80', badge: 'List Equipment', view: 'list-equipment' },
    { id: 'actionFarmLabour', img: 'https://images.unsplash.com/photo-1591785363533-a7b165383149?auto=format&fit=crop&w=600&q=80', badge: 'Farm Labour Services', view: 'list-labour' }
  ];

  return (
    <>
      <section className="hero-section">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1170&q=80" alt="Lush green farm field" className="hero-img" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Krishi Sangam</h1>
          <p className="hero-subtitle">Connecting Farmers, Land &amp; Equipment</p>
          <div className="hero-actions">
            {heroActions.map((a) => (
              <button key={a.id} className="btn-hero btn-outline" onClick={() => navigate(a.view)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{a.icon}</svg>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((a) => (
            <div key={a.id} className="action-card" onClick={() => navigate(a.view)}>
              <img src={a.img} alt={a.badge} className="action-img" />
              <div className="action-overlay"><div className="action-icon-badge">{a.badge}</div></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
