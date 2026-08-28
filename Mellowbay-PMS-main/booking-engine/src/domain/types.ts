/**
 * Domain for the booking engine, transcribed from the price-management chart.
 *
 * The chart's four "Booking Models" are the spine: each one switches on some
 * combination of rooms, coworking and surf, and every model always includes
 * rooms. Everything else hangs off that choice.
 */

export type RoomKind = 'dorm' | 'double' | 'family';
export type SurfLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'general' | 'private';
export type SeatType = 'normal' | 'office';

export type BookingModel = 'rooms' | 'rooms-coworking' | 'rooms-surf' | 'rooms-coworking-surf';

/** Which sections a given model turns on. Rooms are in every model. */
export const MODEL_INCLUDES: Record<BookingModel, { coworking: boolean; surf: boolean }> = {
  rooms: { coworking: false, surf: false },
  'rooms-coworking': { coworking: true, surf: false },
  'rooms-surf': { coworking: false, surf: true },
  'rooms-coworking-surf': { coworking: true, surf: true },
};

export const MODEL_LABELS: Record<BookingModel, { title: string; detail: string }> = {
  rooms: { title: 'Rooms', detail: 'A bed or a private room, nothing else.' },
  'rooms-coworking': { title: 'Rooms + coworking', detail: 'Somewhere to sleep and a desk.' },
  'rooms-surf': { title: 'Rooms + surf', detail: 'A stay with surf lessons.' },
  'rooms-coworking-surf': {
    title: 'Rooms + coworking + surf',
    detail: 'The full stay — bed, desk and lessons.',
  },
};

export const ROOM_LABELS: Record<RoomKind, string> = {
  dorm: 'Dorm bed',
  double: 'Double room',
  family: 'Family room',
};

export const SEAT_LABELS: Record<SeatType, string> = {
  normal: 'Normal chair',
  office: 'Office chair',
};

export const LEVEL_LABELS: Record<SurfLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const LESSON_LABELS: Record<LessonType, string> = {
  general: 'General',
  private: 'Private',
};

/* ---------------------------------------------------------------- pricing -- */

export interface RoomPricing {
  /** Nightly rate covering `includedPeople`. The admin screen's +/- counter. */
  basePerNight: number;
  /** The chart's "People Count Based Change this Room". */
  perExtraPersonPerNight: number;
  includedPeople: number;
  maxPeople: number;
  /** The chart's "Profit Margin", as a percentage added to cost. */
  marginPct: number;
}

export interface PriceConfig {
  currency: string;
  rooms: Record<RoomKind, RoomPricing>;
  coworking: {
    /** "Chair Based Change Co-Working Space Prices" — per seat, per day. */
    seatPerDay: Record<SeatType, number>;
    /** The chart's "Co-Working Margin". */
    marginPct: number;
  };
  surf: {
    /** The chart's lesson-price matrix: level x lesson type, per person. */
    lesson: Record<SurfLevel, Record<LessonType, number>>;
  };
  addons: {
    /**
     * Airport pickup is priced by party size, not per head — the chart shows
     * 3 people at 75 and 4 at 100. Bands are matched on the first `upToPeople`
     * that covers the party, so they must stay sorted ascending.
     */
    airportPickup: { upToPeople: number; price: number }[];
  };
}

/* ---------------------------------------------------------------- PMS -- */

/**
 * What the PMS publishes about itself.
 *
 * Rooms, rates, occupancy limits and currency are the property's, read live
 * from `/api/public/booking-engine/catalog`. Nothing here is authored on the
 * site: change a room name or a rate in the PMS and the booking page shows it.
 * `DEFAULT_PRICES` below is only the standby for a site built with no API.
 */
export interface PropertyInfo {
  code: string;
  name: string;
  kind: string;
  city: string | null;
  country: string | null;
  address: string | null;
  timezone: string;
  currency: string;
  locale: string;
  businessDate: string;
  checkInTime: string;
  checkOutTime: string;
  phone: string | null;
  email: string | null;
  website: string | null;
}

export interface RatePlanInfo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  refundable: boolean;
  inclusions: string[];
  minLos: number | null;
  maxLos: number | null;
  depositPctBp: number;
}

export interface TaxInfo {
  code: string;
  name: string;
  mode: string;
  value: number;
}

