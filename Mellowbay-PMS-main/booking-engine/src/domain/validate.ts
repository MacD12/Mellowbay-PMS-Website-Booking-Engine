import { DEFAULT_PRICES } from './pricing.js';
import {
  BookingModel,
  BookingSelection,
  LESSON_LABELS,
  LEVEL_LABELS,
  MODEL_INCLUDES,
  PriceConfig,
  ROOM_LABELS,
  SEAT_LABELS,
  SurfGuest,
} from './types.js';

/**
 * Validators for anything arriving over the network.
 *
 * Deliberately strict and total: every field is checked, unknown values are
 * rejected rather than coerced, and numbers must be finite and in range. A
 * price config is the input that decides what guests are charged, so a bad
 * write here is a pricing incident — "looks about right" is not good enough.
 */

export type Validated<T> = { ok: true; value: T } | { ok: false; errors: string[] };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Finite, non-negative, and within a sane ceiling — no NaN, no Infinity. */
function num(
  v: unknown,
  path: string,
  errors: string[],
  { min = 0, max = 1_000_000, integer = true }: { min?: number; max?: number; integer?: boolean } = {},
): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    errors.push(`${path} must be a finite number`);
    return null;
  }
  if (integer && !Number.isInteger(v)) {
    errors.push(`${path} must be a whole number`);
    return null;
  }
  if (v < min || v > max) {
    errors.push(`${path} must be between ${min} and ${max}`);
    return null;
  }
  return v;
}

function str(v: unknown, path: string, errors: string[], maxLen = 500): string | null {
  if (typeof v !== 'string') {
    errors.push(`${path} must be a string`);
    return null;
  }
  if (v.length > maxLen) {
    errors.push(`${path} must be ${maxLen} characters or fewer`);
    return null;
  }
  return v;
}

function oneOf<T extends string>(
  v: unknown,
  allowed: readonly T[],
  path: string,
  errors: string[],
): T | null {
  if (typeof v !== 'string' || !allowed.includes(v as T)) {
    errors.push(`${path} must be one of: ${allowed.join(', ')}`);
    return null;
  }
  return v as T;
}

/** yyyy-mm-dd, and a date that actually exists (rejects 2026-02-31). */
function isoDate(v: unknown, path: string, errors: string[]): string | null {
  const s = str(v, path, errors, 10);
  if (s === null) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    errors.push(`${path} must be a date in yyyy-mm-dd form`);
    return null;
  }
  const parsed = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== s) {
    errors.push(`${path} is not a real date`);
    return null;
  }
  return s;
}

const ROOM_KINDS = Object.keys(ROOM_LABELS) as (keyof typeof ROOM_LABELS)[];
const SEAT_TYPES = Object.keys(SEAT_LABELS) as (keyof typeof SEAT_LABELS)[];
const LEVELS = Object.keys(LEVEL_LABELS) as (keyof typeof LEVEL_LABELS)[];
const LESSON_TYPES = Object.keys(LESSON_LABELS) as (keyof typeof LESSON_LABELS)[];
const MODELS = Object.keys(MODEL_INCLUDES) as BookingModel[];

/* ------------------------------------------------------------ price config -- */

