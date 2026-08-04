import { lazy, Suspense } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import PageLoader from './PageLoader';
import MembersGate from './MembersGate';

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
const About = lazy(() => import('../pages/About'));
const Terms = lazy(() => import('../pages/Terms'));

const VIEWS = {
  home: Home,
  services: Services,
  'land-leasing': LandLeasing,
  'list-land': ListLand,
  'equipment-rental': EquipmentRental,
  'list-equipment': ListEquipment,
  labour: Labour,
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
  about: About,
  terms: Terms
};

// Views shown only to signed-in users. Logged-out visitors get a short
// description plus a Sign Up CTA instead of the actual content.
const MEMBERS_ONLY_VIEWS = {
  'land-leasing': { icon: 'wheat', titleKey: 'land.title', descKey: 'services.landBody', color: 'green' },
  'equipment-rental': { icon: 'tractor', titleKey: 'equip.title', descKey: 'services.equipmentBody', color: 'orange' },
  labour: { icon: 'worker', titleKey: 'labour.bookServices', descKey: 'services.labourBody', color: 'purple' }
};

export default function AppRouter() {
  const { view } = useNav();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const ViewComponent = VIEWS[view] || Home;
  const gate = MEMBERS_ONLY_VIEWS[view];

  if (gate && !user) {
    return (
      <div className="page-view" key={view}>
        {loading ? (
          <PageLoader />
        ) : (
          <MembersGate
            icon={gate.icon}
            title={t(gate.titleKey)}
            description={t(gate.descKey)}
            color={gate.color}
          />
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
