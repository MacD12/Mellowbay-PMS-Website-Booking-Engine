// ─────────────────────────────────────────────────────────────
// Exercises booking-engine packages: the two package models are priced by
// their own rate plans, and each moves without the other.
//
//   node --experimental-sqlite scripts/packages-check.ts
//
// The check that matters most is that **the two packages are independent**.
// Before this, "Rooms + surf" and "Rooms + coworking + surf" were both the
// room rate plus the same shared extras table, so there was no price to change
// for one of them alone. Repricing one here must leave the other, and the room
// rate itself, exactly where they were.
//
// It builds its own database in a temp directory; the live one is never opened.
// ─────────────────────────────────────────────────────────────
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const workdir = mkdtempSync(join(tmpdir(), 'helio-packages-'));
process.env.HELIO_DB = join(workdir, 'data', 'helio.db');
process.env.HELIO_BACKUP_ENABLED = 'false';

const { migrate, run, get, all } = await import('../src/db.ts');
const { id, nowIso } = await import('../src/lib/util.ts');
const pkg = await import('../src/services/packages.ts');
const pub = await import('../src/services/publicbooking.ts');

let failures = 0;
let checks = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  checks++;
  process.stdout.write(`  ${ok ? '✓' : '✗'} ${name}\n`);
  if (!ok) {
    failures++;
    if (detail !== undefined) process.stdout.write(`      ${JSON.stringify(detail).slice(0, 300)}\n`);
  }
}
function section(t: string) { process.stdout.write(`\n${t}\n${'─'.repeat(t.length)}\n`); }

const ROOM_RATE = 5_500;      // €55 a night, the room on its own
const CHECK_IN = '2026-09-01';
const CHECK_OUT = '2026-09-04';   // three nights
const DATES = ['2026-09-01', '2026-09-02', '2026-09-03'];

function seed() {
  const propertyId = id('prp');
  run(
    `INSERT INTO properties(id, code, name, kind, timezone, currency, locale, business_date,
                            check_in_time, check_out_time, active, created_at)
     VALUES(?,?,?,'hostel','UTC','EUR','en','2026-08-25','14:00','11:00',1,?)`,
    propertyId, 'MELLOW', 'Mellow Bay', nowIso(),
  );
  const roomTypeId = id('rt');
  run(
    `INSERT INTO room_types(id, property_id, code, name, kind, base_occupancy, max_occupancy,
                            max_adults, max_children, default_rate_minor, extra_adult_minor,
                            extra_child_minor, sort_order, active, created_at)
     VALUES(?,?,'DBL','Double Room','room',2,2,2,0,?,0,0,1,1,?)`,
    roomTypeId, propertyId, ROOM_RATE, nowIso(),
  );
  // One room, so availability can actually sell it.
  run(
    `INSERT INTO rooms(id, property_id, room_type_id, number, status, active, created_at)
     VALUES(?,?,?,'101','Clean',1,?)`,
    id('rm'), propertyId, roomTypeId, nowIso(),
  );
  const barId = id('rp');
  run(
    `INSERT INTO rate_plans(id, property_id, code, name, active, created_at)
     VALUES(?,?,'BAR','Best Available',1,?)`,
    barId, propertyId, nowIso(),
  );
  run(
    'INSERT INTO rate_plan_room_types(rate_plan_id, room_type_id, base_rate_minor) VALUES(?,?,?)',
    barId, roomTypeId, ROOM_RATE,
  );
  return { propertyId, roomTypeId, barId };
}

/** Set one package's nightly price across the stay, the way the rate calendar does. */
function priceNights(propertyId: string, roomTypeId: string, ratePlanId: string, minor: number) {
  for (const date of DATES) {
    run(
      `INSERT INTO rate_calendar(id, property_id, room_type_id, rate_plan_id, date, price_minor, updated_at)
       VALUES(?,?,?,?,?,?,?)
       ON CONFLICT(property_id, room_type_id, rate_plan_id, date)
         DO UPDATE SET price_minor = excluded.price_minor`,
      id('rc'), propertyId, roomTypeId, ratePlanId, date, minor, nowIso(),
    );
  }
}

const totalFor = (propertyId: string, model: string | null) =>
  pub.publicAvailability(propertyId, {
    checkIn: CHECK_IN, checkOut: CHECK_OUT, adults: 2, model,
  });

