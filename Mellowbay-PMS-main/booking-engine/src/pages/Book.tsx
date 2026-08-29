import React from 'react';
import { IMAGES } from '../assets/images';
import { BookingEngine } from '../booking/BookingEngine';
import { ClientOnly } from '../components/ClientOnly';
import { PageHero } from '../components/PageHero';
import { Slab } from '../components/Slab';

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
        <ClientOnly
          fallback={
            <div
              className="min-h-[520px] rounded-[20px] border border-slate-200/70 bg-white"
              aria-hidden="true"
            />
          }
        >
          <BookingEngine />
        </ClientOnly>
      </main>
    </Slab>
  </>
);
