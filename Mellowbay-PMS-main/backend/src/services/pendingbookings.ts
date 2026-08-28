// ─────────────────────────────────────────────────────────────
// A booking the website took that nobody at the property has accepted yet.
//
// The public booking engine writes reservations straight into the PMS, but a
// guest filling in a form is not the same event as the property agreeing to
// house them. So a booking-engine booking lands **awaiting confirmation**:
// it is on the reservations list, it is not on the tape chart, it holds no
// inventory, and it cannot be checked in. A person opens it, picks the actual
// room or bed(s), and confirming is what turns it into a real, held booking.
//
// An OTA booking is the opposite case and is deliberately left alone: the room
// was already sold by somebody else, so it holds inventory the moment it
// arrives and closes the dates by itself.
//
// This module is the single definition of that state. It imports nothing, so
// every layer — availability, the front-desk lists, the tape chart, check-in —
// can ask the same question and cannot drift into disagreeing about it.
// ─────────────────────────────────────────────────────────────

/**
 * The status an unconfirmed booking sits in.
 *
 * `Tentative` already exists throughout the schema and already means "on the
 * books, not committed", so it is reused rather than a new status invented.
 * What separates these from a Tentative booking a person made by hand is the
 * origin below — a hand-made Tentative booking still holds its inventory.
 */
export const PENDING_STATUS = 'Tentative';

/** `reservations.origin` written by the public booking engine. */
export const PENDING_ORIGIN = 'booking_engine';

/**
 * SQL predicate for "awaiting confirmation", over a `reservations` row that the
 * surrounding query has aliased `r`.
 *
 * Written as a predicate rather than a status list because the state is the
 * pair — status *and* origin. Matching on status alone would quietly strip the
 * inventory from every hand-made Tentative booking in the database.
 */
export const PENDING_SQL = `(r.status = '${PENDING_STATUS}' AND r.origin = '${PENDING_ORIGIN}')`;

/** The opposite of {@link PENDING_SQL}, for queries that count real bookings. */
export const NOT_PENDING_SQL = `NOT ${PENDING_SQL}`;

/**
 * Statuses that consume inventory, as SQL — *before* pending bookings are
 * taken back out again. Kept next to the predicate so the two are read together.
 */
export const LIVE_STATUS_SQL = `('Tentative','Confirmed','Guaranteed','Checked-in')`;

/**
 * The full "this reservation is holding a room tonight" test.
 *
 * A live status, minus anything still awaiting confirmation. Every availability
 * query uses this and nothing else.
 */
export const HOLDS_INVENTORY_SQL = `(r.status IN ${LIVE_STATUS_SQL} AND ${NOT_PENDING_SQL})`;

/** Whether a reservation row is awaiting confirmation. */
export function isPending(r: { status?: unknown; origin?: unknown } | null | undefined): boolean {
  return !!r && r.status === PENDING_STATUS && r.origin === PENDING_ORIGIN;
}
