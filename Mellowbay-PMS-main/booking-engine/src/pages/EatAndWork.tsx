import React from 'react';
import { ArrowUpRight, Clock, Leaf, UtensilsCrossed, Wifi, Wine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../assets/images';
import { COWORKING_FEATURES, HERO_DATA, RESTAURANT, REVIEW_CATEGORIES } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { Slab } from '../components/Slab';
import { useModals } from '../ui/ModalContext';

const JUMP_LINKS = [
  { href: '#eat', label: 'Eat & drink' },
  { href: '#work', label: 'Work & stay' },
];

export const EatAndWork: React.FC = () => {
  const { openCallback } = useModals();
  const staff = REVIEW_CATEGORIES.find((c) => c.label === 'Staff');

  return (
    <>
      <PageHero
        eyebrow="Life at Mellow"
        title="Eat, drink, and get some work done"
        intro="One kitchen running from breakfast to cocktail hour, and a workspace for the people who booked three nights and stayed three weeks."
        image={IMAGES.restaurantSeating}
        imageAlt="The restaurant and lounge at Mellow Bay"
      />

      <Slab>
        <main className="max-w-6xl mx-auto px-5 sm:px-9 md:px-14 py-16">
          {/* Jump between the two halves of the page */}
          <nav className="flex items-center gap-2 pb-12">
            {JUMP_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-4 py-2 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-ink transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* ---------------- EAT & DRINK ---------------- */}
          <section id="eat" className="scroll-mt-24 space-y-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5 space-y-4">
                <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
                  Eat &amp; drink
                </span>
                <h2 className="text-[28px] sm:text-4xl font-medium tracking-[-0.02em] leading-[1.12]">
                  One kitchen, five cuisines
                </h2>
                <p className="text-slate-500 text-[11.5px] leading-relaxed max-w-sm">
                  The menu is wide on purpose — guests come from everywhere, and most stay long
                  enough to want variety. There are vegetarian options throughout.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {RESTAURANT.cuisines.map((c) => (
                  <div
                    key={c}
                    className="bg-white rounded-2xl border border-slate-200/70 p-5 flex flex-col justify-between min-h-[104px]"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-slate-300" strokeWidth={1.5} />
                    <span className="text-sm font-medium mt-4">{c}</span>
                  </div>
                ))}
                <div className="bg-ink text-white rounded-2xl p-5 flex flex-col justify-between min-h-[104px]">
                  <Leaf className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                  <span className="text-sm font-medium mt-4">{RESTAURANT.dietary}</span>
                </div>
              </div>
            </div>

            {/* Service times */}
            <div className="rounded-[24px] bg-white border border-slate-200/70 p-7 sm:p-10">
              <div className="flex items-center gap-2.5 mb-7">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-lg font-medium tracking-[-0.01em]">Open for</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-4">
                {RESTAURANT.openFor.map((slot, i) => (
                  <div key={slot} className="space-y-1.5">
                    <div className="text-[10px] text-slate-400 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="text-sm font-medium leading-snug">{slot}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakfast + bar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-[24px] overflow-hidden bg-white border border-slate-200/70">
                <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img
                    src={IMAGES.foodSmoothieBowl}
                    alt="A breakfast bowl with fruit, granola and coconut"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-7 space-y-3">
                  <h3 className="text-lg font-medium tracking-[-0.01em]">Breakfast, three ways</h3>
                  <p className="text-slate-500 text-[11.5px] leading-relaxed">
                    Start with whichever suits the morning you are having.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {RESTAURANT.breakfasts.map((b) => (
                      <span
                        key={b}
                        className="text-[11px] bg-paper text-slate-600 px-2.5 py-1 rounded-lg"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-ink text-white p-7 sm:p-10 flex flex-col justify-between min-h-[300px]">
                <div className="space-y-3">
                  <Wine className="w-5 h-5 text-white/40" strokeWidth={1.5} />
                  <h3 className="text-2xl font-medium tracking-[-0.02em] leading-snug">
                    The bar runs late
                  </h3>
                  <p className="text-white/55 text-[11.5px] leading-relaxed max-w-sm">
                    High tea rolls into cocktail hour, and there is usually something on in the
                    evening — the restaurant and bar are open to guests and walk-ins alike.
                  </p>
                </div>

                <button
                  onClick={openCallback}
                  className="self-start mt-8 bg-white hover:bg-white/90 text-ink text-xs font-medium px-6 py-3 rounded-full transition-colors cursor-pointer"
                >
                  Ask about a table
                </button>
              </div>
            </div>
          </section>

          {/* ---------------- WORK & STAY ---------------- */}
          <section id="work" className="scroll-mt-24 space-y-14 pt-20 mt-20 border-t border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-6 space-y-4">
                <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
                  Work &amp; stay
                </span>
                <h2 className="text-[28px] sm:text-4xl font-medium tracking-[-0.02em] leading-[1.12]">
                  Coliving, not just a bed for the night
                </h2>
                <p className="text-slate-500 text-[11.5px] leading-relaxed max-w-md">
                  Plenty of our guests book a dorm bed for three nights and leave three weeks later.
                  The property is set up for it: somewhere to work, somewhere to eat, and people to
                  eat with.
                </p>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-ink text-white p-6 flex flex-col justify-between min-h-[150px]">
                  <Wifi className="w-5 h-5 text-white/40" strokeWidth={1.5} />
                  <div>
                    <div className="text-2xl font-medium">Free</div>
                    <div className="text-[11px] text-white/50 mt-0.5">WiFi across the property</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200/70 p-6 flex flex-col justify-between min-h-[150px]">
                  <span className="text-[9px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
                    Staff score
                  </span>
                  <div>
                    <div className="text-2xl font-medium">{staff?.score.toFixed(1)}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      from {HERO_DATA.reviewsCount} guest reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium tracking-[-0.01em] mb-6">What you get</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {COWORKING_FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="rounded-2xl bg-white border border-slate-200/70 p-6 space-y-2"
                  >
                    <h4 className="text-sm font-medium">{f.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{f.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-white border border-slate-200/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto lg:min-h-[280px] bg-slate-100 overflow-hidden">
                <img
                  src={IMAGES.gardenTerraceDay}
                  alt="Guests on the garden terrace"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center gap-5">
                <div className="space-y-3">
                  <h3 className="text-2xl font-medium tracking-[-0.02em] leading-snug">
                    Staying a month or more?
                  </h3>
                  <p className="text-slate-500 text-[11.5px] leading-relaxed max-w-md">
                    Message us with your dates and we will sort out a longer-stay rate, a desk and a
                    room that suits how you work.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/book"
                    className="bg-plum hover:bg-plum-dark text-white text-xs font-medium px-6 py-3 rounded-full pressable transition-colors"
                  >
                    Enquire about long stays
                  </Link>
                  <Link
                    to="/rooms"
                    className="inline-flex items-center gap-1.5 bg-paper hover:bg-slate-200 text-ink text-xs font-medium px-6 py-3 rounded-full transition-colors"
                  >
                    See the rooms
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </Slab>
    </>
  );
};
