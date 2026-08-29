/**
 * JSON-LD for the site.
 *
 * Structured data is how a machine reads a page that a person reads visually —
 * it is what puts a rating, an address and an opening-hours block into a result
 * instead of a blue link, and it is increasingly what an answer engine quotes.
 *
 * Two rules hold everything here together:
 *
 * 1. Nothing is claimed that the page does not also say in words. Google spot-
 *    checks the markup against the rendered text and demotes the mismatch.
 * 2. Nodes are joined by `@id` rather than repeated, so the hostel described on
 *    the home page and the one referenced from /rooms are the same entity as
 *    far as a crawler is concerned.
 */
import {
  ADDRESS,
  BRAND_LOGO,
  COWORKING_NAME,
  GEO,
  LEGAL_NAME,
  PRIMARY_MARKETS,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  isPlaceholderContact,
} from './siteConfig';
import { IMAGES } from '../assets/images';
import { HERO_DATA, HOUSE_RULES, NEARBY, ROOM_TYPES } from '../data/mockData';
import type { Photo } from '../types';

/** JSON-LD is a tree of unknown shape; this keeps the casts out of the body. */
type Node = Record<string, unknown>;

const ID = {
  organisation: `${SITE_URL}/#organisation`,
  website: `${SITE_URL}/#website`,
  hostel: `${SITE_URL}/#hostel`,
  coworking: `${SITE_URL}/#coworking`,
} as const;

const imageUrl = (photo: Photo) => `${SITE_URL}${photo.src}`;

const imageObject = (photo: Photo): Node => ({
  '@type': 'ImageObject',
  url: imageUrl(photo),
  width: photo.width,
  height: photo.height,
  caption: photo.alt,
});

const postalAddress: Node = {
  '@type': 'PostalAddress',
  streetAddress: ADDRESS.street,
  addressLocality: ADDRESS.locality,
  addressRegion: ADDRESS.region,
  postalCode: ADDRESS.postalCode,
  addressCountry: ADDRESS.countryCode,
};

const geoCoordinates: Node = {
  '@type': 'GeoCoordinates',
  latitude: GEO.latitude,
  longitude: GEO.longitude,
};

/**
 * Amenities, as the pairs Google's lodging documentation expects. `value` is
 * what makes the difference between "we list this word" and "we have this".
 */
const amenity = (name: string, value = true): Node => ({
  '@type': 'LocationFeatureSpecification',
  name,
  value,
});

/**
 * The rating carried on the listing this site was built from. Only emitted
 * because the figure and the review count are both printed on the page — an
 * aggregateRating that appears in the markup alone is a manual-action risk.
 */
const aggregateRating: Node = {
  '@type': 'AggregateRating',
  ratingValue: HERO_DATA.rating,
  bestRating: 10,
  worstRating: 1,
  ratingCount: HERO_DATA.reviewsCount,
};

const contactPoints = () => {
  const placeholder = isPlaceholderContact(HERO_DATA.phone, HERO_DATA.email);
  const out: Node = {};
  if (!placeholder.phone) out.telephone = HERO_DATA.phone;
  if (!placeholder.email) out.email = HERO_DATA.email;
  return out;
};

const checkTime = (range: string) => range.split('–')[0]?.trim();
const checkTimeEnd = (range: string) => range.split('–')[1]?.trim();

/** The lodging half of the business. */
const hostelNode = (): Node => ({
  '@type': ['Hostel', 'LodgingBusiness'],
  '@id': ID.hostel,
  name: SITE_NAME,
  legalName: LEGAL_NAME,
  description:
    'Beachfront hostel, coliving house and coworking space in Weligama on the south coast of Sri Lanka, with private rooms, dorm beds and dedicated desks for long stays.',
  url: `${SITE_URL}/`,
  image: [
    imageUrl(IMAGES.buildingFacade),
    imageUrl(IMAGES.coworkingPeople),
    imageUrl(IMAGES.roomKingBed),
    imageUrl(IMAGES.terraceNight),
  ],
  address: postalAddress,
  geo: geoCoordinates,
  hasMap: `https://www.google.com/maps/search/?api=1&query=${GEO.latitude},${GEO.longitude}`,
  currenciesAccepted: 'LKR, EUR, USD',
  paymentAccepted: 'Cash',
  petsAllowed: false,
  checkinTime: checkTime(HERO_DATA.checkIn),
  checkoutTime: checkTimeEnd(HERO_DATA.checkOut),
  numberOfRooms: ROOM_TYPES.length,
  aggregateRating,
  ...contactPoints(),
  // Who the place is for. This is the honest signal for a European audience —
  // far better than an hreflang pointing at a German page that does not exist.
  areaServed: PRIMARY_MARKETS.map((code) => ({ '@type': 'Country', identifier: code })),
  audience: {
    '@type': 'Audience',
    audienceType: 'Remote workers, digital nomads and long-stay travellers',
  },
  amenityFeature: [
    amenity('Coworking space'),
    amenity('Free high-speed WiFi'),
    amenity('Air conditioning'),
    amenity('Private beach area'),
    amenity('Garden terrace'),
    amenity('Yoga classes'),
    amenity('Free private parking'),
    amenity('Airport shuttle'),
    amenity('Female-only dormitory'),
    amenity('Lockers'),
    amenity('Non-smoking rooms'),
  ],
  containsPlace: ROOM_TYPES.map((room) => ({
    '@type': room.category === 'dorm' ? 'Room' : 'Suite',
    name: room.title,
    description: room.description,
    occupancy: { '@type': 'QuantitativeValue', maxValue: room.sleeps },
    bed: { '@type': 'BedDetails', typeOfBed: room.bedSummary },
    image: imageUrl(room.image),
    amenityFeature: room.features.map((f) => amenity(f)),
  })),
  isNearby: NEARBY.map((place) => ({ '@type': 'Place', name: place.label })),
});

