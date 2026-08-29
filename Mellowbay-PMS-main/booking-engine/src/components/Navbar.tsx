import React, { useEffect, useState } from 'react';
import { ChevronRight, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { HERO_DATA } from '../data/mockData';

// Served from public/ rather than imported, so the GitHub Pages sub-path (BASE_PATH)
// is honoured without the bundler needing the file present at build time.
// Served from public/ rather than imported, so the GitHub Pages sub-path
// (BASE_PATH) is honoured without the bundler needing the file at build time.
//
// 480px-wide copies of the supplied artwork, which is 3764px. The mark is drawn
// at 114–136 CSS pixels, so the master was thirty times wider than the slot:
// 91 kB to download and an 18 MB bitmap to hold in memory on a phone, for a
// logo. These are around 15 kB each and still cover 3x displays. The masters
// stay in public/ as mellow-bay-logo-{white,black}.png.
const LOGO_WHITE = `${import.meta.env.BASE_URL}mellow-bay-logo-white-480.png`;
const LOGO_BLACK = `${import.meta.env.BASE_URL}mellow-bay-logo-black-480.png`;

// The files' own pixels. Stated so the bar reserves the mark's box on the first
// paint — the logo sits above every page's headline, so a logo that pops in
// after layout shifts the whole page under the reader.
const LOGO_SIZE = { width: 480, height: 158 };

// Coworking leads: it is the main business, and the link label is also the
// word this site needs to rank for.
export const NAV_LINKS = [
  { to: '/coworking', label: 'Coworking' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/book', label: 'Book' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the drawer whenever navigation happens.
  useEffect(() => setMobileMenuOpen(false), [pathname]);

  const solid = scrolled || mobileMenuOpen;

  // The home hero is photography under a dark scrim, so white type belongs there.
  // Every other page opens on the sand PageHero band — a light surface — where
  // white would be unreadable until the bar goes solid.
  const overDarkHero = pathname === '/';
  const onLight = !solid && !overDarkHero;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        onLight ? 'text-ink' : 'text-white'
      } ${solid ? 'bg-ink/92 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}
    >
      {/* Three columns of equal weight so the links land on the true optical centre,
          regardless of how wide the wordmark or the CTA happen to be. */}
      <div className="max-w-6xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 sm:px-9 md:px-14 h-14 sm:h-16">
        <Link
          to="/"
          aria-label={`${HERO_DATA.companyName} — beach coworking and coliving in Weligama, home`}
          className="justify-self-start relative flex items-center focus:outline-none"
        >
          {/* Two masters, one per ground: white artwork over the dark hero and the
              solid bar, black over the light sand pages. Cross-fading them on the
              same 300ms curve as the bar's own background means the change reads as
              one movement — and it uses the real black artwork rather than a CSS
              filter, so the mark is the colour the brand actually specifies.
              Both are decorative: the link above carries the accessible name, and
              two alt texts on one link would be read out twice. */}
          <img
            src={LOGO_WHITE}
            alt=""
            width={LOGO_SIZE.width}
            height={LOGO_SIZE.height}
            decoding="async"
            // In the bar on every page, above the fold on all of them: this is
            // the one image that should never wait.
            fetchPriority="high"
            className={`h-10 sm:h-12 w-auto object-contain transition-opacity duration-300 ${
              onLight ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <img
            src={LOGO_BLACK}
            alt=""
            width={LOGO_SIZE.width}
            height={LOGO_SIZE.height}
            decoding="async"
            aria-hidden="true"
            className={`absolute inset-0 h-10 sm:h-12 w-auto object-contain transition-opacity duration-300 ${
              onLight ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </Link>

        <nav className="hidden md:flex justify-self-center items-center gap-8 text-xs font-medium tracking-wide">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Spacer keeps the grid balanced on small screens where the links are hidden */}
        <span className="md:hidden" aria-hidden="true" />

        <div className="justify-self-end flex items-center gap-2">
          {/* A white pill has no edge against the sand, so invert it there. */}
          <Link
            to={HERO_DATA.bookingPath}
            className={`hidden sm:inline-flex text-[10.5px] font-semibold tracking-wide px-4 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              onLight
                ? 'bg-ink hover:bg-ink-soft text-white'
                : 'bg-white hover:bg-white/90 text-ink'
            }`}
          >
            Book now
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 -mr-1.5 focus:outline-none cursor-pointer"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-ink/95 backdrop-blur-md px-5 sm:px-9 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/10 text-left font-medium text-sm"
            >
              <span>{link.label}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </NavLink>
          ))}

          <Link
            to={HERO_DATA.bookingPath}
            className="mt-1 flex items-center justify-center w-full py-3 bg-white text-ink rounded-2xl font-semibold text-xs"
          >
            Book now
          </Link>
        </div>
      )}
    </header>
  );
};
