import React from 'react';
import { IMAGES } from '../assets/images';
import { BookingEngine } from '../booking/BookingEngine';
import { PageHero } from '../components/PageHero';
import { Slab } from '../components/Slab';

export const Book: React.FC = () => (
  <>
    <PageHero
      eyebrow="Booking"
      title="Build your stay"
      intro="Pick a room, add a desk or surf lessons, and see the price as you go. Nothing is charged here — you get a quote and we come back to confirm."
      image={IMAGES.terraceNight}
      imageAlt="The terrace at Mellow Bay after dark"
    />

    <Slab>
      <main className="mx-auto max-w-6xl px-5 py-16 sm:px-9 md:px-14">
        <BookingEngine />
      </main>
    </Slab>
  </>
);
