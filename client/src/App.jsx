import { NavProvider, useNav } from './context/NavContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/Navbar';
import AppRouter from './components/AppRouter';
import WhatsAppButton from './components/WhatsAppButton';

// Thin animated bar shown at the top while a route transition is pending
function NavProgress() {
  const { isPending } = useNav();
  return <div className={`nav-progress ${isPending ? 'active' : ''}`} aria-hidden="true" />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <ToastProvider>
            <NavProvider>
              <NavProgress />
              <Navbar />
              <main className="main-content">
                <AppRouter />
              </main>
              <WhatsAppButton />
            </NavProvider>
          </ToastProvider>
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
