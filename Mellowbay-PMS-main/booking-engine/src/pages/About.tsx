import React from 'react';
import { ArrowUpRight, Check, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../assets/images';
import {
  HERO_DATA,
  MOST_POPULAR_AMENITIES,
  REVIEW_CATEGORIES,
  ROOM_TYPES,
} from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { Slab } from '../components/Slab';

export const About: React.FC = () => {
  
  const location = REVIEW_CATEGORIES.find((c) => c.label === 'Location');

  const stats = [
    { value: HERO_DATA.rating.toFixed(1), label: `${HERO_DATA.ratingWord} — ${HERO_DATA.reviewsCount} reviews` },
    { value: location ? location.score.toFixed(1) : '—', label: 'Rated for location' },
    { value: String(ROOM_TYPES.length), label: 'Room types, dorm to suite' },
    { value: `${HERO_DATA.beachWalkMinutes} min`, label: 'Walk to Weligama Beach' },
  ];

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A hostel that people keep not leaving"
        intro="Mellow Bay is a beachfront hostel, restaurant and coworking space on Sri Lanka's south coast — built for travellers who arrive for a few nights and rearrange their plans."
        image={IMAGES.terraceNight}
        imageAlt="Guests on the terrace at Mellow Bay after dark"
      />

      <Slab>
        <main className="max-w-6xl mx-auto px-5 sm:px-9 md:px-14 py-16 space-y-14">
          {/* What this place is */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <h2 className="text-[28px] sm:text-4xl font-medium tracking-[-0.02em] leading-[1.12]">
                What the place actually is
              </h2>
            </div>

            <div className="lg:col-span-7 space-y-4 text-slate-500 text-[12.5px] leading-relaxed max-w-2xl">
              <p>
                We sit on the beach side of the Matara Road in Pelena, just outside Weligama, with
                our own private stretch of sand, a lush garden and a terrace that looks out at the
                water. The full name on the paperwork is {HERO_DATA.legalName} — everyone just says
                Mellow Bay.
              </p>
              <p>
                There is a restaurant and a bar on site, rooms that range from a bunk in the
                female-only dorm to a family suite sleeping four, and a workspace for the people who
                need to answer email between surfs. Yoga classes and evening entertainment run
                through the week.
              </p>
              <p>
                It is a hostel, so it is social by design — but with air-conditioning, private
                bathrooms in most rooms and cement bunks built to stay cool and quiet.
              </p>
            </div>
          </section>

          {/* Numbers, all published on the listing */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white border border-slate-200/70 p-6 space-y-1"
              >
                <div className="text-3xl font-medium tracking-[-0.02em]">{s.value}</div>
                <div className="text-[11px] text-slate-500 leading-snug">{s.label}</div>
              </div>
            ))}
          </section>

          {/* On-site amenities */}
          <section className="rounded-[24px] bg-white border border-slate-200/70 p-7 sm:p-10">
            <h2 className="text-lg font-medium tracking-[-0.01em] mb-7">What is on site</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {MOST_POPULAR_AMENITIES.map((a) => (
                <div key={a} className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[12.5px] text-slate-600">{a}</span>
                </div>
              ))}
            </div>
          </section>

          {/* The beach */}
          <section className="rounded-[24px] bg-ink text-white overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center gap-5">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <Waves className="w-4 h-4" />
              </span>
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] leading-snug">
                  Guests rate the beach {HERO_DATA.beachScore.toFixed(1)}
                </h2>
                <p className="text-white/55 text-[12px] leading-relaxed max-w-md">
                  Higher than anything else about us. Weligama is a beginner-friendly break with a
                  long sandy bottom, and Mirissa is under three miles down the coast when you want
                  something with more push.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  to="/rooms"
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-white/90 text-ink text-xs font-medium px-6 py-3 rounded-full transition-colors"
                >
                  See the rooms
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/book"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-6 py-3 rounded-full transition-colors"
                >
                  Check availability
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto lg:min-h-[300px] bg-ink-soft overflow-hidden order-first lg:order-last">
              <img
                src={IMAGES.gardenTerraceDay}
                alt="Guests on the garden terrace"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </section>
        </main>
      </Slab>
    </>
  );
};
