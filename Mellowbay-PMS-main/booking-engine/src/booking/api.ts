import {
  AvailabilityResult,
  BookingModel,
  BookingSelection,
  Catalog,
  DEFAULT_PRICES,
  ExtrasConfig,
  PriceConfig,
  RoomKind,
  RoomTypeOption,
} from '../domain/index';

/**
 * Client for the booking API, as used by the public site.
 *
 * Three public endpoints: the catalog (what the property sells and for how
 * much), availability (what those rooms cost for a given set of dates), and
 * the reservation POST. Everything privileged belongs to the admin app.
 *
 * The rooms, rates, occupancy limits and currency on /book are the PMS's own —
 * nothing about them is authored here. The API is still optional: set
 * VITE_API_URL to point the site at a running backend. With it unset the site
 * prices from bundled placeholders and cannot submit, which is what the
 * statically-hosted build does.
 */

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

/**
 * Which property to ask for. A single-property PMS needs this at all — it
 * answers for the only one it has — so it is only for an installation running
 * more than one.
 */
const PROPERTY_CODE = import.meta.env.VITE_PROPERTY_CODE?.trim() ?? '';
const PROPERTY_ID = import.meta.env.VITE_PROPERTY_ID?.trim() ?? '';

export const apiEnabled = true;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Appends the property hint the public endpoints accept, when there is one. */
function withProperty(path: string): string {
  if (!PROPERTY_CODE && !PROPERTY_ID) return path;
  const sep = path.includes('?') ? '&' : '?';
  const key = PROPERTY_CODE ? 'propertyCode' : 'propertyId';
  return `${path}${sep}${key}=${encodeURIComponent(PROPERTY_CODE || PROPERTY_ID)}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    // No credentials. This is a public website: the three endpoints it uses are
    // unauthenticated by design, and a token shipped in a browser bundle is a
    // token published to everyone who opens the page.
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    };

    res = await fetch(BASE + path, {
      ...init,
      headers,
    });
  } catch {
    // fetch only rejects on network-level failure, which callers must be able
    // to tell apart from a 4xx in order to fall back.
    throw new ApiError('Could not reach the booking service.', 0);
  }

  const body = (await res.json().catch(() => null)) as
    | (T & { error?: string; details?: string[] })
    | null;

  if (!res.ok) {
    throw new ApiError(
      body?.error ?? `Request failed (${res.status})`,
      res.status,
      body?.details ?? [],
    );
  }
  return body as T;
}

/* -------------------------------------------------------------- catalog -- */

/** Rooms, rates, occupancy and currency, live from the PMS. */
export const fetchCatalog = () =>
  request<Catalog>(withProperty('/api/public/booking-engine/catalog'));

/**
 * Price and availability per room type for one set of dates.
 *
 * `model` goes with the dates because it moves the price: a model the property
 * sells as a package is quoted off that package's rate plan, so switching from
 * "rooms" to "rooms + surf" asks a different question of the PMS rather than
 * adding anything in the browser.
 */
export const fetchAvailability = (opts: {
  checkIn: string;
  checkOut: string;
  adults: number;
  model: BookingModel;
  signal?: AbortSignal;
}) =>
  request<AvailabilityResult>(
    withProperty(
      `/api/public/booking-engine/availability?checkIn=${opts.checkIn}`
      + `&checkOut=${opts.checkOut}&adults=${opts.adults}`
      + `&model=${encodeURIComponent(opts.model)}`,
    ),
    { signal: opts.signal },
  );

const minorToMajor = (minor: number) => Math.round(minor) / 100;

/**
 * The PMS catalog in the shape the local price model wants.
 *
 * Only the extras and a per-kind room summary survive the translation: the
 * room step itself renders from `catalog.roomTypes` directly, and the real
 * money comes from the availability call. This exists so a screen that has not
 * got an availability answer yet — the model step, an unpriced date range —
 * still shows the property's own figures instead of the bundled placeholders.
 *
 * `marginPct` is zero throughout: a PMS rate is already the selling price.
 */
export function catalogToPriceConfig(catalog: Catalog): PriceConfig {
  const rooms = {} as PriceConfig['rooms'];
  for (const kind of ['dorm', 'double', 'family'] as RoomKind[]) {
    const ofKind = catalog.roomTypes.filter((rt) => rt.bookingKind === kind);
    // The cheapest of a shape is what "from …" quotes, and what the site falls
    // back to when the guest has not picked a specific room type.
    const cheapest = ofKind.reduce<RoomTypeOption | null>(
      (best, rt) => (best === null || rt.fromNightlyMinor < best.fromNightlyMinor ? rt : best),
      null,
    );
    rooms[kind] = cheapest
      ? {
        basePerNight: minorToMajor(cheapest.fromNightlyMinor),
        perExtraPersonPerNight: minorToMajor(cheapest.extraAdultMinor),
        includedPeople: Math.max(1, cheapest.baseOccupancy),
        // A dorm sells beds, so a party of four is four beds rather than a
        // room that holds four; the counter must not stop at one.
        maxPeople: cheapest.kind === 'dorm'
          ? Math.max(1, cheapest.unitsTotal || 8)
          : Math.max(1, cheapest.maxOccupancy),
        marginPct: 0,
      }
      // A property with nothing of this shape keeps the placeholder, which the
      // room step will not offer anyway — there is no room type behind it.
      : DEFAULT_PRICES.rooms[kind];
  }

  return {
    currency: catalog.currency || DEFAULT_PRICES.currency,
    rooms,
    coworking: {
      seatPerDay: {
        normal: minorToMajor(catalog.extras.coworking.seatPerDayMinor.normal),
        office: minorToMajor(catalog.extras.coworking.seatPerDayMinor.office),
      },
      marginPct: catalog.extras.coworking.marginPct,
    },
    surf: {
      lesson: mapLessons(catalog.extras),
    },
    addons: {
      airportPickup: catalog.extras.addons.airportPickup.length
        ? catalog.extras.addons.airportPickup.map((b) => ({
          upToPeople: b.upToPeople,
          price: minorToMajor(b.priceMinor),
        }))
        : DEFAULT_PRICES.addons.airportPickup,
    },
  };
}

function mapLessons(extras: ExtrasConfig): PriceConfig['surf']['lesson'] {
  const out = {} as PriceConfig['surf']['lesson'];
  for (const level of ['beginner', 'intermediate', 'advanced'] as const) {
    out[level] = {
      general: minorToMajor(extras.surf.lessonMinor[level].general),
      private: minorToMajor(extras.surf.lessonMinor[level].private),
    };
  }
  return out;
}

/* ---------------------------------------------------------- reservation -- */

export interface ReservationCreateResponse {
  id: string;
  confirmation: string;
  status: string;
  /**
   * How many units the booking took: beds for a dorm party, one otherwise.
   *
   * A dorm party is one reservation per bed in the PMS, because a bed is what
   * gets assigned, priced and cleaned. The site is told the count so it can say
   * what was actually booked.
   */
  units?: number;
  /**
   * Always true from the public endpoint. The property has to accept a booking
   * before it holds anything, so the site must not tell the guest their room is
   * held — only that the request is in.
   */
  awaitingConfirmation?: boolean;
}

/**
 * Send the booking.
 *
 * One path, and it is the public one. The site posts the guest's selection as
 * they made it and the PMS resolves the room type, the rate plan and the price
 * itself. That is not a convenience: a browser cannot be trusted to name the
 * plan a booking is billed at, and the earlier privileged path — an API token
 * and hard-coded room-type ids shipped in the bundle — both duplicated that
 * logic and published a credential to anyone who opened the page.
 */
export const submitReservation = (selection: BookingSelection) =>
  request<ReservationCreateResponse>(withProperty('/api/public/booking-engine/reservations'), {
    method: 'POST',
    body: JSON.stringify(selection),
  });

/* -------------------------------------------------- self-registration -- */

/**
 * The check-in form a guest opens by scanning the QR code at the desk.
 *
 * The token in the URL is the whole credential, so these two calls carry no
 * property hint and no identity of their own — the PMS resolves the booking
 * from the token and tells us only what the person holding it already knows.
 */
export interface RegistrationContext {
  property: string;
  guest: string;
  confirmation: string;
  arrival: string;
  departure: string;
  nights: number;
  roomType: string;
  checkInTime: string;
  /** True once they have sent something; the form then reads as a correction. */
  submitted: boolean;
  previous: RegistrationSubmission | null;
  hasIdPhoto: boolean;
  hasSignature: boolean;
}

export interface RegistrationSubmission {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  nationality?: string | null;
  dob?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  idExpiry?: string | null;
  address?: {
    line1?: string | null; line2?: string | null; city?: string | null;
    postcode?: string | null; country?: string | null;
  } | null;
  idPhoto?: { mime: string; data: string } | null;
  signature?: { mime: string; data: string } | null;
  marketingConsent?: boolean;
}

export const fetchRegistration = (token: string) =>
  request<RegistrationContext>(`/api/public/registration/${encodeURIComponent(token)}`);

export const sendRegistration = (token: string, body: RegistrationSubmission) =>
  request<{ ok: boolean; submissions: number }>(
    `/api/public/registration/${encodeURIComponent(token)}`,
    { method: 'POST', body: JSON.stringify(body) },
  );
