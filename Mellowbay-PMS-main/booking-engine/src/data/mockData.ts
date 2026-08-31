import { IMAGES } from '../assets/images';
import { ReviewCategory, RoomType, ServiceDetail } from '../types';

// The property details below were transcribed from the original listing. Booking
// itself is handled on this site — see the booking engine at /book — so there is
// no outbound booking link here.
//
// The business is a coworking space first, with rooms, dorms and coliving
// around it. There is no restaurant and no bar; anything that described one has
// been removed rather than softened, because a page that half-promises a
// kitchen is worse than one that never mentions it.
export const HERO_DATA = {
  companyName: 'Mellow Bay',
  legalName: 'Mellow Bay Living Beach Coworking & Coliving',
  // The H1. It carries the two words this site needs to be found for, and it
  // still reads as a headline rather than a search query.
  titleLead: 'Coworking and',
  titleRest: 'coliving on\nthe south coast',
  description: 'Weligama, Sri Lanka — dedicated desks, fast WiFi\nand a bed six minutes from the sand',
  caption: 'Private beach, a dedicated workspace and a garden terrace\nsix minutes from Weligama Beach',
  ctaText: 'Check availability',
  // TODO: phone + email are still placeholders — real ones needed before launch.
  // src/seo/siteConfig.ts detects these and keeps them out of the structured
  // data, so fixing them here is all that is needed.
  phone: '+1 (800) 555-0199',
  phoneClean: '+18005550199',
  email: 'email@example.com',
  address: 'Matara Road 693, Pelena, 81700 Weligama, Sri Lanka',
  city: 'Weligama, Sri Lanka',
  /** Every "book" call to action goes here — the on-site booking engine. */
  bookingPath: '/book',
  checkIn: '2:00 PM – 10:00 PM',
  checkOut: '7:00 AM – 10:00 PM',
  minAge: 18,
  rating: 7.2,
  ratingWord: 'Good',
  reviewsCount: 78,
  beachScore: 8.5,
  beachWalkMinutes: 6,
};

/** Published category scores, as shown on the listing. */
export const REVIEW_CATEGORIES: ReviewCategory[] = [
  { label: 'Location', score: 8.4 },
  { label: 'Staff', score: 8.0 },
  { label: 'Value for money', score: 7.6 },
  { label: 'Facilities', score: 7.3 },
  { label: 'Cleanliness', score: 7.3 },
  { label: 'Comfort', score: 7.2 },
];

export const MOST_POPULAR_AMENITIES = [
  'Coworking space',
  'Free high-speed WiFi',
  'Private beach area',
  'Air conditioning',
  'Garden terrace',
  'Yoga classes',
  'Free private parking',
  'Female-only dorm',
  'Lockers',
  'Airport shuttle',
  'Family rooms',
  'Non-smoking rooms',
];

export const NEARBY = [
  { label: 'Weligama Beach', distance: '750 ft' },
  { label: 'Mirissa Beach', distance: '2.8 mi' },
  { label: 'Weligama Railway Station', distance: '0.9 mi' },
  { label: 'Koggala Airport', distance: '9.9 mi' },
];

/**
 * What a remote worker flying in from Europe actually needs to know before
 * booking. These are the questions that get asked in every enquiry, and they
 * are also what the audience searches for — "can I work German hours from Sri
 * Lanka" is a real query with a real answer.
 */
export const EUROPE_FACTS = [
  {
    title: 'Three and a half hours ahead of Berlin',
    detail:
      'Sri Lanka runs at UTC+5:30 and does not change for daylight saving. A nine-to-five in Germany starts at half twelve here in summer, half one in winter — so the morning is yours and the water is empty.',
  },
  {
    title: 'One stop from most of Europe',
    detail:
      'Colombo is a single connection from Frankfurt, Munich, Zurich, Vienna and Amsterdam through the Gulf hubs. From the airport it is about three hours down the Southern Expressway to our door.',
  },
  {
    title: 'Thirty days visa-free on arrival',
    detail:
      'German, Austrian and Swiss passports currently get a free thirty-day ETA for tourism. Check the current rules before you fly — they have moved more than once.',
  },
  {
    title: 'Long-stay rates in euros',
    detail:
      'Tell us the month you want and we will quote the room and the desk together, in the currency you budget in. Most people who book a week end up asking about this in the first few days.',
  },
];

