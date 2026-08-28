import React, { useState } from 'react';
import { ArrowUpRight, Bath, BedDouble, Eye, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HERO_DATA, ROOM_TYPES } from '../data/mockData';
import { IMAGES } from '../assets/images';
import { PageHero } from '../components/PageHero';
import { Slab } from '../components/Slab';
import { TiltBox } from '../components/Tilt';
import { useModals } from '../ui/ModalContext';

const FILTERS = [
  { id: 'all', label: 'All rooms' },
  { id: 'private', label: 'Private' },
  { id: 'suite', label: 'Family' },
  { id: 'dorm', label: 'Dorms' },
];

export const Rooms: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const { openRoom } = useModals();

  const rooms = ROOM_TYPES.filter((r) => filter === 'all' || r.category === filter);

  return (
    <>
      <PageHero
        eyebrow="Where you sleep"
        title="Five ways to stay"
        intro="A private double, a family suite, or a bed in one of the air-conditioned dorms — all a few minutes from Weligama Beach."
        image={IMAGES.roomKingBed}
        imageAlt="A private room at Mellow Bay"
      />

      <Slab>
        <main className="max-w-6xl mx-auto px-5 sm:px-9 md:px-14 py-16">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    filter === f.id
                      ? 'bg-ink text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">
              Showing <span className="text-ink font-medium">{rooms.length}</span> of{' '}
              {ROOM_TYPES.length}
            </span>
          </div>

          {/* Room list */}
          <div className="space-y-4">
            {rooms.map((room) => (
              <TiltBox
                key={room.id}
                flat
                className="bg-white rounded-[20px] border border-slate-200/70 elev-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0"
              >
                <div className="md:col-span-4 aspect-[4/3] md:aspect-auto md:min-h-[240px] bg-slate-100 overflow-hidden">
                  <img
                    src={room.imageUrl}
                    alt={room.title}
                    referrerPolicy="no-referrer"
                    className="tilt-layer w-full h-full object-cover scale-[1.06]"
                  />
                </div>

                <div className="md:col-span-8 p-6 sm:p-7 flex flex-col justify-between gap-5">
                  <div className="space-y-2.5">
                    <span className="text-[9px] uppercase font-semibold tracking-[0.16em] text-plum bg-plum/10 px-2.5 py-1 rounded-md">
                      {room.category === 'dorm'
                        ? 'Dormitory'
                        : room.category === 'suite'
                          ? 'Family suite'
                          : 'Private room'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-medium tracking-[-0.02em] leading-snug">
                      {room.title}
                    </h2>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
                      {room.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Sleeps {room.sleeps}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                      {room.bedSummary}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bath className="w-3.5 h-3.5 text-slate-400" />
                      {room.privateBathroom ? 'Private bathroom' : 'Shared bathroom'}
                    </span>
                    {room.seaView && (
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        Sea view
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openRoom(room)}
                      className="inline-flex items-center gap-1.5 bg-ink hover:bg-ink-soft text-white text-[11px] font-medium px-5 py-2.5 rounded-full transition-colors cursor-pointer"
                    >
                      View details
                    </button>
                    <Link
                      to={HERO_DATA.bookingPath}
                      className="inline-flex items-center gap-1.5 bg-paper hover:bg-slate-200 text-ink text-[11px] font-medium px-5 py-2.5 rounded-full transition-colors"
                    >
                      Book this room
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </TiltBox>
            ))}
          </div>

          {/* Booking note */}
          <div className="mt-10 rounded-[20px] bg-white border border-slate-200/70 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <h3 className="text-lg font-medium tracking-[-0.01em]">Not sure which to pick?</h3>
              <p className="text-slate-500 text-xs max-w-md leading-relaxed">
                Tell us your dates and how many of you there are, and we will come back with what is
                free and what it costs.
              </p>
            </div>
            <Link
              to="/book"
              className="bg-plum hover:bg-plum-dark text-white text-xs font-medium px-7 py-3.5 rounded-full pressable transition-colors shrink-0"
            >
              Check availability
            </Link>
          </div>
        </main>
      </Slab>
    </>
  );
};
