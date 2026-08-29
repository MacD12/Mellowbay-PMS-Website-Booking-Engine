import React from 'react';
import { ArrowUpRight, Clock, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../assets/images';
import { COWORKING_FEATURES, EUROPE_FACTS, HERO_DATA, REVIEW_CATEGORIES } from '../data/mockData';
import { FAQ } from '../seo/structuredData';
import { PageHero } from '../components/PageHero';
import { Photo } from '../components/Photo';
import { Slab } from '../components/Slab';

const JUMP_LINKS = [
  { href: '#workspace', label: 'The workspace' },
  { href: '#from-europe', label: 'Coming from Europe' },
  { href: '#faq', label: 'Questions' },
];

export const Coworking: React.FC = () => {
  const staff = REVIEW_CATEGORIES.find((c) => c.label === 'Staff');

  return (
    <>
      <PageHero
        eyebrow="Connect Co-Working Space"
        title="A desk on the south coast of Sri Lanka"
        intro="A dedicated, air-conditioned workspace six minutes from Weligama Beach — built for the people who booked three nights and stayed three months."
        photo={IMAGES.coworkingRoom}
      />

      <Slab>
        <main className="max-w-6xl mx-auto px-5 sm:px-9 md:px-14 py-16">
          <nav className="flex flex-wrap items-center gap-2 pb-12">
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

          {/* ---------------- THE WORKSPACE ---------------- */}
          <section id="workspace" className="scroll-mt-24 space-y-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-6 space-y-4">
                <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
                  The workspace
                </span>
                <h2 className="text-[28px] sm:text-4xl font-medium tracking-[-0.02em] leading-[1.12]">
                  A room to work in, not a corner of the lounge
                </h2>
                <p className="text-slate-500 text-[11.5px] leading-relaxed max-w-md">
                  Coworking is the part of this place we take most seriously. There is a separate
                  air-conditioned room with proper desks and chairs, monitors at some of them, fibre
                  WiFi with a backup line, and the quiet to actually use it. The beach is still six
                  minutes away when the day is done.
                </p>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-ink text-white p-6 flex flex-col justify-between min-h-[150px]">
                  <Wifi className="w-5 h-5 text-white/40" strokeWidth={1.5} />
                  <div>
                    <div className="text-2xl font-medium">Fibre</div>
                    <div className="text-[11px] text-white/50 mt-0.5">
                      with a backup line and a generator
                    </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-[24px] overflow-hidden bg-white border border-slate-200/70">
                <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                  <Photo photo={IMAGES.coworkingMonitors} className="w-full h-full object-cover" />
                </div>
                <div className="p-7 space-y-3">
                  <h3 className="text-lg font-medium tracking-[-0.01em]">
                    Screens, sockets and a door
                  </h3>
                  <p className="text-slate-500 text-[11.5px] leading-relaxed">
                    External monitors at the far desks, power that reaches the seat you are in, and
                    somewhere quiet to take a call that runs long.
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] overflow-hidden bg-white border border-slate-200/70">
                <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                  <Photo photo={IMAGES.coworkingBeanbag} className="w-full h-full object-cover" />
                </div>
                <div className="p-7 space-y-3">
                  <h3 className="text-lg font-medium tracking-[-0.01em]">
                    And somewhere to stop working
                  </h3>
                  <p className="text-slate-500 text-[11.5px] leading-relaxed">
                    Beanbags, a shared lounge, the long communal table and a garden terrace — the
                    half of coliving that does not happen at a desk.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- COMING FROM EUROPE ---------------- */}
          {/* The audience is mostly German, Austrian and Swiss, and these are the
              four things every one of them asks before booking. Answering them on
              the page is worth more than any amount of keyword tuning. */}
          <section
            id="from-europe"
            className="scroll-mt-24 space-y-10 pt-20 mt-20 border-t border-slate-200"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5 space-y-4">
                <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
                  Coming from Europe
                </span>
                <h2 className="text-[28px] sm:text-4xl font-medium tracking-[-0.02em] leading-[1.12]">
                  Working German hours from a Sri Lankan beach
                </h2>
                <p className="text-slate-500 text-[11.5px] leading-relaxed max-w-sm">
                  Most of the people at these desks are on European contracts and European
                  deadlines. Here is how that actually works.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EUROPE_FACTS.map((fact, i) => (
                  <div
                    key={fact.title}
                    className="rounded-2xl bg-white border border-slate-200/70 p-6 space-y-2"
                  >
                    <div className="text-[10px] text-slate-400 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-sm font-medium leading-snug">{fact.title}</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{fact.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-ink text-white p-7 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-medium tracking-[-0.02em]">
                    09:00 in Berlin is 12:30 here
                  </h3>
                  <p className="text-white/55 text-[11.5px] leading-relaxed max-w-md">
                    In summer. In winter it is 13:30. Either way the surf, the swim and half the
                    day are done before the first message arrives.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- FAQ ---------------- */}
          {/* These answers are also emitted as FAQPage structured data. They have
              to stay word-for-word identical to the ones in seo/structuredData —
              which is why both read from the same array rather than being typed
              out twice. */}
          <section
            id="faq"
            className="scroll-mt-24 space-y-8 pt-20 mt-20 border-t border-slate-200"
          >
            <h2 className="text-[28px] sm:text-4xl font-medium tracking-[-0.02em] leading-[1.12]">
              Before you book
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {FAQ.map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl bg-white border border-slate-200/70 p-6 space-y-2"
                >
                  <h3 className="text-sm font-medium leading-snug">{item.q}</h3>
                  <p className="text-slate-500 text-[11.5px] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------- LONG STAYS ---------------- */}
          <section className="mt-20 rounded-[24px] bg-white border border-slate-200/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto lg:min-h-[280px] bg-slate-100 overflow-hidden">
              <Photo photo={IMAGES.gardenTerraceDay} className="w-full h-full object-cover" />
            </div>

            <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center gap-5">
              <div className="space-y-3">
                <h2 className="text-2xl font-medium tracking-[-0.02em] leading-snug">
                  Staying a month or more?
                </h2>
                <p className="text-slate-500 text-[11.5px] leading-relaxed max-w-md">
                  Message us with your dates and we will quote the room and the desk together, at a
                  rate that makes sense for a month rather than a week.
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
          </section>
        </main>
      </Slab>
    </>
  );
};
