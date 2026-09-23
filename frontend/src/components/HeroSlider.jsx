import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BANNERS } from '../data/banners.js';

const AUTOPLAY_MS = 4500;
const PAUSE_AFTER_TOUCH_MS = 8000;
const START_OFFSET = 16; // matches .hero-spacer-start in index.css

// Advertisement banner carousel at the top of Home.
// Compact, swipeable, and fully responsive: every slide keeps the banner's
// 16:9 shape (nothing is cropped), is never wider than 300px, and the next
// banner peeks in at the edge. Auto-advances every 4.5s (not when the visitor
// prefers reduced motion, and it pauses for a few seconds after a swipe).
export default function HeroSlider({ banners = BANNERS }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const pausedUntil = useRef(0);
  const activeRef = useRef(0);
  const navigate = useNavigate();

  const goTo = useCallback((index, smooth = true) => {
    const track = trackRef.current;
    const slide = slideRefs.current[index];
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft - START_OFFSET, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // autoplay
  useEffect(() => {
    if (banners.length < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      const next = (activeRef.current + 1) % banners.length;
      setActive(next);
      goTo(next);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [banners.length, goTo]);

  // keep the dots in sync when the visitor swipes by hand
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    let nearest = 0;
    let best = Infinity;
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = Math.abs(el.offsetLeft - START_OFFSET - track.scrollLeft);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    if (nearest !== active) setActive(nearest);
  };

  const pauseAutoplay = () => {
    pausedUntil.current = Date.now() + PAUSE_AFTER_TOUCH_MS;
  };

  if (!banners.length) return null;

  return (
    <section className="mt-4" aria-label="Offers and announcements">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={pauseAutoplay}
        onKeyDown={pauseAutoplay}
        className="relative flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-pl-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="hero-spacer-start shrink-0" aria-hidden="true" />
        {banners.map((b, i) => {
          const Wrapper = b.to ? 'button' : 'div';
          return (
            <Wrapper
              key={b.id}
              ref={(el) => (slideRefs.current[i] = el)}
              {...(b.to ? { type: 'button', onClick: () => navigate(b.to), 'aria-label': b.alt } : {})}
              className="hero-slide shrink-0 snap-start block rounded-2xl overflow-hidden shadow-card bg-white text-left"
            >
              <img
                src={b.src}
                alt={b.to ? '' : b.alt}
                width="1000"
                height="562"
                decoding="async"
                draggable="false"
                className="block w-full h-auto aspect-video object-cover select-none"
              />
            </Wrapper>
          );
        })}
        <div className="hero-spacer-end shrink-0" aria-hidden="true" />
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Show banner ${i + 1} of ${banners.length}`}
              aria-current={i === active}
              onClick={() => {
                pauseAutoplay();
                setActive(i);
                goTo(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? 'w-5 bg-brand' : 'w-1.5 bg-brand/25'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
