import {
  BookingModel,
  BookingSelection,
  LESSON_LABELS,
  LEVEL_LABELS,
  MODEL_INCLUDES,
  MODEL_LABELS,
  PriceConfig,
  Quote,
  QuoteLine,
  ROOM_LABELS,
  SEAT_LABELS,
} from './types.js';

/**
 * The standby price table.
 *
 * Live prices come from the PMS — see `booking/api.ts` — and this is what the
 * site quotes from only when there is no API to ask: a statically-hosted build,
 * or a backend that is briefly unreachable. Every figure is a placeholder, so
 * anything it prices is a rough estimate rather than the property's rate.
 */
export const DEFAULT_PRICES: PriceConfig = {
  currency: 'EUR',
  rooms: {
    dorm: {
      basePerNight: 18,
      perExtraPersonPerNight: 0,
      includedPeople: 1,
      maxPeople: 1,
      marginPct: 20,
    },
    double: {
      basePerNight: 55,
      perExtraPersonPerNight: 15,
      includedPeople: 2,
      maxPeople: 3,
      marginPct: 25,
    },
    family: {
      basePerNight: 90,
      perExtraPersonPerNight: 18,
      includedPeople: 4,
      maxPeople: 5,
      marginPct: 25,
    },
  },
  coworking: {
    seatPerDay: { normal: 8, office: 12 },
    marginPct: 15,
  },
  surf: {
    lesson: {
      beginner: { general: 35, private: 60 },
      intermediate: { general: 40, private: 70 },
      advanced: { general: 45, private: 80 },
    },
  },
  addons: {
    airportPickup: [
      { upToPeople: 3, price: 75 },
      { upToPeople: 4, price: 100 },
    ],
  },
};

const MS_PER_NIGHT = 24 * 60 * 60 * 1000;

/**
 * Nights between two yyyy-mm-dd strings. Parsed as UTC so a DST boundary in the
 * viewer's timezone cannot round a stay to the wrong number of nights.
 */
export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = Date.parse(`${checkIn}T00:00:00Z`);
  const b = Date.parse(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / MS_PER_NIGHT));
}

/** Cost plus the configured margin, rounded to whole currency units. */
export function withMargin(cost: number, marginPct: number): number {
  return Math.round(cost * (1 + marginPct / 100));
}

/**
 * Airport pickup is charged per party. Bands are "up to N people"; a party
 * larger than every band falls back to the largest one rather than going free.
 */
export function airportPickupPrice(config: PriceConfig, people: number): number {
  const bands = config.addons.airportPickup;
  if (!bands.length) return 0;
  const match = bands.find((b) => people <= b.upToPeople);
  return match ? match.price : bands[bands.length - 1].price;
}

/**
 * The room line, priced by the PMS rather than by this browser.
 *
 * The property's own engine knows things this one cannot — calendar rates,
 * length-of-stay pricing and yield rules — so when it has answered for these
 * dates its figure is the figure, and the local price model is only the
 * standby for a site with no API behind it.
 *
 * Tax is not part of it. The PMS can compute it, but the quote here shows the
 * room rate the property set, and tax is added at the property.
 */
export interface RoomLine {
  /** The PMS room type's own name, e.g. "Deluxe Double Room". */
  label: string;
  /** Room total for the whole stay, before tax. */
  total: number;
  /** Appended to the "3 nights · 2 guests" line. */
  note?: string;
  /**
   * True when `total` is the property's package rate — the whole thing the
   * guest chose, not the room half of it.
   *
   * The property sets that price per date in the PMS, the same way it sets a
   * room rate, so the desk and the lessons are already inside it. Pricing the
   * parts again and adding them would charge for them twice.
   */
  packaged?: boolean;
  /** The package's own name, e.g. "Rooms + surf". */
  packageLabel?: string;
}