export const SERVICES_DATA: ServiceDetail[] = [
  {
    id: 'work',
    title: 'Coworking space',
    description:
      'A dedicated air-conditioned room with proper desks, monitors and fibre WiFi, trading as Connect Co-Working Space. Day passes, weeks and months.',
    image: IMAGES.coworkingDesks,
    features: ['Dedicated desks', 'Fibre WiFi', 'Air-conditioned'],
    href: '/coworking',
  },
  {
    id: 'stay',
    title: 'Rooms and dorms',
    description:
      'Private doubles, a family suite and custom-built cement bunk dorms — all with air-conditioning, private or shared bathrooms and sea views.',
    image: IMAGES.roomDouble,
    features: ['Air-conditioning', 'Private bathrooms', 'Sea views'],
    href: '/rooms',
  },
  {
    id: 'live',
    title: 'Coliving and community',
    description:
      'Shared lounges, a long communal table, yoga classes and a garden terrace — the reason people book three nights and leave three weeks later.',
    image: IMAGES.terraceNight,
    features: ['Shared lounges', 'Yoga classes', 'Garden terrace'],
    href: '/about',
  },
];

/** The home page's hub — one card per other page on the site. */
export const SITE_SECTIONS = [
  {
    to: '/coworking',
    label: 'Coworking',
    title: 'Desks, WiFi and long stays',
    detail: 'A dedicated workspace for the people who came for a week and booked the month.',
    image: IMAGES.coworkingRoom,
  },
  {
    to: '/rooms',
    label: 'Rooms',
    title: 'Five ways to stay',
    detail: 'A private double, a family suite, or a bed in one of the air-conditioned dorms.',
    image: IMAGES.roomKingBed,
  },
  {
    to: '/about',
    label: 'About',
    title: 'What the place actually is',
    detail: 'Private beach, garden, shared lounges and coliving on the south coast of Sri Lanka.',
    image: IMAGES.terraceNight,
  },
  {
    to: '/contact',
    label: 'Contact',
    title: 'Find us in Weligama',
    detail: 'Directions, check-in times and everything worth knowing before you arrive.',
    image: IMAGES.buildingFacade,
  },
];

export const COWORKING_FEATURES = [
  {
    title: 'Dedicated desks',
    detail: 'Proper desks and chairs in their own air-conditioned room, not a laptop on a sofa.',
  },
  {
    title: 'Fibre WiFi with a backup line',
    detail: 'Enough for video calls all day, with a generator for when the grid has other ideas.',
  },
  {
    title: 'Monitors and power',
    detail: 'External screens at some desks, and sockets that reach where you are sitting.',
  },
  {
    title: 'Quiet corners for calls',
    detail: 'Somewhere to take the stand-up without the whole room hearing it.',
  },
  {
    title: 'Lounge and garden terrace',
    detail: 'Somewhere to land between calls, and somewhere to stop working entirely.',
  },
  {
    title: 'Free private parking',
    detail: 'On site, including accessible spaces, plus somewhere to keep a board.',
  },
];

export const HOUSE_RULES = [
  { label: 'Check-in', value: '2:00 PM – 10:00 PM' },
  { label: 'Check-out', value: '7:00 AM – 10:00 PM' },
  { label: 'Minimum age', value: '18 years' },
  { label: 'Pets', value: 'Not allowed' },
  { label: 'Payment', value: 'Cash accepted' },
  { label: 'Parking', value: 'Free, private, on site' },
];

export const SERVICE_HIGHLIGHTS = [
  {
    id: '1',
    title: 'Private beach area, lush garden and a terrace with sea views',
  },
  {
    id: '2',
    title: 'Free WiFi, free private parking on site and an airport shuttle',
  },
];

