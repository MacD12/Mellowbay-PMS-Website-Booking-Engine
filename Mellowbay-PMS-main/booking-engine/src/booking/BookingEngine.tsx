import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BedDouble, CalendarDays, Check, ChevronDown, LayoutGrid, Laptop,
  Send, Sparkles, Waves,
} from 'lucide-react';
import { formatMoney, nightsBetween, quote } from '../domain/index';
import { apiEnabled, submitReservation } from './api';
import { useAvailability, useCatalog } from './store';
import {
  ChoiceGroup, Counter, Field, RoomTypeList, Segmented, StayCalendar, inputClass,
} from './ui';
import {
  BookingModel,
  BookingSelection,
  LESSON_LABELS,
  LEVEL_LABELS,
  LessonType,
  MODEL_INCLUDES,
  MODEL_LABELS,
  ROOM_LABELS,
  RoomAvailability,
  RoomKind,
  RoomLine,
  RoomTypeOption,
  SEAT_LABELS,
  SeatType,
  SurfGuest,
  SurfLevel,
} from '../domain/index';

/** yyyy-mm-dd for today, in the viewer's own timezone. */
const today = () => {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const addDays = (iso: string, days: number) => {
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(t)) return iso;
  return new Date(t + days * 86400000).toISOString().slice(0, 10);
};

let guestSeq = 0;
const newGuest = (): SurfGuest => ({
  id: `g${++guestSeq}`,
  name: '',
  level: 'beginner',
  lessonType: 'general',
});

const initialSelection = (): BookingSelection => ({
  model: 'rooms',
  // No dates until the guest picks them. Pre-filling a week out put a total on
  // screen before anybody had said when they were coming — a price for a stay
  // nobody had chosen, which reads as an offer rather than as a placeholder.
  checkIn: '',
  checkOut: '',
  // Filled in from the property's own room list as soon as it arrives.
  room: { kind: 'double', people: 2, roomTypeId: '' },
  coworking: { seatType: 'normal', seats: 1 },
  surf: { date: addDays(today(), 8), guests: [newGuest()] },
  addons: { airportPickup: false },
  contact: { name: '', email: '', phone: '', notes: '' },
});

/**
 * One choice on the room step: a dorm bed, a double or a family room.
 *
 * The property sells five room types, but a guest picks a *kind* — reception
 * assigns the actual room in the PMS, which is where knowing that 214 is
 * quieter than 216 lives. So the types of a kind are folded into one card, and
 * the booking still carries a concrete `roomTypeId` for the PMS to write
 * against; front desk moves it if they want a different room.
 */
interface RoomChoice {
  kind: RoomKind;
  label: string;
  /** Which PMS room type a booking of this kind is written against. */
  roomTypeId: string;
  /** Every type of this kind, cheapest first. */
  types: RoomTypeOption[];
  /** Largest party any room of this kind can take. */
  capacity: number;
  fromNightlyMinor: number;
  detail: string;
}

/** How many guests one room type can hold — beds for a dorm, occupancy otherwise. */
const capacityOf = (rt: RoomTypeOption): number =>
  rt.kind === 'dorm' ? Math.max(1, rt.unitsTotal || 1) : Math.max(1, rt.maxOccupancy);

/**
 * The property's room types, grouped into the three kinds the site sells.
 *
 * The cheapest type of a kind is the one quoted and the one booked: a guest
 * shown "from $23" must not be handed a $42 room at the desk. Kinds the
 * property has nothing for are dropped rather than shown as unbookable.
 */
function roomChoices(roomTypes: RoomTypeOption[]): RoomChoice[] {
  const out: RoomChoice[] = [];
  for (const kind of ['dorm', 'double', 'family'] as RoomKind[]) {
    const types = roomTypes
      .filter((rt) => rt.bookingKind === kind)
      .sort((a, b) => a.fromNightlyMinor - b.fromNightlyMinor);
    if (!types.length) continue;
    out.push({
      kind,
      label: ROOM_LABELS[kind],
      roomTypeId: types[0].id,
      types,
      capacity: Math.max(...types.map(capacityOf)),
      fromNightlyMinor: types[0].fromNightlyMinor,
      detail: describeKind(kind, types),
    });
  }
  return out;
}