/**
 * The workspace, as its own entity.
 *
 * schema.org has no coworking type, so this is a LocalBusiness that says what
 * it is in `additionalType` and in its name — which is also how the two
 * searches that matter ("coworking weligama" and "connect co-working space")
 * both resolve to the same place.
 */
const coworkingNode = (): Node => ({
  '@type': 'LocalBusiness',
  '@id': ID.coworking,
  additionalType: 'https://www.wikidata.org/wiki/Q1780358',
  name: COWORKING_NAME,
  alternateName: `${SITE_NAME} Coworking`,
  description:
    'Coworking space in Weligama, Sri Lanka: dedicated desks, fast WiFi, air conditioning and monthly rates for remote workers on a long stay.',
  url: absoluteUrl('/coworking'),
  image: [imageUrl(IMAGES.coworkingDesks), imageUrl(IMAGES.coworkingSign)],
  address: postalAddress,
  geo: geoCoordinates,
  parentOrganization: { '@id': ID.organisation },
  containedInPlace: { '@id': ID.hostel },
  areaServed: PRIMARY_MARKETS.map((code) => ({ '@type': 'Country', identifier: code })),
  amenityFeature: [
    amenity('Dedicated desks'),
    amenity('Free high-speed WiFi'),
    amenity('Air conditioning'),
    amenity('Power backup'),
    amenity('Monitors'),
    amenity('Quiet call areas'),
  ],
});

const organisationNode = (): Node => ({
  '@type': 'Organization',
  '@id': ID.organisation,
  name: SITE_NAME,
  legalName: LEGAL_NAME,
  url: `${SITE_URL}/`,
  logo: imageObject(BRAND_LOGO),
  address: postalAddress,
  ...contactPoints(),
});

const websiteNode = (): Node => ({
  '@type': 'WebSite',
  '@id': ID.website,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  inLanguage: 'en',
  publisher: { '@id': ID.organisation },
});

const breadcrumbNode = (path: string, label?: string): Node | null => {
  if (path === '/' || !label) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: label, item: absoluteUrl(path) },
    ],
  };
};

const webPageNode = (path: string, title: string, description: string, image: Photo): Node => ({
  '@type': 'WebPage',
  '@id': `${absoluteUrl(path)}#webpage`,
  url: absoluteUrl(path),
  name: title,
  description,
  inLanguage: 'en',
  isPartOf: { '@id': ID.website },
  primaryImageOfPage: imageObject(image),
  about: { '@id': path === '/coworking' ? ID.coworking : ID.hostel },
});

/**
 * Questions this audience actually types, answered on the page itself.
 *
 * Only emitted for /coworking, where the answers are visible in the markup —
 * an FAQPage whose answers exist only in JSON-LD is a policy violation.
 */
export const FAQ = [
  {
    q: 'Can I work European hours from Weligama?',
    a: 'Sri Lanka runs at UTC+5:30 with no daylight saving, so it sits three and a half hours ahead of Berlin in summer and four and a half in winter. A nine-to-five in Germany starts at half twelve or half one here, which leaves the whole morning for the water.',
  },
  {
    q: 'How fast is the WiFi?',
    a: 'Fibre across the property with a backup line, which is enough for video calls from the desks. There is a generator for the outages that come with the territory.',
  },
  {
    q: 'Do you have monthly rates for a longer stay?',
    a: 'Yes. Most people who arrive for a few nights end up asking about the month, so send us your dates and we will put together a rate that covers the room and the desk together.',
  },
  {
    q: 'Is there a dedicated coworking space, or just WiFi in the lounge?',
    a: 'There is a separate air-conditioned room with proper desks and chairs, trading as Connect Co-Working Space, plus quieter corners for calls and the lounge and garden terrace when you want to get off the laptop.',
  },
  {
    q: 'How far is the beach?',
    a: 'Weligama Beach is a six-minute walk from the door. It is a long, sandy, beginner-friendly break, and Mirissa is under three miles down the coast.',
  },
];

const faqNode = (): Node => ({
  '@type': 'FAQPage',
  '@id': `${absoluteUrl('/coworking')}#faq`,
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});

/**
 * The whole graph for one page, ready to be serialised into a single
 * <script type="application/ld+json">. One script per page beats several —
 * the nodes can reference each other by @id.
 */
export function buildGraph(opts: {
  path: string;
  title: string;
  description: string;
  image: Photo;
  breadcrumb?: string;
}): string {
  const graph: Node[] = [
    organisationNode(),
    websiteNode(),
    webPageNode(opts.path, opts.title, opts.description, opts.image),
    hostelNode(),
    coworkingNode(),
  ];

  const crumbs = breadcrumbNode(opts.path, opts.breadcrumb);
  if (crumbs) graph.push(crumbs);
  if (opts.path === '/coworking') graph.push(faqNode());

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

/** House rules, surfaced on /contact as plain text and mirrored here. */
export const houseRuleText = () => HOUSE_RULES.map((r) => `${r.label}: ${r.value}`).join(' · ');
