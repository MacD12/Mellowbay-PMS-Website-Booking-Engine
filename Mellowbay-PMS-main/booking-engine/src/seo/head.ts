/**
 * The <head> for a given route, as data.
 *
 * The same function feeds two consumers that must never disagree: the
 * prerender step, which writes these tags into the HTML on disk, and the
 * runtime hook, which rewrites them as the user moves between routes without a
 * page load. Deriving both from one call is the only way to be sure a crawler
 * and a reader are looking at the same page.
 */
import { ROUTE_SEO, SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, absoluteUrl } from './siteConfig';
import { buildGraph } from './structuredData';
import { IMAGES } from '../assets/images';
import { GALLERY_PHOTOS, ROOM_TYPES } from '../data/mockData';
import type { Photo } from '../types';

export interface HeadTag {
  tag: 'meta' | 'link';
  /**
   * CSS selector that matches this tag and only this tag, so the runtime can
   * update the element already in the document instead of appending a second
   * one. `rel` alone is not enough — a page carries one canonical and two
   * alternates, and all three are links.
   */
  selector: string;
  attrs: Record<string, string>;
}

export interface Head {
  title: string;
  description: string;
  canonical: string;
  tags: HeadTag[];
  jsonLd: string;
}

const meta = (keyAttr: 'name' | 'property', key: string, content: string): HeadTag => ({
  tag: 'meta',
  selector: `meta[${keyAttr}="${key}"]`,
  attrs: { [keyAttr]: key, content },
});

const link = (attrs: Record<string, string>, selector: string): HeadTag => ({
  tag: 'link',
  selector,
  attrs,
});

/**
 * Titles land in a result list next to the brand, so the brand is appended
 * once, here, rather than written into every route. A route whose title
 * already carries the name is left alone — "Mellow Bay … | Mellow Bay Living"
 * reads like a bug.
 */
const withBrand = (title: string) =>
  title.toLowerCase().includes('mellow bay') ? title : `${title} | ${SITE_NAME}`;

export function buildHead(path: string): Head {
  const route = ROUTE_SEO[path] ?? ROUTE_SEO['/'];
  const image = route.image ?? DEFAULT_OG_IMAGE;
  const canonical = absoluteUrl(route.path);
  const title = withBrand(route.title);
  const imageUrl = `${SITE_URL}${image.src}`;

  // Anything not in the route table is a private page — /register/:token is
  // reached by scanning a code at the desk and has no business in an index.
  const listed = path in ROUTE_SEO;

  const tags: HeadTag[] = [
    meta('name', 'description', route.description),

    // Explicit rather than implied. `max-image-preview:large` is what allows a
    // photograph into the result instead of a thumbnail, and this site is sold
    // on its photography.
    meta(
      'name',
      'robots',
      listed
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    ),

    // Open Graph — what WhatsApp, LinkedIn, Slack and Facebook read. These
    // crawlers do not run JavaScript, which is the whole reason this site is
    // prerendered.
    //
    // 'website' throughout: 'article' carries an author and a publication date
    // that none of these pages have, and a share card built from missing
    // fields looks worse than one built from the right type.
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:title', title),
    meta('property', 'og:description', route.description),
    meta('property', 'og:url', canonical),
    meta('property', 'og:locale', 'en_GB'),
    meta('property', 'og:image', imageUrl),
    meta('property', 'og:image:width', String(image.width)),
    meta('property', 'og:image:height', String(image.height)),
    meta('property', 'og:image:alt', image.alt),

    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', route.description),
    meta('name', 'twitter:image', imageUrl),
    meta('name', 'twitter:image:alt', image.alt),

    // Where the business physically is. Small engines and some map crawlers
    // still read these; they cost four lines.
    meta('name', 'geo.region', 'LK-3'),
    meta('name', 'geo.placename', 'Weligama'),
    meta('name', 'geo.position', '5.9749;80.4297'),
    meta('name', 'ICBM', '5.9749, 80.4297'),

    link({ rel: 'canonical', href: canonical }, 'link[rel="canonical"]'),
  ];

  // An hreflang cluster has to name this page, not the site. Pointing every
  // page's alternate at the home page is the most common way to get the whole
  // set discarded. There is one language, so en and x-default are both self-
  // referential — which is the correct shape for a single-language site, and
  // the hook a German version would be added onto later.
  for (const lang of ['en', 'x-default']) {
    tags.push(
      link(
        { rel: 'alternate', hreflang: lang, href: canonical },
        `link[rel="alternate"][hreflang="${lang}"]`,
      ),
    );
  }

  return {
    title,
    description: route.description,
    canonical,
    tags,
    jsonLd: buildGraph({
      path: route.path,
      title,
      description: route.description,
      image,
      breadcrumb: route.breadcrumb,
    }),
  };
}

// ------------------------------------------------------------------ sitemap ---

/**
 * Which photographs belong to which page.
 *
 * An image sitemap is the only way to tell Google about a photograph it would
 * otherwise have to execute JavaScript to find — every image on this site is
 * behind a React render, and several are behind a modal that never opens for a
 * crawler at all. Listing them is what makes them eligible for image search,
 * which for a property sold on its photography is not a small channel.
 */
const routeImages = (path: string): Photo[] => {
  switch (path) {
    case '/':
      return GALLERY_PHOTOS.map((g) => g.image);
    case '/rooms':
      return ROOM_TYPES.map((r) => r.image);
    case '/coworking':
      return [
        IMAGES.coworkingRoom,
        IMAGES.coworkingDesks,
        IMAGES.coworkingPeople,
        IMAGES.coworkingMonitors,
        IMAGES.coworkingBeanbag,
        IMAGES.coworkingSign,
        IMAGES.coworkingLaptop,
        IMAGES.coworkingWindow,
        IMAGES.gardenTerraceDay,
      ];
    case '/about':
      return [IMAGES.terraceNight, IMAGES.gardenTerraceDay, IMAGES.loungeSeating, IMAGES.communalTable];
    case '/contact':
      return [IMAGES.courtyardAbove, IMAGES.buildingFacade];
    default:
      return [];
  }
};

export interface SitemapEntry {
  url: string;
  changeFrequency: string;
  priority: number;
  images: { loc: string; title: string }[];
}

export function buildSitemapEntries(): SitemapEntry[] {
  return Object.values(ROUTE_SEO).map((route) => {
    const own = route.image ?? DEFAULT_OG_IMAGE;
    // The page's own header image first, then the rest, de-duplicated — the
    // same frame listed twice under one <url> is dropped anyway.
    const photos = [own, ...routeImages(route.path)];
    const seen = new Set<string>();

    return {
      url: absoluteUrl(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      images: photos
        .filter((p) => !seen.has(p.src) && seen.add(p.src))
        .map((p) => ({ loc: `${SITE_URL}${p.src}`, title: p.alt })),
    };
  });
}
