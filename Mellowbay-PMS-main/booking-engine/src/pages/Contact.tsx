import React from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../assets/images';
import { HERO_DATA, HOUSE_RULES, NEARBY } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { Slab } from '../components/Slab';
import { useModals } from '../ui/ModalContext';

export const Contact: React.FC = () => {
  const { openCallback } = useModals();

  return (
    <>
      <PageHero
        eyebrow="Find us"
        title="Matara Road, Weligama"
        intro="On the beach side of the Matara Road in Pelena, a six-minute walk from Weligama Beach and under an hour from Koggala Airport."
        image={IMAGES.courtyardAbove}
        imageAlt="The courtyard at Mellow Bay in Weligama"
      />

      <Slab>
        <main className="max-w-6xl mx-auto px-5 sm:px-9 md:px-14 py-16 space-y-14">
          {/* Address + reach us */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-[24px] bg-white border border-slate-200/70 p-7 sm:p-10 space-y-6">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-paper flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </span>
                <div>
                  <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-1.5">
                    Address
                  </span>
                  <p className="text-lg font-medium tracking-[-0.01em] leading-snug">
                    {HERO_DATA.address}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1">{HERO_DATA.legalName}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-5">
                {NEARBY.map((place) => (
                  <div key={place.label}>
                    <div className="text-sm font-medium">{place.distance}</div>
                    <div className="text-[10.5px] text-slate-500 leading-snug mt-0.5">
                      {place.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-[24px] bg-ink text-white p-7 sm:p-10 flex flex-col justify-between gap-8">
              <div className="space-y-3">
                <h2 className="text-2xl font-medium tracking-[-0.02em] leading-snug">
                  Book, or just ask
                </h2>
                <p className="text-white/55 text-[11.5px] leading-relaxed">
                  Build your stay and get a price in a couple of minutes. For anything else —
                  airport pickup, long stays, a table in the restaurant — send us a note.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  to={HERO_DATA.bookingPath}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-white hover:bg-white/90 text-ink text-xs font-medium py-3.5 rounded-full transition-colors"
                >
                  Book your stay
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={openCallback}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium py-3.5 rounded-full transition-colors cursor-pointer"
                >
                  Request a call back
                </button>
              </div>
            </div>
          </section>

          {/* House rules */}
          <section>
            <h2 className="text-lg font-medium tracking-[-0.01em] mb-6">Good to know</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {HOUSE_RULES.map((rule) => (
                <div
                  key={rule.label}
                  className="rounded-2xl bg-white border border-slate-200/70 p-6 space-y-1"
                >
                  <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    {rule.label}
                  </span>
                  <div className="text-sm font-medium">{rule.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Getting here */}
          <section className="rounded-[24px] bg-white border border-slate-200/70 p-7 sm:p-10">
            <h2 className="text-lg font-medium tracking-[-0.01em] mb-6">Getting here</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'From Koggala Airport',
                  detail: 'Roughly 10 miles along the coast. We can arrange a pickup.',
                },
                {
                  step: '02',
                  title: 'By train',
                  detail:
                    'Weligama Railway Station is under a mile away — the coastal line from Colombo stops there.',
                },
                {
                  step: '03',
                  title: 'Driving',
                  detail: 'Free private parking on site, including accessible spaces.',
                },
              ].map((s) => (
                <div key={s.step} className="space-y-2">
                  <div className="text-[10px] text-slate-400 tabular-nums">{s.step}</div>
                  <h3 className="text-sm font-medium">{s.title}</h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </Slab>
    </>
  );
};