/** What a kind is, said once for however many types sit behind it. */
function describeKind(kind: RoomKind, types: RoomTypeOption[]): string {
  const parts: string[] = [];
  if (kind === 'dorm') {
    const beds = types.reduce((n, rt) => n + rt.unitsTotal, 0);
    parts.push('A bed in a shared room');
    if (beds) parts.push(`${beds} beds across ${types.length} dorm${types.length > 1 ? 's' : ''}`);
    const policies = [...new Set(types.map((rt) => rt.genderPolicy).filter(Boolean))];
    if (policies.length) parts.push(policies.join(' or '));
  } else {
    parts.push(`Sleeps up to ${Math.max(...types.map((rt) => rt.maxOccupancy))}`);
    const rooms = types.reduce((n, rt) => n + rt.unitsTotal, 0);
    if (rooms) parts.push(`${rooms} room${rooms > 1 ? 's' : ''}`);
  }
  parts.push('Your room is assigned at check-in');
  return parts.join(' · ');
}

/**
 * Can this kind hold the party at all?
 *
 * Read off the catalog rather than an availability answer: the guest count is
 * set before the dates are priced, and a room too small for the party should
 * say so the moment the count passes it.
 */
const fitsParty = (choice: RoomChoice, people: number): boolean =>
  people <= choice.capacity;

/** Why a kind cannot be booked for these dates, in one short phrase. */
function unavailableReason(
  choice: RoomChoice,
  avail: RoomAvailability | null,
  people: number,
): string | undefined {
  if (!fitsParty(choice, people)) {
    return choice.kind === 'dorm'
      ? `Only ${choice.capacity} beds`
      : `Max ${choice.capacity} guests`;
  }
  if (!avail) return undefined;
  if (avail.violations.length) return avail.violations[0].message;
  if (avail.available < avail.unitsNeeded) {
    return avail.available <= 0
      ? 'Sold out'
      : `Only ${avail.available} left`;
  }
  return avail.sellable ? undefined : 'Not available';
}

type StepId = 'model' | 'rooms' | 'stay' | 'coworking' | 'surf' | 'extras' | 'review';

const STEP_TITLES: Record<StepId, string> = {
  model: 'What are you booking',
  rooms: 'Choose your room',
  stay: 'Your dates',
  coworking: 'Coworking',
  surf: 'Surf package',
  extras: 'Extras',
  review: 'Review and send',
};

/**
 * One icon per step, in place of the step number.
 *
 * The number said nothing the position on the line did not already say. An
 * icon carries the step's subject instead, which is what a guest glancing back
 * at the bar is actually looking for — and it survives the narrow screens
 * where the wording has to go.
 */
const STEP_ICONS: Record<StepId, React.ComponentType<{ className?: string }>> = {
  model: LayoutGrid,
  rooms: BedDouble,
  stay: CalendarDays,
  coworking: Laptop,
  surf: Waves,
  extras: Sparkles,
  review: Send,
};

