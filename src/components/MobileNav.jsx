import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Handles Android hardware back button via the History API popstate.
 * Also prevents overscroll / pull-to-refresh bounce on mobile.
 */
export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Block pull-to-refresh on Android Chrome
  useEffect(() => {
    const prevent = (e) => {
      if (e.touches.length === 1 && window.scrollY === 0) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  // Push a dummy state so the hardware back button pops it first
  // instead of immediately leaving the app
  useEffect(() => {
    window.history.pushState({ page: location.pathname }, '', location.pathname);

    const onPopState = (e) => {
      // If there's a React navigation stack, go back; otherwise do nothing
      if (window.history.state?.page) {
        navigate(-1);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [location.pathname]);

  return null;
}