/** One sellable room type, as the PMS holds it. Money is in minor units. */
export interface RoomTypeOption {
  id: string;
  code: string;
  name: string;
  description: string | null;
  kind: 'room' | 'dorm';
  /** Which of the site's three shapes this type sells as. */
  bookingKind: RoomKind;
  baseOccupancy: number;
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  genderPolicy: string | null;
  amenities: string[];
  bedConfig: { kind: string; count: number }[];
  extraAdultMinor: number;
  extraChildMinor: number;
  /** Lowest nightly rate on the calendar in the next 90 days. */
  fromNightlyMinor: number;
  unitsTotal: number;
  unitsAvailableTonight: number;
}

export interface ExtrasConfig {
  coworking: {
    seatPerDayMinor: Record<SeatType, number>;
    marginPct: number;
  };
  surf: {
    lessonMinor: Record<SurfLevel, Record<LessonType, number>>;
  };
  addons: {
    airportPickup: { upToPeople: number; priceMinor: number }[];
  };
}

/**
 * A model the property sells as a package, and the rate plan that prices it.
 *
 * Its presence is the whole signal: a model listed here is quoted at the
 * property's own package rate — one price covering the room, the desk and the
 * lessons — and a model absent from it is priced from the room rate with the
 * extras added on, which is how everything was priced before packages existed.
 */
export interface PackageInfo {
  model: BookingModel;
  ratePlanId: string;
  code: string;
  name: string;
  description: string | null;
  inclusions: string[];
  refundable: boolean;
  minLos: number | null;
  maxLos: number | null;
  depositPctBp: number;
}

export interface Catalog {
  property: PropertyInfo;
  currency: string;
  ratePlan: RatePlanInfo;
  roomTypes: RoomTypeOption[];
  taxes: TaxInfo[];
  extras: ExtrasConfig;
  /** Empty on a property that prices every model from the room rate. */
  packages: PackageInfo[];
}

/** What one room type costs, and whether it can be sold, for chosen dates. */
export interface RoomAvailability {
  roomTypeId: string;
  available: number;
  /** Beds for a dorm party, one room otherwise. */
  unitsNeeded: number;
  sellable: boolean;
  violations: { type: string; date: string; message: string }[];
  nights: number;
  roomTotalMinor: number;
  taxTotalMinor: number;
  grandTotalMinor: number;
  averageNightlyMinor: number;
  nightly: { date: string; rateMinor: number }[];
}

export interface AvailabilityResult {
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  currency: string;
  businessDate: string;
  /** The model these prices were quoted for. */
  model: BookingModel | null;
  ratePlanId: string;
  /**
   * True when the totals below are the whole package rather than the room
   * alone. The desk and the lessons are already inside them, so adding the
   * extras on top would charge for them twice.
   */
  packaged: boolean;
  packageName: string | null;
  options: RoomAvailability[];
}

/* -------------------------------------------------------------- selection -- */

export interface SurfGuest {
  id: string;
  name: string;
  level: SurfLevel;
  lessonType: LessonType;
}

export interface BookingSelection {
  model: BookingModel;
  checkIn: string;
  checkOut: string;
  /**
   * `roomTypeId` names a PMS room type outright; `kind` stays alongside it so
   * a booking made before the catalog answered still resolves to something
   * sensible server-side.
   */
  room: { kind: RoomKind; people: number; roomTypeId: string };
  coworking: { seatType: SeatType; seats: number };
  surf: { date: string; guests: SurfGuest[] };
  addons: { airportPickup: boolean };
  contact: { name: string; email: string; phone: string; notes: string };
}

/* ------------------------------------------------------------------ quote -- */

export interface QuoteLine {
  id: string;
  label: string;
  detail: string;
  amount: number;
}

export interface Quote {
  lines: QuoteLine[];
  total: number;
  currency: string;
  nights: number;
}

/* --------------------------------------------------------------- enquiry -- */

export const ENQUIRY_STATUSES = ['new', 'contacted', 'confirmed', 'closed'] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  confirmed: 'Confirmed',
  closed: 'Closed',
};

/**
 * A submitted booking request.
 *
 * `quote` is the server's own calculation at the time of submission, kept
 * verbatim: repricing an old enquiry against today's config would silently
 * change what a guest was quoted.
 */
export interface Enquiry {
  id: string;
  createdAt: string;
  updatedAt?: string;
  selection: BookingSelection;
  quote: Quote;
  status: EnquiryStatus;
  /** Internal notes, not visible to the guest. */
  staffNotes?: string;
}