/**
 * Models sold as one price rather than as a bill of parts.
 *
 * A guest choosing "rooms + surf" is buying a surf trip, not a room and some
 * lessons they have to add up. The parts are still priced exactly as they are
 * anywhere else — the room from the PMS, the lessons per surfer, the desk per
 * day — and then shown as a single figure with what it covers underneath.
 *
 * Rooms and rooms + coworking stay itemised: there is nothing to bundle in the
 * first, and the second is a room with a desk beside it rather than a package
 * the property sells under a name.
 */
export const PACKAGE_MODELS: ReadonlySet<BookingModel> = new Set<BookingModel>([
  'rooms-surf',
  'rooms-coworking-surf',
]);

/**
 * Turns a selection into an itemised quote.
 *
 * Pure, and the single place price is decided — the steps and the review screen
 * both render from this rather than each doing their own arithmetic.
 */
export function quote(selection: BookingSelection, config: PriceConfig, roomLine?: RoomLine): Quote {
  const includes = MODEL_INCLUDES[selection.model];
  const nights = nightsBetween(selection.checkIn, selection.checkOut);

  // Nothing is priced until there is a stay to price.
  //
  // Every part of this quote is charged against the nights: the room and the
  // desk obviously so, and the lessons because they are lessons taken during a
  // stay rather than vouchers sold on their own. Pricing them before the guest
  // has said when they are coming put a total on screen — surfers, a desk, a
  // figure at the bottom — for a booking that did not yet exist.
  if (nights <= 0) {
    return { lines: [], total: 0, currency: config.currency, nights: 0 };
  }

  const lines: QuoteLine[] = [];

  // --- The property's own package rate ---
  // One price, set in the PMS against these dates, covering everything the
  // model includes. The parts are not priced at all in this branch: there is
  // nothing to add them to, and a package whose price is the sum of its parts
  // is not a package the property can move independently.
  if (roomLine?.packaged && nights > 0) {
    const packaged: QuoteLine[] = [{
      id: 'package',
      label: roomLine.packageLabel ?? `${MODEL_LABELS[selection.model].title} package`,
      detail: packageDetail(selection, nights, roomLine.label),
      amount: roomLine.total,
    }];
    addAirportPickup(packaged, selection, config, includes.surf);
    return {
      lines: packaged,
      total: packaged.reduce((sum, l) => sum + l.amount, 0),
      currency: config.currency,
      nights,
    };
  }

  // --- Rooms: in every model ---
  const room = config.rooms[selection.room.kind];
  if (nights > 0) {
    const extraPeople = Math.max(0, selection.room.people - room.includedPeople);
    const perNight = room.basePerNight + extraPeople * room.perExtraPersonPerNight;
    const extraNote = extraPeople > 0 ? ` · ${extraPeople} extra guest${extraPeople > 1 ? 's' : ''}` : '';
    const note = roomLine?.note ? ` · ${roomLine.note}` : extraNote;
    lines.push({
      id: 'room',
      label: roomLine?.label ?? ROOM_LABELS[selection.room.kind],
      detail: `${nights} night${nights > 1 ? 's' : ''} · ${selection.room.people} guest${
        selection.room.people > 1 ? 's' : ''
      }${note}`,
      amount: roomLine ? roomLine.total : withMargin(perNight * nights, room.marginPct),
    });
  }

  // --- Coworking: seats x days, priced by chair type ---
  if (includes.coworking && nights > 0 && selection.coworking.seats > 0) {
    const perDay = config.coworking.seatPerDay[selection.coworking.seatType];
    const cost = perDay * selection.coworking.seats * nights;
    lines.push({
      id: 'coworking',
      label: 'Coworking',
      detail: `${selection.coworking.seats} × ${SEAT_LABELS[
        selection.coworking.seatType
      ].toLowerCase()} · ${nights} day${nights > 1 ? 's' : ''}`,
      amount: withMargin(cost, config.coworking.marginPct),
    });
  }

  // --- Surf: one line per guest, priced by their own level and lesson type ---
  if (includes.surf) {
    selection.surf.guests.forEach((guest, i) => {
      const price = config.surf.lesson[guest.level][guest.lessonType];
      lines.push({
        id: `surf-${guest.id}`,
        label: guest.name.trim() || `Surfer ${i + 1}`,
        detail: `${LEVEL_LABELS[guest.level]} · ${LESSON_LABELS[guest.lessonType]} lesson`,
        amount: price,
      });
    });
  }

  // --- The package ---
  // Collapsed here rather than at each push above, so the parts stay priced in
  // exactly one place whether or not this model happens to be a package.
  const packaged = PACKAGE_MODELS.has(selection.model)
    ? collapseToPackage(lines, selection, nights)
    : lines;

  addAirportPickup(packaged, selection, config, includes.surf);

  return {
    lines: packaged,
    total: packaged.reduce((sum, l) => sum + l.amount, 0),
    currency: config.currency,
    nights,
  };
}

