// The public booking engine's read surface: what the website may show a guest
// before they have identified themselves. Writes live in reservations.ts.
import { router, type Ctx } from '../lib/http.ts';
import { assertDate, int } from '../lib/util.ts';
import {
  publicAvailability, publicCatalog, resolvePublicProperty,
} from '../services/publicbooking.ts';

const propertyFor = (ctx: Ctx) => resolvePublicProperty({
  propertyId: ctx.query.get('propertyId') ?? ctx.body?.propertyId,
  propertyCode: ctx.query.get('propertyCode') ?? ctx.body?.propertyCode,
});

/**
 * Rooms, rates, occupancy limits, currency and extras, straight from the PMS.
 * The site draws its whole booking step from this rather than from a table
 * bundled into its own build.
 */
router.get('/api/public/booking-engine/catalog', (ctx: Ctx) => publicCatalog(propertyFor(ctx)),
  { perm: null, allowNoProperty: true });

/**
 * Live price and availability per room type for one set of dates.
 *
 * `model` is what the guest chose off the first step. It decides which rate
 * plan answers, because a package is priced by its own plan rather than by the
 * room rate — so the totals here move when the guest switches between "rooms"
 * and "rooms + surf" without a single date changing.
 */
router.get('/api/public/booking-engine/availability', (ctx: Ctx) => publicAvailability(
  propertyFor(ctx),
  {
    checkIn: assertDate(ctx.query.get('checkIn'), 'checkIn'),
    checkOut: assertDate(ctx.query.get('checkOut'), 'checkOut'),
    adults: int(ctx.query.get('adults') ?? 1, 'adults', { min: 1, max: 40 }),
    children: int(ctx.query.get('children') ?? 0, 'children', { min: 0, max: 20 }),
    // An unknown model is not an error: it falls back to the room rate plan,
    // which is the right answer for a site build older than the packages.
    model: ctx.query.get('model'),
  },
), { perm: null, allowNoProperty: true });
