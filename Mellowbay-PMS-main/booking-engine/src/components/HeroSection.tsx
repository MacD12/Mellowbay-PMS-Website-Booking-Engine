import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IMAGES } from '../assets/images';
import { HERO_DATA } from '../data/mockData';

interface HeroSectionProps {
  onOpenQuiz: () => void;
}

// Landscape crops only — these run full-bleed behind the headline.
const SLIDES = [
  { src: IMAGES.restaurantSeating, alt: 'The restaurant and lounge at Mellow Bay' },
  { src: IMAGES.coworkingPeople, alt: 'Guests working in the coworking space' },
  { src: IMAGES.gardenTerraceDay, alt: 'The garden terrace' },
  { src: IMAGES.roomDoors, alt: 'Guest room doors at Mellow Bay' },
];

const INTERVAL = 6000;

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenQuiz }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    // Don't auto-advance for anyone who has asked the OS to cut motion.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || paused) return;

    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    // Pinned to the top so the content slab below scrolls up over it.
    <section
      className="sticky top-0 z-0 bg-hero overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Full-bleed slides, cross-fading */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={i === index ? slide.alt : ''}
            aria-hidden={i === index ? undefined : true}
            data-active={i === index}
            referrerPolicy="no-referrer"
            className={`hero-slide absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Scrim — the headline sits on photography, so it needs a floor under it */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/40" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-9 md:px-14 pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-20">
        <div className="max-w-xl flex flex-col min-h-[440px] lg:min-h-[520px]">
          <div className="space-y-7">
            <h1 className="text-white text-[42px] sm:text-6xl lg:text-[64px] font-medium tracking-[-0.03em] leading-[0.98] drop-shadow-sm">
              {HERO_DATA.titleLead}
              {HERO_DATA.titleRest.split('\n').map((line) => (
                <span key={line} className="block text-white/70">
                  {line}
                </span>
              ))}
            </h1>

            <p className="text-white/85 text-[13px] sm:text-sm leading-relaxed whitespace-pre-line max-w-sm">
              {HERO_DATA.description}
            </p>

            <button
              onClick={onOpenQuiz}
              className="bg-plum hover:bg-plum-dark text-white text-xs font-medium tracking-wide px-8 py-3.5 rounded-[10px] pressable transition-colors cursor-pointer"
            >
              {HERO_DATA.ctaText}
            </button>
          </div>

          <p className="mt-auto pt-12 text-white/70 text-[11px] sm:text-xs leading-relaxed whitespace-pre-line">
            {HERO_DATA.caption}
          </p>
        </div>

        {/* Controls */}
        <div className="relative mt-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === index ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="w-9 h-9 rounded-full border border-white/30 text-white/80 hover:bg-white hover:text-ink hover:border-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="w-9 h-9 rounded-full border border-white/30 text-white/80 hover:bg-white hover:text-ink hover:border-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
