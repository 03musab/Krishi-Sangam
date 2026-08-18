import { lazy, Suspense } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import PageLoader from './PageLoader';
import Icon from './Icon';

const Home = lazy(() => import('../pages/Home'));
const Services = lazy(() => import('../pages/Services'));
const LandLeasing = lazy(() => import('../pages/LandLeasing'));
const ListLand = lazy(() => import('../pages/ListLand'));
const EquipmentRental = lazy(() => import('../pages/EquipmentRental'));
const ListEquipment = lazy(() => import('../pages/ListEquipment'));
const Labour = lazy(() => import('../pages/Labour'));
const ListLabour = lazy(() => import('../pages/ListLabour'));
const Produce = lazy(() => import('../pages/Produce'));
const ListProduce = lazy(() => import('../pages/ListProduce'));
const Bookings = lazy(() => import('../pages/Bookings'));
const Messages = lazy(() => import('../pages/Messages'));
const Payments = lazy(() => import('../pages/Payments'));
const Profile = lazy(() => import('../pages/Profile'));
const Admin = lazy(() => import('../pages/Admin'));
const SignIn = lazy(() => import('../pages/SignIn'));
const SignUp = lazy(() => import('../pages/SignUp'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const About = lazy(() => import('../pages/About'));
const Terms = lazy(() => import('../pages/Terms'));
const Help = lazy(() => import('../pages/Help'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('../pages/RefundPolicy'));
const CancellationPolicy = lazy(() => import('../pages/CancellationPolicy'));
const ForFarmers = lazy(() => import('../pages/ForFarmers'));
const ForLandowners = lazy(() => import('../pages/ForLandowners'));
const ForEquipmentOwners = lazy(() => import('../pages/ForEquipmentOwners'));
const ForServiceProviders = lazy(() => import('../pages/ForServiceProviders'));
const AgriculturalServices = lazy(() => import('../pages/AgriculturalServices'));
const HowItWorks = lazy(() => import('../pages/HowItWorks'));
const FarmServices = lazy(() => import('../pages/FarmServices'));

const VIEWS = {
  home: Home,
  services: Services,
  'land-leasing': LandLeasing,
  'list-land': ListLand,
  'equipment-rental': FarmServices,
  'list-equipment': ListEquipment,
  labour: FarmServices,
  'farm-services': FarmServices,
  'list-labour': ListLabour,
  produce: Produce,
  'list-produce': ListProduce,
  bookings: Bookings,
  messages: Messages,
  payments: Payments,
  profile: Profile,
  admin: Admin,
  signin: SignIn,
  signup: SignUp,
  'forgot-password': ForgotPassword,
  about: About,
  terms: Terms,
  help: Help,
  privacy: PrivacyPolicy,
  'refund-policy': RefundPolicy,
  'cancellation-policy': CancellationPolicy,
  farmers: ForFarmers,
  landowners: ForLandowners,
  'equipment-owners': ForEquipmentOwners,
  'service-providers': ForServiceProviders,
  'agri-services': AgriculturalServices,
  'how-it-works': HowItWorks
};

// Service pages (land, equipment, labour) are browsable by everyone — logged-out
// visitors are asked to create an account when they try to view details or
// request a service (see AuthGateModal). Only the admin panel is members-only.
export default function AppRouter() {
  const { view, navigate } = useNav();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const ViewComponent = VIEWS[view] || Home;

  // Admin panel is restricted to users with the admin role.
  if (view === 'admin' && (!user || user.role !== 'admin')) {
    return (
      <div className="page-view" key={view}>
        {loading ? (
          <PageLoader />
        ) : (
          <div className="members-gate">
            <div className="members-gate-card">
              <div className="members-gate-icon" aria-hidden="true"><Icon name="shield" size={44} /></div>
              <span className="members-gate-badge"><Icon name="lock" size={13} style={{ verticalAlign: '-2px', marginRight: '6px' }} />{t('admin.denied')}</span>
              <h2 className="members-gate-title">{t('admin.denied')}</h2>
              <p className="members-gate-desc">{t('admin.deniedDesc')}</p>
              {!user ? (
                <button className="members-gate-btn" onClick={() => navigate('signin')}>
                  {t('nav.signin')} →
                </button>
              ) : (
                <button className="members-gate-btn" onClick={() => navigate('home')}>
                  {t('nav.home')} →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-view" key={view}>
      <Suspense fallback={<PageLoader />}>
        <ViewComponent />
      </Suspense>
    </div>
  );
}
