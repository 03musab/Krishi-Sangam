import { useNav } from '../context/NavContext';
import Home from '../pages/Home';
import LandLeasing from '../pages/LandLeasing';
import ListLand from '../pages/ListLand';
import EquipmentRental from '../pages/EquipmentRental';
import ListEquipment from '../pages/ListEquipment';
import Labour from '../pages/Labour';
import ListLabour from '../pages/ListLabour';
import Produce from '../pages/Produce';
import ListProduce from '../pages/ListProduce';
import Bookings from '../pages/Bookings';
import Messages from '../pages/Messages';
import Payments from '../pages/Payments';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';

const VIEWS = {
  home: Home,
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
  signup: SignUp
};

export default function AppRouter() {
  const { view } = useNav();
  const ViewComponent = VIEWS[view] || Home;
  return <ViewComponent key={view} />;
}
