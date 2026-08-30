import React, { Suspense, lazy } from 'react';
import { IMAGES } from '../assets/images';
import { ClientOnly } from '../components/ClientOnly';
import { PageHero } from '../components/PageHero';
import { Slab } from '../components/Slab';

/**
 * The booking engine and everything it drags in — the pricing domain, the date
 * maths, the API client — is around a third of the JavaScript on this site and
 * is used on exactly one route. Loading it eagerly meant a visitor reading the
 * coworking page downloaded a quote calculator they never opened.
 *
 * It is already deferred past hydration by ClientOnly below, so the split costs
 * nothing in perceived speed here: the chunk is fetched during the same beat the
 * placeholder was covering anyway.
 */
const BookingEngine = lazy(() =>
  import('../booking/BookingEngine').then((m) => ({ default: m.BookingEngine })),
);

/** Holds the engine's height so neither the lazy load nor hydration shifts it. */
const EnginePlaceholder: React.FC = () => (
  <div
    className="min-h-[520px] rounded-[20px] border border-slate-200/70 bg-white"
    aria-hidden="true"
  />
);

export const Book: React.FC = () => (
  <>
    <PageHero
      eyebrow="Booking"
      title="Build your stay"
      intro="Pick a room, add a desk or surf lessons, and see the price as you go. Nothing is charged here — you get a quote and we come back to confirm."
      photo={IMAGES.terraceNight}
    />

    <Slab>
      <main className="mx-auto max-w-6xl px-5 py-16 sm:px-9 md:px-14">
        {/* The engine seeds its calendar from today's date, which is the build
            date when this page is prerendered and the visitor's date when it
            hydrates. Deferring it past hydration is what keeps those two from
            disagreeing; the placeholder holds the height so nothing jumps. */}
        <ClientOnly fallback={<EnginePlaceholder />}>
          <Suspense fallback={<EnginePlaceholder />}>
            <BookingEngine />
          </Suspense>
        </ClientOnly>
      </main>
    </Slab>
  </>
);
