import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition } from 'react';

const NavContext = createContext(null);

// Read the initial view from the URL hash (e.g. #land-leasing), defaulting to 'home'.
function getViewFromHash() {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#/, '');
  return hash || 'home';
}

export function NavProvider({ children }) {
  const [view, setView] = useState(getViewFromHash);
  const [isPending, startTransition] = useTransition();
  const historyRef = useRef([]);   // stack of previous views (for back navigation)
  const viewRef = useRef(getViewFromHash());  // latest committed view
  const [canGoBack, setCanGoBack] = useState(false);

  // Sync the URL hash whenever the view changes.
  // Also listen for browser back/forward buttons via hashchange.
  useEffect(() => {
    const handleHashChange = () => {
      const hashView = getViewFromHash();
      if (hashView !== viewRef.current) {
        // The user pressed browser back/forward — treat it like a push so
        // the internal history stack stays in sync with the browser's.
        historyRef.current = [...historyRef.current, viewRef.current];
        viewRef.current = hashView;
        setCanGoBack(historyRef.current.length > 0);
        startTransition(() => setView(hashView));
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigate = useCallback((viewName, params = {}) => {
    // Only remember the previous view when it differs from the new one,
    // so consecutive navigations to the same page don't bloat the stack.
    if (viewName !== viewRef.current) {
      if (params.replace) {
        // Replace: swap the top of the stack instead of pushing (used by
        // auto-redirects like the profile sign-in guard, so Back returns to
        // the page the user was on before the redirect chain began).
        historyRef.current = historyRef.current.slice(0, -1);
      } else {
        historyRef.current = [...historyRef.current, viewRef.current];
      }
    }
    viewRef.current = viewName;
    setCanGoBack(historyRef.current.length > 0);

    // Update the URL hash so the view survives page refresh.
    // Use replaceState when params.replace is set so we don't create extra browser history entries.
    const hash = '#' + viewName;
    if (params.replace) {
      window.history.replaceState(null, '', hash);
    } else {
      window.history.pushState(null, '', hash);
    }

    // Non-blocking view switch keeps the UI responsive while the new page loads
    startTransition(() => setView(viewName));
    if (params.onLoaded) setTimeout(params.onLoaded, 0);
    scrollTop();
  }, [scrollTop]);

  const back = useCallback(() => {
    if (historyRef.current.length === 0) {
      navigate('home');
      return;
    }
    const prev = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    viewRef.current = prev;
    setCanGoBack(historyRef.current.length > 0);
    startTransition(() => setView(prev));
    scrollTop();
  }, [navigate, scrollTop]);

  return (
    <NavContext.Provider value={{ view, isPending, navigate, back, canGoBack }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