export const BookingEngine: React.FC = () => {
  // Rooms, rates, occupancy limits and currency all come from the PMS. Nothing
  // on this screen is authored here beyond the wording around them.
  const { catalog, prices, loading: catalogLoading, offline } = useCatalog();
  const [selection, setSelection] = useState<BookingSelection>(initialSelection);
  const [stepIndex, setStepIndex] = useState(0);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  // Beds for a dorm party, one otherwise — the PMS books a dorm bed per guest,
  // so it is the count that came back rather than the one this browser assumed.
  const [unitsBooked, setUnitsBooked] = useState(1);

  const includes = MODEL_INCLUDES[selection.model];
  const roomTypes = catalog?.roomTypes ?? [];

  // Steps are derived from the chosen model, so changing the model reshapes the
  // flow rather than leaving dead steps in it.
  const steps = useMemo<StepId[]>(() => {
    // Room first, dates second, on every model. Whatever is being booked, the
    // guest is choosing a place to stay before they commit to nights in it —
    // and one order for all four models means the bar means the same thing
    // wherever they came in from.
    const s: StepId[] = ['model', 'rooms', 'stay'];
    if (includes.coworking) s.push('coworking');
    if (includes.surf) s.push('surf');
    s.push('extras', 'review');
    return s;
  }, [includes.coworking, includes.surf]);

  // Dropping a step (by switching to a smaller model) can leave the index past
  // the end of the new list.
  const safeIndex = Math.min(stepIndex, steps.length - 1);
  const step = steps[safeIndex];

  const patch = (next: Partial<BookingSelection>) => setSelection((s) => ({ ...s, ...next }));

  const choices = useMemo(() => roomChoices(roomTypes), [roomTypes]);
  const selectedChoice = choices.find((c) => c.kind === selection.room.kind) ?? null;

  // Land on a kind the property actually sells as soon as its list arrives,
  // keeping the one the guest was looking at where it exists.
  useEffect(() => {
    if (!choices.length) return;
    // A room picked by name off the Rooms step stays picked, even when it is
    // not the cheapest of its kind. This used to snap back to the kind's
    // default the instant it was chosen, which made choosing a specific room
    // impossible — the only requirement is that the id is real and that the
    // kind beside it agrees with it.
    const chosen = roomTypes.find((rt) => rt.id === selection.room.roomTypeId);
    if (chosen && chosen.bookingKind === selection.room.kind) return;

    const current = choices.find((c) => c.kind === selection.room.kind);
    const pick = current
      ?? choices.find((c) => fitsParty(c, selection.room.people))
      ?? choices[0];
    setSelection((s) => ({
      ...s,
      room: { ...s.room, kind: pick.kind, roomTypeId: pick.roomTypeId },
    }));
  }, [roomTypes, choices, selection.room.kind, selection.room.roomTypeId, selection.room.people]);

  const nights = nightsBetween(selection.checkIn, selection.checkOut);
  const datesValid = nights > 0;

  // The PMS prices the stay: calendar rates, occupancy supplements, yield rules
  // and tax. Asking it is what makes the total on screen the total on file.
  const availability = useAvailability({
    checkIn: selection.checkIn,
    checkOut: selection.checkOut,
    adults: selection.room.people,
    // The model is part of the question: a package is priced by its own rate
    // plan, so "rooms + surf" and "rooms" are two different prices for the
    // same room on the same nights.
    model: selection.model,
    enabled: datesValid && roomTypes.length > 0,
  });
  /**
   * The availability row for a kind: the cheapest of its types that can still
   * be sold. A dorm kind with one dorm sold out and another free is available —
   * reception puts the guest in whichever has a bed.
   */
  const availabilityFor = useMemo(() => (choice: RoomChoice | null): RoomAvailability | null => {
    if (!choice) return null;
    const rows = choice.types
      .map((rt) => availability.forRoomType(rt.id))
      .filter((r): r is RoomAvailability => r !== null);
    if (!rows.length) return null;
    const sellable = rows.filter((r) => r.sellable);
    if (!sellable.length) return rows[0];
    return sellable.reduce((best, r) => (r.roomTotalMinor < best.roomTotalMinor ? r : best));
  }, [availability]);

  const roomAvailability = availabilityFor(selectedChoice);

  /**
   * The PMS's own price for what the guest has chosen.
   *
   * Two shapes, decided by the PMS rather than here. When the property sells
   * this model as a package, `packaged` is set and the figure is the whole
   * package for these dates — the quote shows it as one line and prices
   * nothing else. Otherwise it is the room alone and the desk and lessons are
   * itemised beside it from the extras table, which is what a property that
   * has not set up packages still gets.
   */
  const roomLine = useMemo<RoomLine | undefined>(() => {
    if (!selectedChoice || !roomAvailability || roomAvailability.roomTotalMinor <= 0) return undefined;
    // Tax is left off the quote — the property adds it at the till, so putting
    // it on here would show the guest a number nobody asked them for.
    return {
      label: selectedChoice.label,
      total: roomAvailability.roomTotalMinor / 100,
      packaged: availability.result?.packaged === true,
      packageLabel: availability.result?.packageName ?? undefined,
    };
  }, [selectedChoice, roomAvailability, availability.result]);

  const priced = useMemo(
    () => quote(selection, prices, roomLine),
    [selection, prices, roomLine],
  );

  /**
   * True when the property is selling this as a package at its own price.
   *
   * The desk and the lessons are inside that price, so the steps that pick
   * them must stop quoting a per-seat and per-lesson figure: those numbers are
   * real — they are what the extras cost on their own — but adding up to
   * something other than the total on screen is exactly how a guest decides
   * the site is lying to them.
   */
  const packaged = roomLine?.packaged === true;

  const currency = catalog?.currency ?? prices.currency;
  const roomCfg = prices.rooms[selection.room.kind];

  /**
   * The biggest party the property can take anywhere.
   *
   * The guest count is asked for before the room, so its ceiling cannot be one
   * room's capacity — that would stop a family of four saying so while a double
   * happened to be selected. Rooms too small for the count disable themselves
   * instead, which is the honest way to say no to a specific room.
   */
  const partyLimit = choices.length
    ? Math.max(...choices.map((c) => c.capacity))
    : roomCfg.maxPeople;
  // Nothing before the property's own business date can be sold.
  const earliest = catalog?.property.businessDate ?? today();
  const roomChosen = choices.length === 0 || !!selectedChoice;
  // One reason, used both to block Continue and to explain why below the list,
  // so the button and the message can never disagree.
  const roomBlockedReason = selectedChoice
    ? unavailableReason(selectedChoice, roomAvailability, selection.room.people)
    : undefined;

  const contactValid =
    selection.contact.name.trim().length > 1 && selection.contact.email.includes('@');

  const canAdvance =
    // The dates screen owns the dates, and refuses to move on when the room
    // chosen before it cannot be sold on them — the one place where the two
    // screens depend on each other.
    step === 'stay' ? datesValid && roomChosen && !roomBlockedReason
      // A property with no published rooms cannot be blocked on picking one —
      // the step says so and the guest carries on to send their dates.
      : step === 'rooms' ? (!selection.room.roomTypeId ? roomTypes.length === 0 : true)
        : step === 'review' ? contactValid : true;

  /**
   * With a backend the booking is recorded server-side and repriced there, so
   * the total on file is the server's, not the one this browser was showing —
   * staff then see it in the admin app. Without one there is nowhere to send
   * it, and the confirmation says so rather than implying it arrived.
   */
  const onSubmit = async () => {
    if (!apiEnabled) {
      setSent(true);
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      // The guest picked a kind; the PMS needs a room type. Send whichever of
      // that kind was actually quotable for these dates rather than the kind's
      // headline one, which may be the dorm that happens to be full.
      const created = await submitReservation({
        ...selection,
        room: {
          ...selection.room,
          roomTypeId: roomAvailability?.roomTypeId ?? selection.room.roomTypeId,
        },
      });
      // The PMS assigns the confirmation number, so the guest leaves with the
      // same reference the front desk will search on.
      setConfirmation(created?.confirmation ?? null);
      setUnitsBooked(created?.units ?? 1);
      setSent(true);
    } catch (err) {
      const e = err as { message?: string; details?: string[] };
      setSendError([e.message, ...(e.details ?? [])].filter(Boolean).join(' — '));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-[24px] border border-slate-200/70 bg-white p-8 sm:p-12 text-center elev-1">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
          <Check className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-2xl font-medium tracking-[-0.02em]">
          {apiEnabled ? 'Reservation sent' : 'Quote ready'}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-500">
          {apiEnabled ? (
            <>
              {/* Deliberately not "your room is booked". The property has to
                  accept the request before anything is held, so saying it is
                  confirmed would be telling the guest something untrue. */}
              Your request has reached {catalog?.property.name ?? 'us'}
              {unitsBooked > 1 ? ` for ${unitsBooked} beds` : ''}. Our team will confirm your{' '}
              {unitsBooked > 1 ? 'beds' : 'room'} and follow up about payment — nothing is held
              until they do.
              {catalog && (
                <>
                  {' '}Check-in from {catalog.property.checkInTime}, check-out by{' '}
                  {catalog.property.checkOutTime}.
                </>
              )}
            </>
          ) : (
            <>
              This is your quote. This site has no booking service connected, so nothing has been
              sent to us — take a copy and get in touch to confirm it.
            </>
          )}
        </p>
        {confirmation && (
          <p className="mx-auto mt-4 inline-flex items-baseline gap-2 rounded-full border border-slate-200 px-4 py-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
              Reference
            </span>
            <span className="text-[13px] font-medium tabular-nums">{confirmation}</span>
          </p>
        )}
        <div className="mx-auto mt-7 max-w-sm">
          <QuotePanel priced={priced} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-12">
      {/* Spans the grid rather than sitting inside the left column. Nested there
          it pushed the form card down while the quote panel stayed level with
          the chips, so the two cards started at different heights. */}
      {/* One scrolling row on small screens — wrapping turned six steps into
          four stacked rows of chrome before the form even started. The negative
          margin lets it bleed to the screen edge so it reads as scrollable. */}
      {/* The site cannot reach the property's system, so every figure below is
          a placeholder rather than a rate anyone has agreed to. Saying so is
          the difference between a stale price and a misleading one. */}
      {offline && !catalogLoading && (
        <p className="lg:col-span-12 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-[10.5px] leading-relaxed text-slate-600">
          We cannot reach our booking system right now, so the prices here are indicative only.
          Send your dates through and we will come back with the real ones.
        </p>
      )}

      {/* The bar spans the width it is given: every step but the last grows,
          and the rule between them takes up the slack. That way the line
          reaches the right-hand edge whether the model has four steps or six,
          instead of huddling at the left with half the row empty. */}
      <ol className="lg:col-span-12 flex w-full items-center">
          {steps.map((s, i) => {
            const Icon = STEP_ICONS[s];
            const done = i < safeIndex;
            const current = i === safeIndex;
            const last = i === steps.length - 1;
            return (
              <li key={s} className={`flex items-center ${last ? '' : 'flex-auto'}`}>
                <button
                  type="button"
                  // Only completed steps are reachable; jumping ahead would skip
                  // the validation the Continue button enforces.
                  disabled={i > safeIndex}
                  onClick={() => setStepIndex(i)}
                  aria-current={current ? 'step' : undefined}
                  // The bar carries no wording, so the name lives here — it is
                  // what a screen reader announces and what hovering reveals.
                  aria-label={STEP_TITLES[s]}
                  title={STEP_TITLES[s]}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full
                    transition-colors ${
                    current
                      ? 'bg-ink text-white'
                      : done
                        ? 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-ink cursor-pointer'
                        : 'border border-slate-100 bg-white text-slate-300'
                  }`}
                >
                  {/* A finished step shows the tick rather than its subject —
                      what it was about matters less than that it is done. */}
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </button>
                {!last && (
                  <span
                    aria-hidden
                    className={`mx-2 h-px flex-1 ${done ? 'bg-slate-300' : 'bg-slate-200'}`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Below lg the quote panel falls to the bottom of the page, so the
            price is off-screen for the whole flow. This puts the total directly
            under the steps, with the breakdown a tap away. The wrapper is
            dropped along with the bar, so an unpriced stay leaves no gap. */}
        {priced.lines.length > 0 && (
          <div className="lg:hidden">
            <QuoteBar priced={priced} />
          </div>
        )}

        <div className="lg:col-span-8 rounded-[24px] border border-slate-200/70 bg-white p-5 sm:p-8 elev-1">
          <h2 className="text-xl font-medium tracking-[-0.02em]">{STEP_TITLES[step]}</h2>

          <div className="mt-6 space-y-6">
            {step === 'model' && (
              <ChoiceGroup<BookingModel>
                value={selection.model}
                onChange={(model) => patch({ model })}
                options={(Object.keys(MODEL_LABELS) as BookingModel[]).map((m) => ({
                  value: m,
                  title: MODEL_LABELS[m].title,
                  detail: MODEL_LABELS[m].detail,
                }))}
              />
            )}

            {step === 'rooms' && (
              <>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Everything we have, straight from the front desk. The prices are the lowest
                  each room goes for over the next three months — your own dates are priced on
                  the next step.
                </p>

                {catalogLoading ? (
                  <p className="text-[11px] text-slate-500">Loading the rooms we have…</p>
                ) : roomTypes.length === 0 ? (
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Our rooms are not published online at the moment. Carry on and send us your
                    dates, and we will come back with what is free.
                  </p>
                ) : (
                  <RoomTypeList
                    rooms={roomTypes}
                    value={selection.room.roomTypeId}
                    currency={currency}
                    format={formatMoney}
                    // Empty on the way through — the dates come next — and full
                    // of real prices for anyone who steps back to change their
                    // room after picking them.
                    availabilityFor={availability.forRoomType}
                    nights={nights}
                    onChange={(roomTypeId) => {
                      const rt = roomTypes.find((r) => r.id === roomTypeId);
                      // The kind travels with the room, so the next step opens
                      // on the shape this room belongs to rather than on
                      // whatever was selected before.
                      patch({
                        room: {
                          ...selection.room,
                          roomTypeId,
                          kind: rt ? rt.bookingKind : selection.room.kind,
                        },
                      });
                    }}
                  />
                )}
              </>
            )}

            {step === 'stay' && (
              <>
                {/* First on the screen, because it is the question the rest of
                    it answers against: the party size decides which rooms can
                    hold it and what the nights cost, so asking it after the
                    calendar means the total moves the moment it is corrected. */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-slate-200 p-4">
                  <div>
                    <p className="text-[13px] font-medium">
                      {selectedChoice?.kind === 'dorm' ? 'Beds' : 'Guests'}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-slate-500">
                      {selectedChoice?.kind === 'dorm'
                        ? 'One guest per bed'
                        : `We will show the rooms that fit · up to ${partyLimit}`}
                    </p>
                  </div>
                  <Counter
                    label={selectedChoice?.kind === 'dorm' ? 'beds' : 'guests'}
                    value={selection.room.people}
                    min={1}
                    max={partyLimit}
                    onChange={(people) => patch({ room: { ...selection.room, people } })}
                  />
                </div>

                <StayCalendar
                  checkIn={selection.checkIn}
                  checkOut={selection.checkOut}
                  earliest={earliest}
                  today={catalog?.property.businessDate}
                  onChange={({ checkIn, checkOut }) => patch({ checkIn, checkOut })}
                />

                {/* The price, the moment the stay has both ends.
                    The quote panel already holds it, but on the step where the
                    dates are actually chosen it is off to the side on desktop
                    and below the fold on a phone — so the guest picks a
                    check-out date and nothing visibly answers. This answers. */}
                {datesValid && (
                  <div className="rounded-[16px] border border-slate-200 bg-paper/60 p-4">
                    {availability.loading ? (
                      <p className="text-[11px] text-slate-500">Checking those dates…</p>
                    ) : priced.total > 0 ? (
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {roomLine?.packaged ? 'Package total' : 'Total so far'}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-600">
                            {nights} night{nights === 1 ? '' : 's'}
                            {' · '}
                            {selection.room.people} guest{selection.room.people === 1 ? '' : 's'}
                            {selectedChoice ? ` · ${selectedChoice.label.toLowerCase()}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-medium tracking-[-0.02em] text-ink">
                            {formatMoney(priced.total, currency)}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {formatMoney(priced.total / nights, currency)} per night
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        We will price these dates once you have picked a room below.
                      </p>
                    )}
                  </div>
                )}

                {/* Nothing picked yet is not a mistake, so it is not in the
                    warning colour — it is just the next thing to do. Half a
                    range is the state worth flagging. */}
                {!datesValid && (
                  <p className={`text-[11px] ${selection.checkIn ? 'text-mail' : 'text-slate-500'}`}>
                    {selection.checkIn
                      ? 'Now pick your check-out date — at least one night after check-in.'
                      : 'Pick your check-in and check-out dates to see the price.'}
                  </p>
                )}

                {/* A room chosen before the dates can turn out to be full on
                    them. Saying so here, with the way back, beats a Continue
                    button that is dead for no stated reason. */}
                {roomBlockedReason && selectedChoice && (
                  <div className="rounded-[16px] border border-mail/30 bg-mail/5 p-4">
                    <p className="text-[11px] leading-relaxed text-mail">
                      {selectedChoice.label}: {roomBlockedReason.toLowerCase()} on these dates.
                      Change the dates above, or choose another room.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStepIndex(Math.max(0, steps.indexOf('rooms')))}
                      className="mt-2 text-[11px] font-medium text-ink underline underline-offset-2 cursor-pointer"
                    >
                      Back to the rooms
                    </button>
                  </div>
                )}
              </>
            )}

            {step === 'coworking' && (
              <>
                <Field label="Seat type">
                  <ChoiceGroup<SeatType>
                    value={selection.coworking.seatType}
                    onChange={(seatType) => patch({ coworking: { ...selection.coworking, seatType } })}
                    options={(Object.keys(SEAT_LABELS) as SeatType[]).map((t) => ({
                      value: t,
                      title: SEAT_LABELS[t],
                      detail: packaged
                        ? 'Included in your package'
                        : `${formatMoney(
                          prices.coworking.seatPerDay[t],
                          currency,
                        )} per seat, per day`,
                    }))}
                  />
                </Field>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-slate-200 p-4">
                  <div>
                    <p className="text-[13px] font-medium">Seats</p>
                    <p className="mt-0.5 text-[10.5px] text-slate-500">
                      {packaged
                        ? `Included for the ${priced.nights} day${priced.nights === 1 ? '' : 's'} of your stay`
                        : `Charged for the ${priced.nights} day${priced.nights === 1 ? '' : 's'} of your stay`}
                    </p>
                  </div>
                  <Counter
                    label="seats"
                    value={selection.coworking.seats}
                    min={0}
                    max={12}
                    onChange={(seats) => patch({ coworking: { ...selection.coworking, seats } })}
                  />
                </div>
              </>
            )}

            {step === 'surf' && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="First lesson date">
                    <input
                      type="date"
                      className={inputClass}
                      min={selection.checkIn}
                      max={selection.checkOut}
                      value={selection.surf.date}
                      onChange={(e) => patch({ surf: { ...selection.surf, date: e.target.value } })}
                    />
                  </Field>

                  <Field label="How many surfing">
                    <div className="pt-1">
                      <Counter
                        label="surfers"
                        value={selection.surf.guests.length}
                        min={1}
                        max={8}
                        onChange={(n) => {
                          const guests = [...selection.surf.guests];
                          while (guests.length < n) guests.push(newGuest());
                          guests.length = n;
                          patch({ surf: { ...selection.surf, guests } });
                        }}
                      />
                    </div>
                  </Field>
                </div>

                {/* The chart is explicit that level and lesson type are chosen
                    per person, not once for the group. */}
                <div className="space-y-3">
                  {selection.surf.guests.map((guest, i) => (
                    <div key={guest.id} className="rounded-[16px] border border-slate-200 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Surfer {i + 1}
                        </span>
                        <span className="text-[11px] font-medium tabular-nums">
                          {packaged
                            ? 'Included'
                            : formatMoney(
                              prices.surf.lesson[guest.level][guest.lessonType],
                              currency,
                            )}
                        </span>
                      </div>

                      <input
                        className={inputClass}
                        placeholder="Name"
                        value={guest.name}
                        onChange={(e) => {
                          const guests = selection.surf.guests.map((g) =>
                            g.id === guest.id ? { ...g, name: e.target.value } : g,
                          );
                          patch({ surf: { ...selection.surf, guests } });
                        }}
                      />

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <Segmented<SurfLevel>
                          label={`Level for surfer ${i + 1}`}
                          value={guest.level}
                          onChange={(level) => {
                            const guests = selection.surf.guests.map((g) =>
                              g.id === guest.id ? { ...g, level } : g,
                            );
                            patch({ surf: { ...selection.surf, guests } });
                          }}
                          options={(Object.keys(LEVEL_LABELS) as SurfLevel[]).map((l) => ({
                            value: l,
                            label: LEVEL_LABELS[l],
                          }))}
                        />

                        <Segmented<LessonType>
                          label={`Lesson type for surfer ${i + 1}`}
                          value={guest.lessonType}
                          onChange={(lessonType) => {
                            const guests = selection.surf.guests.map((g) =>
                              g.id === guest.id ? { ...g, lessonType } : g,
                            );
                            patch({ surf: { ...selection.surf, guests } });
                          }}
                          options={(Object.keys(LESSON_LABELS) as LessonType[]).map((t) => ({
                            value: t,
                            label: LESSON_LABELS[t],
                          }))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 'extras' && (
              <button
                type="button"
                onClick={() =>
                  patch({ addons: { airportPickup: !selection.addons.airportPickup } })
                }
                className={`flex w-full items-center justify-between gap-4 rounded-[16px] border p-5 text-left transition-colors cursor-pointer ${
                  selection.addons.airportPickup
                    ? 'border-ink bg-ink text-white'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span>
                  <span className="block text-[13px] font-medium">Airport pickup and drop</span>
                  <span
                    className={`mt-1 block text-[10.5px] ${
                      selection.addons.airportPickup ? 'text-white/60' : 'text-slate-500'
                    }`}
                  >
                    Priced per party, not per person
                  </span>
                </span>
                <span className="text-xs font-medium tabular-nums">
                  {formatMoney(
                    prices.addons.airportPickup[prices.addons.airportPickup.length - 1]?.price ?? 0,
                    currency,
                  )}
                </span>
              </button>
            )}

            {step === 'review' && (
              <div className="space-y-4">
                {/* The stay as the property's system has it — the room's own
                    name, its rate plan and its check-in times, so what the
                    guest confirms is what the front desk will see. */}
                {selectedChoice && catalog && (
                  <div className="rounded-[16px] border border-slate-200 p-4">
                    <p className="text-[13px] font-medium">{selectedChoice.label}</p>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                      {selection.checkIn} → {selection.checkOut} · {nights} night
                      {nights === 1 ? '' : 's'} · {selection.room.people}
                      {selectedChoice.kind === 'dorm' ? ' bed' : ' guest'}
                      {selection.room.people === 1 ? '' : 's'}
                    </p>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                      {catalog.ratePlan.name}
                      {catalog.ratePlan.refundable ? ' · refundable' : ' · non-refundable'}
                      {' · '}check-in from {catalog.property.checkInTime}, out by{' '}
                      {catalog.property.checkOutTime}
                    </p>
                    {catalog.ratePlan.inclusions.length > 0 && (
                      <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                        Includes {catalog.ratePlan.inclusions.join(', ')}
                      </p>
                    )}
                    <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                      Your exact room is assigned by reception at check-in.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Your name">
                    <input
                      className={inputClass}
                      value={selection.contact.name}
                      onChange={(e) =>
                        patch({ contact: { ...selection.contact, name: e.target.value } })
                      }
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      className={inputClass}
                      value={selection.contact.email}
                      onChange={(e) =>
                        patch({ contact: { ...selection.contact, email: e.target.value } })
                      }
                    />
                  </Field>
                </div>
                <Field label="Phone" hint="Optional">
                  <input
                    className={inputClass}
                    value={selection.contact.phone}
                    onChange={(e) =>
                      patch({ contact: { ...selection.contact, phone: e.target.value } })
                    }
                  />
                </Field>
                <Field label="Anything else" hint="Optional">
                  <textarea
                    rows={3}
                    className={`${inputClass} resize-none`}
                    value={selection.contact.notes}
                    onChange={(e) =>
                      patch({ contact: { ...selection.contact, notes: e.target.value } })
                    }
                  />
                </Field>
                {!contactValid && (
                  <p className="text-[11px] text-slate-400">
                    A name and email are needed before we can send this.
                  </p>
                )}
                {sendError && <p className="text-[11px] text-mail">{sendError}</p>}
              </div>
            )}
          </div>

          {/* --- Navigation --- */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => setStepIndex(Math.max(0, safeIndex - 1))}
              disabled={safeIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[11px] font-medium text-slate-500 transition-colors hover:text-ink disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            {step === 'review' ? (
              <button
                type="button"
                disabled={!contactValid || sending}
                onClick={onSubmit}
                className="inline-flex items-center gap-1.5 rounded-full bg-plum px-7 py-3 text-[11px] font-medium text-white transition-colors hover:bg-plum-dark disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {sending ? 'Sending…' : apiEnabled ? 'Send reservation' : 'Save my quote'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canAdvance}
                onClick={() => setStepIndex(Math.min(steps.length - 1, safeIndex + 1))}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-7 py-3 text-[11px] font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

      {/* --- Running total --- */}
      {/* Hidden below lg: QuoteBar above already carries it there, and showing
          both would repeat the same figures twice on one screen. */}
      {priced.lines.length > 0 && (
        <div className="hidden lg:col-span-4 lg:block">
          <div className="lg:sticky lg:top-24">
            <QuotePanel priced={priced} />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * The small-screen face of the quote: total always visible, breakdown on tap.
 *
 * Collapsed by default because on a phone the list would push the form itself
 * below the fold, which is the problem this is here to solve.
 */
const QuoteBar: React.FC<{ priced: ReturnType<typeof quote> }> = ({ priced }) => {
  const [open, setOpen] = useState(false);

  // No quote, no quote bar. An empty card headed "Your quote" is a promise of
  // information that is not there — it takes up the space a price will occupy
  // and says nothing in the meantime.
  if (priced.lines.length === 0) return null;

  return (
    <div className="rounded-[20px] border border-slate-200/70 bg-white elev-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
            Your quote
          </span>
          <span className="mt-0.5 block text-[10.5px] text-muted">
            {priced.lines.length} item{priced.lines.length === 1 ? '' : 's'} · tap for the breakdown
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-2">
          <span className="text-lg font-medium tabular-nums tracking-[-0.02em]">
            {formatMoney(priced.total, priced.currency)}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4">
          <ul className="space-y-3">
            {priced.lines.map((line) => (
              <li key={line.id} className="flex items-baseline justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium text-ink">
                    {line.label}
                  </span>
                  <span className="block text-[10px] leading-relaxed text-muted">
                    {line.detail}
                  </span>
                </span>
                <span className="shrink-0 text-[12px] tabular-nums text-ink">
                  {formatMoney(line.amount, priced.currency)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[10.5px] leading-relaxed text-muted">
            An estimate, not a confirmed booking. Nothing is charged or held until we come back to
            you.
          </p>
        </div>
      )}
    </div>
  );
};

const QuotePanel: React.FC<{ priced: ReturnType<typeof quote> }> = ({ priced }) => {
  // Nothing priced, nothing to show. The card used to sit there headed "Your
  // quote" with an instruction inside it, which is a box holding a caption
  // rather than a quote — the step on the left is already asking for the dates.
  if (priced.lines.length === 0) return null;

  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 elev-1">
      {/* Everything secondary in here uses `muted` rather than a slate grey: at
          9–10px the old slate-400 was 2.56:1, well under AA. */}
      <h3 className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">Your quote</h3>

      <ul className="mt-4 space-y-3">
        {priced.lines.map((line) => (
          <li key={line.id} className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-ink">{line.label}</span>
              <span className="block text-[10px] leading-relaxed text-muted">{line.detail}</span>
            </span>
            <span className="shrink-0 text-[12px] tabular-nums text-ink">
              {formatMoney(line.amount, priced.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-baseline justify-between border-t border-slate-100 pt-4">
        <span className="text-[13px] font-medium">Total</span>
        <span className="text-lg font-medium tabular-nums tracking-[-0.02em]">
          {formatMoney(priced.total, priced.currency)}
        </span>
      </div>

      <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
        An estimate, not a confirmed booking. Nothing is charged or held until we come back to you.
      </p>
    </div>
  );
};
