/**
 * Everything the site says about itself to a machine.
 *
 * One file, because a canonical URL, an Open Graph tag, a sitemap entry and a
 * JSON-LD node all have to agree about the same page or they cancel each other
 * out. The prerender script reads this at build time and the React tree reads
 * it at runtime, so there is exactly one description of each route.
 */
import { IMAGES } from '../assets/images';
import type { Photo } from '../types';

/**
 * Absolute origin, no trailing slash. Canonicals, OG URLs, the sitemap and the
 * JSON-LD @ids are all built from this, so a domain change is a one-line edit.
 */
export const SITE_URL = 'https://mellowbayliving.com';

export const SITE_NAME = 'Mellow Bay Living';
export const LEGAL_NAME = 'Mellow Bay Living Beach Coworking & Coliving';

/**
 * The workspace trades under its own name on the signage and in the reviews
 * people leave, so it is worth being findable by it.
 */
export const COWORKING_NAME = 'Connect Co-Working Space';

/** Fallback share image, used by any page that does not name its own. */
export const DEFAULT_OG_IMAGE = IMAGES.coworkingPeople;

/**
 * The brand mark for `Organization.logo`.
 *
 * Deliberately the square icon rather than the wide wordmark: Google wants a
 * logo it can render in a fixed box, and the transparent wordmark disappears
 * against whichever ground it lands on. This one carries its own tile.
 * Served from public/, so it is a path rather than a bundled import.
 */
export const BRAND_LOGO = {
  src: '/mellow-bay-icon-256.png',
  width: 256,
  height: 256,
  alt: 'Mellow Bay Living logo',
} as const;

/**
 * The property's pin.
 *
 * TODO: confirm before launch. These are Weligama-accurate but were not read
 * off the property's own listing, and a local-search pin that is a kilometre
 * out is worse than a vague one. Google Business Profile is the source of
 * truth — copy the coordinates from there.
 */
export const GEO = {
  latitude: 5.9749,
  longitude: 80.4297,
} as const;

export const ADDRESS = {
  street: 'Matara Road 693, Pelena',
  locality: 'Weligama',
  region: 'Southern Province',
  postalCode: '81700',
  countryCode: 'LK',
  country: 'Sri Lanka',
} as const;

/**
 * Contact details are still the placeholders the listing was transcribed with.
 * Structured data carrying a fake phone number is worse than structured data
 * carrying none — Google cross-checks it against the Business Profile — so the
 * schema omits anything that still matches these.
 */
const PLACEHOLDER_PHONE = '+18005550199';
const PLACEHOLDER_EMAIL = 'email@example.com';

export const isPlaceholderContact = (phone: string, email: string) => ({
  phone: phone.replace(/[^\d+]/g, '') === PLACEHOLDER_PHONE,
  email: email === PLACEHOLDER_EMAIL,
});

/**
 * Where the guests come from.
 *
 * This is not decoration: `areaServed` and the language of the copy are what
 * tell a search engine which market this page is for, and the site has no
 * German-language version to point an hreflang at. Claiming one that does not
 * exist gets the pair ignored at best.
 */
export const PRIMARY_MARKETS = ['DE', 'AT', 'CH', 'NL', 'GB', 'FR', 'SE', 'DK'] as const;

export interface RouteSeo {
  path: string;
  title: string;
  description: string;
  /** Share image for this page. Defaults to DEFAULT_OG_IMAGE. */
  image?: Photo;
  /** Sitemap hint. Not a ranking factor; it just orders a crawl. */
  priority: number;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
  /** Human label used for the breadcrumb trail. Omitted on the home page. */
  breadcrumb?: string;
}

/**
 * Titles are written to be read in a result list, not to hold keywords.
 *
 * The pattern is <what it is> + <where> — "where" being the half a German
 * searching "coworking sri lanka" is actually scanning for. Every one is under
 * 60 characters so it survives to the pixel limit intact, and the brand is
 * appended by the Seo component rather than repeated here.
 */
export const ROUTE_SEO: Record<string, RouteSeo> = {
  '/': {
    path: '/',
    title: 'Beach Coworking & Coliving in Weligama, Sri Lanka',
    description:
      'A beachfront coworking space, hostel and coliving house on Sri Lanka’s south coast. Fast WiFi, air-conditioned private rooms and dorms, six minutes from Weligama Beach. Built for remote workers on a long stay.',
    image: IMAGES.coworkingPeople,
    priority: 1.0,
    changeFrequency: 'weekly',
  },
  '/coworking': {
    path: '/coworking',
    title: 'Coworking Space in Weligama — Desks, WiFi & Long Stays',
    description:
      'Dedicated desks, fast WiFi and a quiet air-conditioned room to work in, a short walk from Weligama Beach. Day passes and monthly rates for remote workers and digital nomads staying on Sri Lanka’s south coast.',
    image: IMAGES.coworkingDesks,
    priority: 0.9,
    changeFrequency: 'monthly',
    breadcrumb: 'Coworking',
  },
  '/rooms': {
    path: '/rooms',
    title: 'Rooms & Dorms in Weligama — Private, Family and Shared',
    description:
      'Five ways to stay: air-conditioned private doubles, a family suite sleeping five, and beds in mixed and female-only dorms. Private bathrooms in the private rooms, all a few minutes from the beach.',
    image: IMAGES.roomKingBed,
    priority: 0.9,
    changeFrequency: 'weekly',
    breadcrumb: 'Rooms',
  },
  '/about': {
    path: '/about',
    title: 'About Mellow Bay — Coliving on Sri Lanka’s South Coast',
    description:
      'A beachfront hostel, coliving house and coworking space in Pelena, just outside Weligama. Private beach area, garden terrace, yoga and a community of people who came for a week and stayed a month.',
    image: IMAGES.terraceNight,
    priority: 0.7,
    changeFrequency: 'monthly',
    breadcrumb: 'About',
  },
  '/contact': {
    path: '/contact',
    title: 'Contact & Directions — Mellow Bay, Weligama',
    description:
      'Matara Road, Pelena, Weligama. Getting here from Colombo, Koggala Airport or the coastal train, plus check-in times, parking and everything worth knowing before you arrive.',
    image: IMAGES.courtyardAbove,
    priority: 0.6,
    changeFrequency: 'yearly',
    breadcrumb: 'Contact',
  },
  '/book': {
    path: '/book',
    title: 'Check Availability & Book Direct — Mellow Bay Weligama',
    description:
      'Pick your dates, choose a room or a dorm bed, add a desk, and get a price. Booking direct, with no platform commission on top.',
    image: IMAGES.terraceNight,
    priority: 0.8,
    changeFrequency: 'weekly',
    breadcrumb: 'Book',
  },
};

/** Every route the prerender step and the sitemap should cover. */
export const SEO_ROUTES = Object.keys(ROUTE_SEO);

export const absoluteUrl = (path: string) =>
  path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path.replace(/\/$/, '')}`;
