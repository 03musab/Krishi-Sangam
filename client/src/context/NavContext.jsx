import { createContext, useCallback, useContext, useState } from 'react';

const NavContext = createContext(null);

export function NavProvider({ children }) {
  const [view, setView] = useState('home');

  const navigate = useCallback((viewName, params = {}) => {
    setView(viewName);
    if (params.onLoaded) setTimeout(params.onLoaded, 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <NavContext.Provider value={{ view, navigate }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
