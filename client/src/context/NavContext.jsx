import { createContext, useCallback, useContext, useState, useTransition } from 'react';

const NavContext = createContext(null);

export function NavProvider({ children }) {
  const [view, setView] = useState('home');
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback((viewName, params = {}) => {
    // Non-blocking view switch keeps the UI responsive while the new page loads
    startTransition(() => setView(viewName));
    if (params.onLoaded) setTimeout(params.onLoaded, 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <NavContext.Provider value={{ view, isPending, navigate }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
