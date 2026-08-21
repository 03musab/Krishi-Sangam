import { useState, useEffect } from 'react';
import PageBanner from '../components/PageBanner';
import SmartFarmSelector from '../components/SmartFarmSelector';
import EscrowPaymentModal from '../components/EscrowPaymentModal';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getAgriServices, bookServiceSmart } from '../lib/api';

const CATEGORIES = [
  'All',
  'Land Preparation & Tilling',
  'Crop Protection & Drone Spraying',
  'Soil Testing & Nutrient Management',
  'Sowing, Planting & Nursery',
  'Irrigation & Water Systems',
  'Crop Harvesting & Threshing',
  'Post-Harvest & Storage',
  'Orchard & Vineyard Management',
  'Expert Advisory & Consultation'
];

const PRICING_LABELS = {
  per_acre: '/ Acre',
  per_hour: '/ Hour',
  per_day: '/ Day',
  fixed: ' Fixed'
};

export default function AgriculturalServices() {
  const { navigate } = useNav();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  // Booking modal state
  const [selectedService, setSelectedService] = useState(null);
  const [farmFor, setFarmFor] = useState('my_farm');
  const [farmDetails, setFarmDetails] = useState('');
  const [farmSize, setFarmSize] = useState('5');
  const [cropType, setCropType] = useState('Wheat');
  const [soilType, setSoilType] = useState('Black Soil');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLocation, setBookingLocation] = useState('');
  const [bookingCoords, setBookingCoords] = useState(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = '';
      if (activeCategory !== 'All') query += `category=${encodeURIComponent(activeCategory)}`;
      if (searchTerm) query += `${query ? '&' : ''}search=${encodeURIComponent(searchTerm)}`;
      if (districtFilter) query += `${query ? '&' : ''}district=${encodeURIComponent(districtFilter)}`;

      const res = await getAgriServices(query);
      setServices(res.listings || []);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [activeCategory, searchTerm, districtFilter]);

  const handleOpenBooking = (service) => {
    if (!user) {
      showToast(t('auth.loginRequired', 'Please log in or sign up to book agricultural services.'));
      navigate('signin');
      return;
    }
    setSelectedService(service);
    setBookingLocation(user.location || service.location || '');
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    setSubmittingBooking(true);
    try {
      const result = await bookServiceSmart({
        category: selectedService.category,
        service_name: selectedService.title,
        num_workers: selectedService.pricing_type === 'per_acre' ? Number(farmSize) : 1,
        start_date: startDate || null,
        location: bookingLocation || selectedService.location,
        lat: bookingCoords?.lat || null,
        lng: bookingCoords?.lng || null,
        service_details: [
          `Service: ${selectedService.title}`,
          farmSize ? `Farm Size: ${farmSize} Acres` : null,
          cropType ? `Crop: ${cropType}` : null,
          soilType ? `Soil: ${soilType}` : null,
          notes
        ].filter(Boolean).join(' • '),
        farm_for: farmFor,
        farm_details: farmDetails
      });

      showToast('🎉 Service request submitted! Provider matched successfully.');
      setCreatedBooking(result.booking || result.matched?.[0] || { price: selectedService.price, service_name: selectedService.title });
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <PageBanner
        title={t('agriServices.title', 'Agricultural Services Marketplace')}
        subtitle={t('agriServices.subtitle', 'Book certified drone spraying, soil testing, land prep, harvesting, and expert advisory services near you')}
        color="green"
      />

      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '24px 20px' }}>
        {/* Top Bar with dual CTAs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>🛠️ {t('agriServices.availableTitle', 'Available Services')}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
              {services.length} services found within your area
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn-hero"
              style={{ background: 'var(--green-mid)', color: 'white', border: 'none', padding: '10px 20px', fontSize: '0.95rem', borderRadius: '8px' }}
              onClick={() => navigate(user ? 'list-agri-service' : 'signin')}
            >
              ➕ {t('agriServices.listCta', 'List Your Service')}
            </button>
          </div>
        </div>

        {/* Search & District Filter Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search services, drones, land prep..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="text"
            className="form-input"
            placeholder="📍 Filter by District (e.g. Nashik, Pune)"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                border: activeCategory === cat ? '2px solid #16a34a' : '1px solid #cbd5e1',
                background: activeCategory === cat ? '#f0fdf4' : '#ffffff',
                color: activeCategory === cat ? '#15803d' : '#475569',
                fontWeight: activeCategory === cat ? '700' : '500',
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Listings Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            {t('common.loading', 'Loading agricultural services...')}
          </div>
        ) : services.length === 0 ? (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#334155' }}>No services found</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Be the first provider to list an agricultural service in this category!</p>
            <button
              type="button"
              className="btn-hero"
              style={{ background: 'var(--green-mid)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px' }}
              onClick={() => navigate(user ? 'list-agri-service' : 'signin')}
            >
              ➕ List Service Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {services.map((s) => (
              <div
                key={s.id}
                className="hover-lift"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
              >
                {s.photo_url ? (
                  <img
                    src={s.photo_url}
                    alt={s.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ height: '100px', background: 'linear-gradient(135deg, #10b981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem' }}>
                    🛠️
                  </div>
                )}

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px' }}>
                      {s.category}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '700' }}>
                      ★ {s.avg_rating || '5.0'} ({s.total_reviews || 0})
                    </span>
                  </div>

                  <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '700', lineHeight: '1.4' }}>
                    {s.title}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                    👤 {s.provider_name || 'Agri Specialist'} • 📍 {s.location}
                  </div>

                  {s.equipment_included && (
                    <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#334155', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                      ⚙️ <strong>Tools:</strong> {s.equipment_included}
                    </div>
                  )}

                  {s.description && (
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5', flex: 1 }}>
                      {s.description.slice(0, 110)}{s.description.length > 110 ? '...' : ''}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <div>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#16a34a' }}>
                        ₹{s.price.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px' }}>
                        {PRICING_LABELS[s.pricing_type] || '/ Job'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-hero"
                      style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
                      onClick={() => handleOpenBooking(s)}
                    >
                      Book Service →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedService && !createdBooking && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px'
        }}>
          <div className="modal-card" style={{
            background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%',
            padding: '24px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>🛠️ Book {selectedService.title}</h3>
              <button className="btn-close" onClick={() => setSelectedService(null)} style={{ border: 'none', background: 'transparent', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleConfirmBooking}>
              <SmartFarmSelector
                farmFor={farmFor}
                setFarmFor={setFarmFor}
                farmDetails={farmDetails}
                setFarmDetails={setFarmDetails}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label">Farm Size (Acres)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Crop Type</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Wheat, Grape"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label">Soil Type</label>
                  <select className="form-select" value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                    <option value="Black Soil">Black Soil</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Loamy Soil">Loamy Soil</option>
                    <option value="Sandy Soil">Sandy Soil</option>
                    <option value="Clay Soil">Clay Soil</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Service Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Job Notes & Specifications</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Specify pesticide type, deep tilling depth, or water source details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600' }}>Estimated Total Cost</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#15803d' }}>
                    ₹{(selectedService.price * (selectedService.pricing_type === 'per_acre' ? (Number(farmSize) || 1) : 1)).toLocaleString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#15803d', textAlign: 'right' }}>
                  🛡️ 100% Escrow Protected
                </div>
              </div>

              <button
                type="submit"
                className="btn-form-submit"
                style={{ width: '100%', background: '#16a34a', padding: '12px' }}
                disabled={submittingBooking}
              >
                {submittingBooking ? 'Submitting Request...' : 'Confirm & Request Service'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Escrow Modal after booking created */}
      {createdBooking && (
        <EscrowPaymentModal
          booking={createdBooking}
          onClose={() => {
            setCreatedBooking(null);
            setSelectedService(null);
            navigate('bookings');
          }}
          onSuccess={() => {
            setCreatedBooking(null);
            setSelectedService(null);
            navigate('bookings');
          }}
        />
      )}
    </div>
  );
}
