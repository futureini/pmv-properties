import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import splashBg from '../assets/splash-bg.jpeg';

// Splash screen only (screen 1). Onboarding/Welcome screen (screen 2)
// has been removed per spec — splash goes straight to Home.
// The background photo already has the "PMV Properties" branding baked in,
// so no separate logo image is overlaid here.
export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/home', { replace: true }), 1600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div
      className="splash-shell flex flex-col items-center justify-end text-white bg-brand-dark bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${splashBg})` }}
    >
      {/* subtle bottom scrim so the loading dots stay readable over the photo */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />

      <div className="relative w-full flex flex-col items-center pb-10 page-fade">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
        </div>
      </div>
    </div>
  );
}
