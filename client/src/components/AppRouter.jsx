import { lazy, Suspense } from 'react';
import { useNav } from '../context/NavContext';
import PageLoader from './PageLoader';

const Home = lazy(() => import('../pages/Home'));
const Services = lazy(() => import('../pages/Services'));
const Contact = lazy(() => import('../pages/Contact'));
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
  contact: Contact,
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

export default function AppRouter() {
  const { view } = useNav();
  const ViewComponent = VIEWS[view] || Home;
  return (
    <div className="page-view" key={view}>
      <Suspense fallback={<PageLoader />}>
        <ViewComponent />
      </Suspense>
    </div>
  );
}
