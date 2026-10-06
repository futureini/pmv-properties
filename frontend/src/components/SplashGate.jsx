import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Splash from '../pages/Splash.jsx';

const SEEN_KEY = 'pmv_splash_seen';

// Show the splash once per browser session, whichever link the visitor came
// from (WhatsApp, Facebook, Google...). Not shown for the admin panel, nor for
// search-engine / link-preview bots (they should see the real page at once).
function shouldShow(pathname) {
  if (typeof window === 'undefined') return false;
  if (pathname.startsWith('/admin')) return false;
  if (/bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview/i.test(navigator.userAgent)) return false;
  try {
    return !sessionStorage.getItem(SEEN_KEY);
  } catch {
    return false;
  }
}

export default function SplashGate() {
  const { pathname } = useLocation();
  // Decided once, on the very first render — client-side navigation later
  // never brings the splash back.
  const [show, setShow] = useState(() => shouldShow(pathname));

  useEffect(() => {
    if (!show) return undefined;
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-brand-dark" aria-hidden="true">
      <Splash />
    </div>
  );
}
