import { NavProvider, useNav } from './context/NavContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './i18n/LanguageContext';
import Navbar from './components/Navbar';
import AppRouter from './components/AppRouter';

// Thin animated bar shown at the top while a route transition is pending
function NavProgress() {
  const { isPending } = useNav();
  return <div className={`nav-progress ${isPending ? 'active' : ''}`} aria-hidden="true" />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <NavProvider>
            <NavProgress />
            <Navbar />
            <main className="main-content">
              <AppRouter />
            </main>
          </NavProvider>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