export function validatePriceConfig(input: unknown): Validated<PriceConfig> {
  const errors: string[] = [];
  if (!isObject(input)) return { ok: false, errors: ['body must be an object'] };

  const currency = str(input.currency, 'currency', errors, 8) ?? DEFAULT_PRICES.currency;
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    errors.push('currency must be a 3-letter ISO code, e.g. EUR');
  }

  const rooms = {} as PriceConfig['rooms'];
  const roomsIn = isObject(input.rooms) ? input.rooms : {};
  for (const kind of ROOM_KINDS) {
    const r = isObject(roomsIn[kind]) ? (roomsIn[kind] as Record<string, unknown>) : null;
    if (!r) {
      errors.push(`rooms.${kind} is missing`);
      continue;
    }
    const includedPeople = num(r.includedPeople, `rooms.${kind}.includedPeople`, errors, { min: 1, max: 20 });
    const maxPeople = num(r.maxPeople, `rooms.${kind}.maxPeople`, errors, { min: 1, max: 20 });
    if (includedPeople !== null && maxPeople !== null && includedPeople > maxPeople) {
      errors.push(`rooms.${kind}.includedPeople cannot exceed maxPeople`);
    }
    rooms[kind] = {
      basePerNight: num(r.basePerNight, `rooms.${kind}.basePerNight`, errors, { max: 100_000 }) ?? 0,
      perExtraPersonPerNight:
        num(r.perExtraPersonPerNight, `rooms.${kind}.perExtraPersonPerNight`, errors, { max: 100_000 }) ?? 0,
      includedPeople: includedPeople ?? 1,
      maxPeople: maxPeople ?? 1,
      marginPct: num(r.marginPct, `rooms.${kind}.marginPct`, errors, { max: 1000 }) ?? 0,
    };
  }

  const cwIn = isObject(input.coworking) ? input.coworking : {};
  const seatIn = isObject(cwIn.seatPerDay) ? cwIn.seatPerDay : {};
  const seatPerDay = {} as PriceConfig['coworking']['seatPerDay'];
  for (const t of SEAT_TYPES) {
    seatPerDay[t] = num(seatIn[t], `coworking.seatPerDay.${t}`, errors, { max: 100_000 }) ?? 0;
  }

  const lessonIn = isObject(input.surf) && isObject(input.surf.lesson) ? input.surf.lesson : {};
  const lesson = {} as PriceConfig['surf']['lesson'];
  for (const level of LEVELS) {
    const row = isObject(lessonIn[level]) ? (lessonIn[level] as Record<string, unknown>) : {};
    lesson[level] = {} as PriceConfig['surf']['lesson'][typeof level];
    for (const type of LESSON_TYPES) {
      lesson[level][type] = num(row[type], `surf.lesson.${level}.${type}`, errors, { max: 100_000 }) ?? 0;
    }
  }

  const addonsIn = isObject(input.addons) ? input.addons : {};
  const bandsIn = Array.isArray(addonsIn.airportPickup) ? addonsIn.airportPickup : null;
  let airportPickup: PriceConfig['addons']['airportPickup'] = [];
  if (!bandsIn || bandsIn.length === 0) {
    errors.push('addons.airportPickup must be a non-empty array of bands');
  } else if (bandsIn.length > 20) {
    errors.push('addons.airportPickup cannot have more than 20 bands');
  } else {
    airportPickup = bandsIn.map((b, i) => ({
      upToPeople: num(isObject(b) ? b.upToPeople : undefined, `addons.airportPickup[${i}].upToPeople`, errors, {
        min: 1,
        max: 100,
      }) ?? 1,
      price: num(isObject(b) ? b.price : undefined, `addons.airportPickup[${i}].price`, errors, {
        max: 100_000,
      }) ?? 0,
    }));
    // The lookup takes the first band that covers the party, so an unsorted
    // list would silently price a large group off a small band.
    const sorted = [...airportPickup].sort((a, b) => a.upToPeople - b.upToPeople);
    airportPickup = sorted;
  }

  // Must be validated before the error check below, or a bad margin would be
  // silently accepted as 0 — every price would quietly lose its markup.
  const coworkingMargin = num(cwIn.marginPct, 'coworking.marginPct', errors, { max: 1000 }) ?? 0;

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      currency,
      rooms,
      coworking: { seatPerDay, marginPct: coworkingMargin },
      surf: { lesson },
      addons: { airportPickup },
    },
  };
}

/* --------------------------------------------------------------- selection -- */

