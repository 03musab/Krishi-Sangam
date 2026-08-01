import { NavProvider } from './context/NavContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import AppRouter from './components/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NavProvider>
          <Navbar />
          <main className="main-content">
            <AppRouter />
          </main>
        </NavProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
