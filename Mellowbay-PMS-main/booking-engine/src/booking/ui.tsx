import React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import type { RoomAvailability, RoomTypeOption } from '../domain/index';

/** Shared controls for the booking and admin screens. */

export const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <label className="block space-y-2">
    <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
      {label}
    </span>
    {children}
    {hint && <span className="block text-[10px] text-slate-400">{hint}</span>}
  </label>
);

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-ink ' +
  'outline-none transition-colors focus:border-ink placeholder:text-slate-300';

/** The chart's "+ / − / 0" counter, used for people, seats and admin prices. */
export const Counter: React.FC<{
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Rendered after the number — "€" or "%" on the admin screen. */
  suffix?: string;
  label: string;
}> = ({ value, onChange, min = 0, max = 99, step = 1, suffix, label }) => {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="min-w-[3ch] text-center text-xs font-medium tabular-nums text-ink">
        {value}
        {suffix}
      </span>

      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className="flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export interface Choice<T extends string> {
  value: T;
  title: string;
  detail?: string;
  /** Price or count, set apart from the title on the right. */
  price?: string;
  /** Why this one cannot be picked — shown in place of the price. */
  unavailable?: string;
}

/** A row of mutually exclusive cards. */
export function ChoiceGroup<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: Choice<T>[];
  value: T;
  onChange: (next: T) => void;
  columns?: 1 | 2 | 3 | 4;
}) {
  const cols = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' };
  return (
    <div role="radiogroup" className={`grid grid-cols-1 gap-2.5 ${cols[columns]}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        const off = !!opt.unavailable && !active;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            // A sold-out room stays readable and stays in the list — removing it
            // would leave the guest wondering whether it exists at all.
            disabled={off}
            onClick={() => onChange(opt.value)}
            className={`rounded-[16px] border p-4 text-left transition-colors ${
              active
                ? 'border-ink bg-ink text-white cursor-pointer'
                : off
                  ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  : 'border-slate-200 bg-white text-ink hover:border-slate-300 cursor-pointer'
            }`}
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className="block text-[13px] font-medium leading-snug">{opt.title}</span>
              {(opt.unavailable || opt.price) && (
                <span
                  className={`shrink-0 whitespace-nowrap text-[11px] font-medium tabular-nums ${
                    active ? 'text-white' : opt.unavailable ? 'text-slate-400' : 'text-ink'
                  }`}
                >
                  {opt.unavailable ?? opt.price}
                </span>
              )}
            </span>
            {opt.detail && (
              <span
                className={`mt-1 block text-[10.5px] leading-relaxed ${
                  active ? 'text-white/60' : off ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {opt.detail}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Small inline segmented control, for two or three tight options. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    // max-w-full + scroll rather than wrap: three surf levels overflow a narrow
    // phone, and a wrapped pill group loses its "one of these" reading.
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex max-w-full overflow-x-auto rounded-full bg-slate-100 p-1 no-scrollbar"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 sm:py-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
            opt.value === value ? 'bg-ink text-white' : 'text-slate-600 hover:text-ink'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- calendar -- */

/**
 * Date helpers for the stay calendar.
 *
 * Everything is a `yyyy-mm-dd` string, parsed as UTC. A stay is a run of whole
 * days, and reading them in the viewer's timezone is how a booking made late
 * on the 31st ends up on the 1st.
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const parse = (d: string) => Date.parse(`${d}T00:00:00Z`);
const shift = (d: string, days: number) => iso(parse(d) + days * MS_PER_DAY);
const nights = (a: string, b: string) =>
  !a || !b ? 0 : Math.max(0, Math.round((parse(b) - parse(a)) / MS_PER_DAY));

/** Monday-first weekday index, 0–6. */
const weekdayIndex = (d: string) => (new Date(parse(d)).getUTCDay() + 6) % 7;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** The 42 days a six-row month grid shows, including the neighbouring months. */
function monthGrid(monthStart: string): string[] {
  const first = shift(monthStart, -weekdayIndex(monthStart));
  return Array.from({ length: 42 }, (_, i) => shift(first, i));
}

const monthOf = (d: string) => `${d.slice(0, 7)}-01`;
const addMonths = (monthStart: string, n: number) => {
  const [y, m] = monthStart.split('-').map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${String(Math.floor(total / 12)).padStart(4, '0')}-${String((total % 12) + 1).padStart(2, '0')}-01`;
};

/**
 * The stay picker: one month at a time, a start tap and then an end tap.
 *
 * Two `<input type="date">` boxes were three interactions and a mental
 * subtraction — open a picker, read a number, open another, work out how many
 * nights that came to. A guest choosing a holiday is choosing a *shape* on a
 * month, and the run of highlighted days is that shape. The night count falls
 * out of it rather than being something they compute and hope they got right.
 *
 * Check-out is exclusive, as everywhere else in the system: tapping the 26th
 * and the 29th is three nights, and the 29th is the morning they leave.
 */
export const StayCalendar: React.FC<{
  checkIn: string;
  checkOut: string;
  /** Nothing before this can be picked — the property's own earliest date. */
  earliest: string;
  /** Today, from the property rather than the browser, for the "today" ring. */
  today?: string;
  onChange: (next: { checkIn: string; checkOut: string }) => void;
}> = ({ checkIn, checkOut, earliest, today, onChange }) => {
  const [month, setMonth] = React.useState(() => monthOf(checkIn || earliest));
  // Which end the next tap sets. Held rather than derived so that re-picking a
  // start does not immediately look like a one-night stay.
  const [picking, setPicking] = React.useState<'start' | 'end'>(
    checkIn && !checkOut ? 'end' : 'start',
  );
  const [hover, setHover] = React.useState('');

  // Follow the guest to the month they are actually staying in when the dates
  // change from outside — a cleared range, or a deep link with dates on it.
  React.useEffect(() => {
    if (checkIn) setMonth(monthOf(checkIn));
  }, [checkIn]);

  const days = monthGrid(month);
  const atStart = monthOf(earliest) >= month;

  // While choosing the end, the run under the cursor previews the stay.
  const previewEnd = picking === 'end' && hover > checkIn ? hover : checkOut;

  function pick(day: string) {
    if (picking === 'end' && checkIn && day > checkIn) {
      onChange({ checkIn, checkOut: day });
      setPicking('start');
      setHover('');
      return;
    }
    // A tap on or before the start begins a new stay rather than making an
    // impossible one. Check-out is deliberately cleared rather than set a
    // night ahead: half a range is not a stay, and filling in the other end
    // would put a one-night price on screen that nobody asked for.
    onChange({ checkIn: day, checkOut: '' });
    setPicking('end');
    setHover('');
  }

  const nightCount = nights(checkIn, previewEnd);

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-ink text-white">
          <CalendarDays className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Choose your stay</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {picking === 'end' && checkIn
              ? <>Now tap <span className="font-medium text-tg">your check-out date</span>.</>
              : <>Tap a start date, <span className="font-medium text-tg">then an end date</span>.</>}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          disabled={atStart}
          aria-label="Previous month"
          className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-25 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-[13px] font-semibold text-ink" aria-live="polite">
          {MONTHS[Number(month.slice(5, 7)) - 1]} {month.slice(0, 4)}
        </p>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          aria-label="Next month"
          className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 border-t border-slate-100 pt-3">
        {WEEKDAYS.map((w) => (
          <span
            key={w}
            className="pb-2 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400"
          >
            {w}
          </span>
        ))}

        {days.map((day) => {
          const outside = day.slice(0, 7) !== month.slice(0, 7);
          const disabled = day < earliest;
          const isStart = !!checkIn && day === checkIn;
          const isEnd = !!previewEnd && day === previewEnd;
          const between = !!checkIn && !!previewEnd && day > checkIn && day < previewEnd;
          const isToday = !!today && day === today;

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => pick(day)}
              onMouseEnter={() => setHover(day)}
              onMouseLeave={() => setHover('')}
              aria-label={day}
              aria-pressed={isStart || isEnd}
              className={[
                // The band between the ends is painted on the cell, so a run of
                // days reads as one continuous stay rather than seven chips.
                'relative h-10 text-[12px] font-medium transition-colors sm:h-9',
                disabled ? 'cursor-not-allowed text-slate-200' : 'cursor-pointer',
                between ? 'bg-hero/35' : '',
                isStart && !!previewEnd ? 'rounded-l-full bg-hero/35' : '',
                isEnd && !!checkIn && previewEnd !== checkIn ? 'rounded-r-full bg-hero/35' : '',
                !disabled && !between && !isStart && !isEnd ? 'hover:bg-slate-100 rounded-full' : '',
                outside && !between && !isStart && !isEnd ? 'text-slate-300' : '',
                !outside && !disabled && !isStart && !isEnd ? 'text-ink' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute inset-0 m-auto grid h-9 w-9 place-items-center rounded-full sm:h-8 sm:w-8',
                  isStart || isEnd ? 'bg-ink text-white' : '',
                  isToday && !isStart && !isEnd ? 'ring-1 ring-inset ring-ink/25' : '',
                ].join(' ')}
              >
                {Number(day.slice(8, 10))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <p className="text-[11px] text-slate-500">
          {checkIn && checkOut && picking === 'start' ? (
            <>
              <span className="font-medium text-ink">{longDay(checkIn)}</span>
              {' → '}
              <span className="font-medium text-ink">{longDay(checkOut)}</span>
            </>
          ) : checkIn ? (
            <>Checking in <span className="font-medium text-ink">{longDay(checkIn)}</span></>
          ) : (
            'No dates picked yet'
          )}
        </p>
        {nightCount > 0 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-ink">
            {nightCount} night{nightCount === 1 ? '' : 's'}
          </span>
        )}
      </div>
    </div>
  );
};

/** "Wed 26 Aug" — short enough for the summary line, unambiguous about the day. */
function longDay(d: string): string {
  const date = new Date(parse(d));
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getUTCDay()];
  return `${day} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()].slice(0, 3)}`;
}

/* ------------------------------------------------------------ room list -- */

/** "1 double bed · 1 single bed", straight from the PMS's bed configuration. */
function describeBeds(beds: { kind: string; count: number }[]): string {
  return beds
    .filter((b) => b.count > 0)
    .map((b) => `${b.count} ${b.kind}${b.count > 1 ? 's' : ''} bed`.replace('beds bed', 'beds'))
    .join(' · ');
}

/** The one-line "what is this room" summary: who it sleeps and what is in it. */
function describeRoom(rt: RoomTypeOption): string {
  const parts: string[] = [];
  if (rt.kind === 'dorm') {
    // The PMS stores the policy lowercase ("female"), and it opens the line.
    const policy = rt.genderPolicy
      ? rt.genderPolicy.charAt(0).toUpperCase() + rt.genderPolicy.slice(1)
      : '';
    parts.push(policy ? `${policy} dorm` : 'Shared dorm');
    if (rt.unitsTotal) parts.push(`${rt.unitsTotal} bed${rt.unitsTotal > 1 ? 's' : ''}`);
  } else {
    parts.push(`Sleeps up to ${rt.maxOccupancy}`);
    const beds = describeBeds(rt.bedConfig);
    if (beds) parts.push(beds);
  }
  return parts.join(' · ');
}

/**
 * Every room the property sells, as its own card.
 *
 * The step that follows this one folds the room types into three shapes — a
 * dorm bed, a double, a family room — because by then the question is which
 * *kind* is free on the chosen dates. This is the question before that one:
 * what does this place actually have. So nothing is collapsed, and each room
 * keeps its own name, its own beds and its own price.
 *
 * Every figure and every word is the PMS's. Nothing is authored here, so a
 * room renamed or repriced at the front desk is renamed and repriced on the
 * site at the next page load.
 */
export const RoomTypeList: React.FC<{
  rooms: RoomTypeOption[];
  /** The chosen room type's id. */
  value: string;
  currency: string;
  onChange: (roomTypeId: string) => void;
  /** Formats an amount — passed in so this file stays free of pricing rules. */
  format: (amount: number, currency: string) => string;
  /**
   * The PMS's answer for the chosen dates, when there are any.
   *
   * Rooms are picked before the dates, so most of the time there is nothing
   * here and each room quotes its "from" rate. A guest who steps back to
   * change their room after choosing dates has one, and then the real total
   * for those nights is what they should be reading.
   */
  availabilityFor?: (roomTypeId: string) => RoomAvailability | null;
  nights?: number;
}> = ({ rooms, value, currency, onChange, format, availabilityFor, nights = 0 }) => (
  <div role="radiogroup" aria-label="Rooms" className="space-y-3">
    {rooms.map((rt) => {
      const selected = rt.id === value;
      const avail = availabilityFor ? availabilityFor(rt.id) : null;
      const priced = avail && avail.sellable && avail.roomTotalMinor > 0 && nights > 0;
      const blocked = avail && !avail.sellable
        ? (avail.violations[0]?.message
          ?? (avail.available <= 0 ? 'Sold out' : `Only ${avail.available} left`))
        : null;
      return (
        <button
          key={rt.id}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(rt.id)}
          className={`w-full rounded-[18px] border p-4 text-left transition-colors cursor-pointer ${
            selected
              ? 'border-ink bg-ink text-white'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-medium tracking-[-0.01em]">{rt.name}</p>
              <p className={`mt-0.5 text-[10.5px] ${selected ? 'text-white/70' : 'text-slate-500'}`}>
                {describeRoom(rt)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[13px] font-medium tabular-nums">
                {priced && avail
                  ? format(avail.roomTotalMinor / 100, currency)
                  : format(rt.fromNightlyMinor / 100, currency)}
              </p>
              <p className={`text-[9.5px] ${selected ? 'text-white/60' : 'text-slate-400'}`}>
                {priced ? `${nights} night${nights === 1 ? '' : 's'}` : 'from / night'}
              </p>
            </div>
          </div>

          {/* Kept selectable on purpose: the dates screen is where a clash is
              resolved, and greying the room out here would leave a guest whose
              dates are full with nothing to click at all. */}
          {blocked && (
            <p className={`mt-2 text-[10.5px] font-medium ${selected ? 'text-white/80' : 'text-mail'}`}>
              {blocked} on your dates
            </p>
          )}

          {rt.description && (
            <p className={`mt-2 text-[10.5px] leading-relaxed ${
              selected ? 'text-white/70' : 'text-slate-500'
            }`}>
              {rt.description}
            </p>
          )}

          {rt.amenities.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {/* Four is what fits on a phone without wrapping to a third line;
                  the rest are counted rather than hidden silently. */}
              {rt.amenities.slice(0, 4).map((a) => (
                <span
                  key={a}
                  className={`rounded-full px-2 py-0.5 text-[9.5px] ${
                    selected ? 'bg-white/15 text-white/80' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {a}
                </span>
              ))}
              {rt.amenities.length > 4 && (
                <span className={`px-1 py-0.5 text-[9.5px] ${
                  selected ? 'text-white/60' : 'text-slate-400'
                }`}>
                  +{rt.amenities.length - 4} more
                </span>
              )}
            </div>
          )}
        </button>
      );
    })}
  </div>
);