export function validateSelection(input: unknown, config: PriceConfig): Validated<BookingSelection> {
  const errors: string[] = [];
  if (!isObject(input)) return { ok: false, errors: ['body must be an object'] };

  const model = oneOf(input.model, MODELS, 'model', errors);
  const checkIn = isoDate(input.checkIn, 'checkIn', errors);
  const checkOut = isoDate(input.checkOut, 'checkOut', errors);
  if (checkIn && checkOut && checkOut <= checkIn) {
    errors.push('checkOut must be after checkIn');
  }

  const roomIn = isObject(input.room) ? input.room : {};
  const kind = oneOf(roomIn.kind, ROOM_KINDS, 'room.kind', errors);
  // Capacity is bounded by the live config, not by the client's idea of it.
  const maxPeople = kind ? config.rooms[kind].maxPeople : 20;
  const people = num(roomIn.people, 'room.people', errors, { min: 1, max: maxPeople });
  // Optional: names a PMS room type outright. Whether it exists is the
  // server's to decide — it owns the room types — so this only checks shape.
  const roomTypeId = roomIn.roomTypeId === undefined || roomIn.roomTypeId === ''
    ? ''
    : str(roomIn.roomTypeId, 'room.roomTypeId', errors, 64) ?? '';

  const cwIn = isObject(input.coworking) ? input.coworking : {};
  const seatType = oneOf(cwIn.seatType, SEAT_TYPES, 'coworking.seatType', errors);
  const seats = num(cwIn.seats, 'coworking.seats', errors, { min: 0, max: 100 });

  const surfIn = isObject(input.surf) ? input.surf : {};
  const surfDate = isoDate(surfIn.date, 'surf.date', errors);
  const guestsIn = Array.isArray(surfIn.guests) ? surfIn.guests : [];
  if (guestsIn.length > 50) errors.push('surf.guests cannot exceed 50 people');
  const guests: SurfGuest[] = guestsIn.slice(0, 50).map((g, i) => {
    const o = isObject(g) ? g : {};
    return {
      id: str(o.id, `surf.guests[${i}].id`, errors, 64) ?? `g${i}`,
      name: str(o.name ?? '', `surf.guests[${i}].name`, errors, 120) ?? '',
      level: oneOf(o.level, LEVELS, `surf.guests[${i}].level`, errors) ?? 'beginner',
      lessonType: oneOf(o.lessonType, LESSON_TYPES, `surf.guests[${i}].lessonType`, errors) ?? 'general',
    };
  });
  // A surf model with nobody surfing would quote a stay with no lessons in it.
  if (model && MODEL_INCLUDES[model].surf && guests.length === 0) {
    errors.push('surf.guests must contain at least one person for a surf booking');
  }

  const addonsIn = isObject(input.addons) ? input.addons : {};
  if (addonsIn.airportPickup !== undefined && typeof addonsIn.airportPickup !== 'boolean') {
    errors.push('addons.airportPickup must be true or false');
  }

  const contactIn = isObject(input.contact) ? input.contact : {};
  const contact = {
    name: str(contactIn.name ?? '', 'contact.name', errors, 120) ?? '',
    email: str(contactIn.email ?? '', 'contact.email', errors, 200) ?? '',
    phone: str(contactIn.phone ?? '', 'contact.phone', errors, 60) ?? '',
    notes: str(contactIn.notes ?? '', 'contact.notes', errors, 2000) ?? '',
  };

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      model: model!,
      checkIn: checkIn!,
      checkOut: checkOut!,
      room: { kind: kind!, people: people!, roomTypeId },
      coworking: { seatType: seatType!, seats: seats! },
      surf: { date: surfDate!, guests },
      addons: { airportPickup: addonsIn.airportPickup === true },
      contact,
    },
  };
}

/** An enquiry additionally needs a usable way to reply. */
export function validateEnquiryContact(selection: BookingSelection): string[] {
  const errors: string[] = [];
  if (selection.contact.name.trim().length < 2) errors.push('contact.name is required');
  // Deliberately loose: the only reliable test of an address is sending to it.
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(selection.contact.email.trim())) {
    errors.push('contact.email must be a valid email address');
  }
  return errors;
}
