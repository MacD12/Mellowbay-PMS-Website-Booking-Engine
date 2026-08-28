import React, { useState } from 'react';
import { ArrowRight, ArrowUp, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HERO_DATA } from '../data/mockData';
import { NAV_LINKS } from './Navbar';

export const Footer: React.FC = () => {
  const [contactInput, setContactInput] = useState('');
  const [sent, setSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setContactInput('');
    }, 3000);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // /55 rather than /40 — at 9px the lighter tint drops under AA on this ground.
  const label = 'block text-[9px] font-semibold text-white/55 uppercase tracking-[0.18em] mb-2.5';

  return (
    // Background comes from the wrapper in Layout so its bloom shows through.
    <footer className="text-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-9 md:px-14 pt-16 pb-10">
        {/* Contact strip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          <div className="md:col-span-5">
            <span className={label}>Classic</span>
            <a
              href={`mailto:${HERO_DATA.email}`}
              className="text-mail-bright text-xl sm:text-[26px] tracking-[-0.03em] hover:opacity-70 transition-opacity break-words"
            >
              {HERO_DATA.email}
            </a>
          </div>

          <div className="md:col-span-2">
            <span className={label}>Book</span>
            <Link
              to={HERO_DATA.bookingPath}
              className="text-tg-bright text-xl sm:text-[26px] tracking-[-0.03em] hover:opacity-70 transition-opacity"
            >
              Book direct
            </Link>
          </div>

          <div className="md:col-span-5">
            <span className={label}>Feedback</span>

            {sent ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm h-[42px]">
                <Check className="w-4 h-4" />
                <span>Thank you! We will be in touch.</span>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="flex items-center gap-3">
                <input
                  type="text"
                  required
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="e-mail / phone"
                  className="flex-1 min-w-0 text-xl sm:text-[26px] tracking-[-0.02em] text-white placeholder:text-white/45 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Submit"
                  className="w-10 h-10 rounded-full bg-white hover:bg-white/90 text-ink flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
            <div className="mt-1 border-b border-white/15" />
          </div>
        </div>

        {/* Slogan row */}
        <div className="mt-16 flex items-start justify-between gap-6">
          <p className="text-[9px] sm:text-[10px] font-semibold text-white/55 uppercase tracking-[0.18em] leading-[1.9]">
            COME FOR THE SURF.
            <br />
            STAY FOR THE PEOPLE.
          </p>

          <button
            onClick={scrollToTop}
            className="text-[9px] sm:text-[10px] font-semibold text-white/55 uppercase tracking-[0.18em] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            Top
          </button>
        </div>

        {/* Bottom action bar */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <Link
            to={HERO_DATA.bookingPath}
            className="bg-white hover:bg-white/90 text-ink text-xs font-medium px-7 sm:px-9 py-4 rounded-full transition-colors shrink-0"
          >
            {HERO_DATA.ctaText}
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-9 text-[11px] sm:text-xs text-white/50">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-white transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="w-10 h-10 rounded-full border border-white/20 text-white/50 hover:border-white hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