async function main() {
  process.stdout.write(`\nBooking-engine package checks\n${'─'.repeat(29)}\nWorking in ${workdir}\n`);
  migrate();
  const { propertyId: P, roomTypeId: RT, barId } = seed();

  section('1 · A property starts with no packages');
  check('no plan claims a booking model', pkg.packagePlans(P).length === 0);
  check('the catalog says so', pub.publicCatalog(P).packages.length === 0);
  check('a package model falls back to the room plan',
    pub.publicRatePlanIdForModel(P, 'rooms-surf') === barId);
  const roomsOnly = totalFor(P, 'rooms');
  check('and rooms are quoted as rooms, not as a package', roomsOnly.packaged === false);
  check('the room total is three nights of the room rate',
    roomsOnly.options[0]?.roomTotalMinor === ROOM_RATE * 3, roomsOnly.options[0]?.roomTotalMinor);

  section('2 · Creating the package plans');
  const first = pkg.ensurePackagePlans(P);
  check('both packages are created', first.created.length === 2, first);
  check('running it again creates nothing', pkg.ensurePackagePlans(P).created.length === 0);
  const plans = pkg.packagePlans(P);
  check('each is a package plan', plans.every((p) => p.kind === 'package'), plans.map((p) => p.kind));
  check('rooms + surf has a plan',
    plans.some((p) => p.booking_model === 'rooms-surf'));
  check('rooms + coworking + surf has its own, different plan',
    new Set(plans.map((p) => p.id)).size === 2);
  check('the catalog now publishes both', pub.publicCatalog(P).packages.length === 2);

  const surfPlan = pkg.packagePlanFor(P, 'rooms-surf')!;
  const fullPlan = pkg.packagePlanFor(P, 'rooms-coworking-surf')!;

  section('3 · Unpriced, a package falls back rather than quoting nothing');
  const unpriced = totalFor(P, 'rooms-surf');
  check('it is flagged as a package', unpriced.packaged === true);
  check('it is quoted on the package plan', unpriced.ratePlanId === surfPlan.id);
  check('and inherits the room rate until somebody prices it',
    unpriced.options[0]?.roomTotalMinor === ROOM_RATE * 3, unpriced.options[0]?.roomTotalMinor);

  section('4 · The two packages price separately');
  priceNights(P, RT, surfPlan.id, 12_000);        // €120 a night
  priceNights(P, RT, fullPlan.id, 15_500);        // €155 a night

  const surf = totalFor(P, 'rooms-surf');
  const full = totalFor(P, 'rooms-coworking-surf');
  const rooms = totalFor(P, 'rooms');
  check('rooms + surf quotes its own price',
    surf.options[0]?.roomTotalMinor === 12_000 * 3, surf.options[0]?.roomTotalMinor);
  check('rooms + coworking + surf quotes a different one',
    full.options[0]?.roomTotalMinor === 15_500 * 3, full.options[0]?.roomTotalMinor);
  check('the room rate is untouched by either',
    rooms.options[0]?.roomTotalMinor === ROOM_RATE * 3, rooms.options[0]?.roomTotalMinor);
  check('each names the package it quoted',
    surf.packageName === 'Rooms + surf' && full.packageName === 'Rooms + coworking + surf',
    [surf.packageName, full.packageName]);

  section('5 · Moving one package leaves the other alone');
  priceNights(P, RT, surfPlan.id, 13_500);        // a shoulder-season bump on surf only
  const surfAfter = totalFor(P, 'rooms-surf');
  const fullAfter = totalFor(P, 'rooms-coworking-surf');
  const roomsAfter = totalFor(P, 'rooms');
  check('the repriced package moved',
    surfAfter.options[0]?.roomTotalMinor === 13_500 * 3, surfAfter.options[0]?.roomTotalMinor);
  check('the other package did not',
    fullAfter.options[0]?.roomTotalMinor === 15_500 * 3, fullAfter.options[0]?.roomTotalMinor);
  check('and neither did the room rate',
    roomsAfter.options[0]?.roomTotalMinor === ROOM_RATE * 3, roomsAfter.options[0]?.roomTotalMinor);

  section('6 · One plan per model');
  let refused = false;
  try {
    pkg.assertModelFree(P, 'rooms-surf');
  } catch { refused = true; }
  check('a second plan cannot claim a taken model', refused);
  check('the plan that already has it may keep it',
    (() => {
      try { pkg.assertModelFree(P, 'rooms-surf', surfPlan.id); return true; } catch { return false; }
    })());
  let rejected = false;
  try {
    pkg.assertModelFree(P, 'rooms-and-a-pony');
  } catch { rejected = true; }
  check('an unknown model is rejected', rejected);

  section('7 · Every package row is editable in the rate calendar');
  // The grid is one row per room type × active plan, so the packages appear
  // beside the room rate rather than in a screen of their own.
  const activePlans = all<{ id: string }>(
    'SELECT id FROM rate_plans WHERE property_id = ? AND active = 1', P,
  );
  check('three plans are on the calendar: the room rate and two packages',
    activePlans.length === 3, activePlans.length);
  const cells = get<{ n: number }>(
    `SELECT count(*) AS n FROM rate_calendar WHERE property_id = ? AND rate_plan_id IN (?, ?)`,
    P, surfPlan.id, fullPlan.id,
  );
  check('their prices are stored as ordinary calendar cells', cells?.n === DATES.length * 2, cells);

  process.stdout.write(`\n${checks - failures}/${checks} package checks passed\n`);
  if (failures) process.exit(1);
  process.stdout.write('Each package carries its own price, set per date, moved on its own.\n');
}

try {
  await main();
} catch (e) {
  process.stderr.write(`\nAborted: ${e instanceof Error ? e.stack : String(e)}\n`);
  process.exitCode = 1;
} finally {
  try { rmSync(workdir, { recursive: true, force: true }); } catch { /* windows file locks */ }
}
