import React from 'react';
import splashBg from '../assets/splash-bg.jpeg';

// The splash screen visual (photo already has the "PMV Properties" branding
// baked in). It no longer navigates anywhere: <SplashGate> in App.jsx shows it
// as a short overlay the first time someone opens ANY page of the site in a
// browser session, then reveals the page underneath at the same URL.
export default function Splash() {
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