export const ROOM_TYPES: RoomType[] = [
  {
    id: 'deluxe-double',
    title: 'Deluxe Double Room',
    subtitle: 'Queen bed and a bunk, private bathroom and air-conditioning',
    sleeps: 3,
    bedSummary: '1 queen bed and 1 bunk bed',
    category: 'private',
    image: IMAGES.roomDouble,
    features: ['Queen bed and bunk bed', 'Private bathroom', 'Air-conditioning', 'Sea view'],
    description:
      'Our private double — a queen bed plus a bunk, room for three, with your own bathroom and air-conditioning, a short walk from the water.',
    privateBathroom: true,
    seaView: true,
  },
  {
    id: 'family-suite',
    title: 'Deluxe Family Suite',
    subtitle: 'Sleeps four to five, with two queen beds and a bunk bed',
    sleeps: 5,
    bedSummary: '2 queen beds and 1 bunk bed',
    category: 'suite',
    image: IMAGES.roomKingBed,
    features: ['Sleeps 4–5', 'Two queen beds and a bunk', 'Private bathroom', 'Air-conditioning'],
    description:
      'The largest room on site: two queen beds plus a bunk, a private bathroom and room for a family of four or five.',
    privateBathroom: true,
    seaView: true,
  },
  {
    id: 'dorm-8-mixed',
    title: 'Bed in 8-Bed Mixed Dormitory',
    subtitle: 'A bed in our largest mixed dorm',
    sleeps: 1,
    bedSummary: '1 bunk bed',
    category: 'dorm',
    // The shoot contains no dormitory interiors, so the three dorm listings below
    // use neutral shots of the building rather than a private double — showing a
    // queen room against a bunk-bed listing would misrepresent what is booked.
    // Replace all three once dorm photography exists.
    image: IMAGES.roomDoors,
    features: ['Mixed dorm', 'Air-conditioning', 'Shared bathroom', 'Locker'],
    description:
      'A bed in the eight-bed mixed dorm, air-conditioned, with a shared bathroom and space to stash your board.',
    privateBathroom: false,
    seaView: false,
  },
  {
    id: 'dorm-6-female',
    title: 'Bed in 6-Bed Female Dormitory',
    subtitle: 'Female-only dorm, six beds',
    sleeps: 1,
    bedSummary: '1 bunk bed',
    category: 'dorm',
    image: IMAGES.corridorPalms,
    features: ['Female only', 'Air-conditioning', 'Shared bathroom', 'Locker'],
    description: 'A bed in the six-bed female-only dorm, air-conditioned with a shared bathroom.',
    privateBathroom: false,
    seaView: false,
  },
  {
    id: 'dorm-female-bunk',
    title: 'Bunk Bed in Female Dormitory',
    subtitle: 'Female-only dorm, single bunk',
    sleeps: 1,
    bedSummary: '1 bunk bed',
    category: 'dorm',
    image: IMAGES.loungeChairs,
    features: ['Female only', 'Air-conditioning', 'Shared bathroom', 'Locker'],
    description: 'A single bunk in the female-only dorm — the most affordable way to stay on the beach.',
    privateBathroom: false,
    seaView: false,
  },
];

// Titles describe what is actually in each frame — nothing here is captioned as
// the beach, because the current shoot does not include one.
export const GALLERY_PHOTOS = [
  {
    id: 'g-1',
    title: 'The building on Matara Road',
    location: 'Pelena, Weligama',
    image: IMAGES.buildingFacade,
    year: 'Outside',
  },
  {
    id: 'g-2',
    title: 'The courtyard and garden',
    location: 'Weligama, Sri Lanka',
    image: IMAGES.courtyardAbove,
    year: 'Grounds',
  },
  {
    id: 'g-3',
    title: 'Connect Co-Working Space',
    location: 'The workspace, on site',
    image: IMAGES.coworkingSign,
    year: 'Work',
  },
  {
    id: 'g-4',
    title: 'Desks and monitors',
    location: 'Air-conditioned, fibre WiFi',
    image: IMAGES.coworkingDesks,
    year: 'Work',
  },
  {
    id: 'g-5',
    title: 'A working morning',
    location: 'Before the wind comes up',
    image: IMAGES.coworkingPeople,
    year: 'Work',
  },
  {
    id: 'g-6',
    title: 'Two screens and a deadline',
    location: 'Monitors at the far desks',
    image: IMAGES.coworkingMonitors,
    year: 'Work',
  },
  {
    id: 'g-7',
    title: 'The soft end of the office',
    location: 'For the reading half of the job',
    image: IMAGES.coworkingBeanbag,
    year: 'Work',
  },
  {
    id: 'g-8',
    title: 'The long communal table',
    location: 'Where the evenings start',
    image: IMAGES.communalTable,
    year: 'Coliving',
  },
  {
    id: 'g-9',
    title: 'The shared lounge',
    location: 'Rattan, murals and ceiling fans',
    image: IMAGES.loungeSeating,
    year: 'Coliving',
  },
  {
    id: 'g-10',
    title: 'Deluxe Double Room',
    location: 'Air-conditioned, with a private bathroom',
    image: IMAGES.roomDouble,
    year: 'Rooms',
  },
  {
    id: 'g-11',
    title: 'The garden terrace',
    location: 'Yoga classes and evening entertainment',
    image: IMAGES.gardenTerraceDay,
    year: 'Coliving',
  },
  {
    id: 'g-12',
    title: 'The terrace after dark',
    location: 'Where most evenings end up',
    image: IMAGES.terraceNight,
    year: 'Coliving',
  },
];