/**
 * What a package line says it covers: "double room, 3 nights · 2 desks · 2 surfers".
 *
 * `roomLabel` is the PMS room type's own name when there is one, so a package
 * quote names the room the property sells rather than the site's own word for
 * its shape.
 */
function packageDetail(selection: BookingSelection, nights: number, roomLabel?: string): string {
  const parts: string[] = [];
  if (nights > 0) {
    const room = (roomLabel ?? ROOM_LABELS[selection.room.kind]).toLowerCase();
    parts.push(`${room}, ${nights} night${nights > 1 ? 's' : ''}`);
  }
  if (MODEL_INCLUDES[selection.model].coworking && selection.coworking.seats > 0) {
    parts.push(`${selection.coworking.seats} desk${selection.coworking.seats > 1 ? 's' : ''}`);
  }
  const surfers = selection.surf.guests.length;
  if (MODEL_INCLUDES[selection.model].surf && surfers > 0) {
    parts.push(`${surfers} surfer${surfers > 1 ? 's' : ''}`);
  }
  return parts.join(' · ');
}

/**
 * Airport pickup, appended after everything else.
 *
 * Outside the package on purpose — including a package the property prices
 * itself: pickup is a transfer the guest opts into after the stay is built,
 * charged per party rather than per night, and burying it in a package total
 * would hide a charge they chose separately.
 */
function addAirportPickup(
  lines: QuoteLine[],
  selection: BookingSelection,
  config: PriceConfig,
  includesSurf: boolean,
): void {
  if (!selection.addons.airportPickup) return;
  const party = Math.max(selection.room.people, includesSurf ? selection.surf.guests.length : 0);
  lines.push({
    id: 'airport',
    label: 'Airport pickup and drop',
    detail: `Party of ${party}`,
    amount: airportPickupPrice(config, party),
  });
}

/**
 * Folds the room, desk and lesson lines into one package line.
 *
 * This is the fallback path, for a model the property has not given a package
 * rate: the total is unchanged — presentation, not a discount — and what it
 * buys is a quote that reads as the thing the guest chose off the first step
 * instead of a receipt they have to reassemble in their head. When the PMS
 * does price the package, `quote` never gets this far.
 */
function collapseToPackage(
  lines: QuoteLine[],
  selection: BookingSelection,
  nights: number,
): QuoteLine[] {
  if (lines.length === 0) return lines;

  return [{
    id: 'package',
    label: `${MODEL_LABELS[selection.model].title} package`,
    detail: packageDetail(selection, nights),
    amount: lines.reduce((sum, l) => sum + l.amount, 0),
  }];
}

/**
 * Formats an amount in the configured currency.
 *
 * Whole amounts lose their ".00" — most rates are round numbers and the zeros
 * are noise. Anything with cents in it keeps them: PMS rates carry tax, and a
 * $90.97 total rounded to $91 on screen is a figure the guest never agreed to.
 */
export function formatMoney(amount: number, currency: string): string {
  const whole = Math.abs(amount - Math.round(amount)) < 0.005;
  try {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(amount);
  } catch {
    // An unrecognised currency code should not blank out every price on screen.
    return `${currency} ${whole ? Math.round(amount) : amount.toFixed(2)}`;
  }
}
