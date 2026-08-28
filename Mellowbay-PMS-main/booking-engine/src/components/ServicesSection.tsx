import React from 'react';
import { ArrowUpRight, LayoutGrid, Settings } from 'lucide-react';
import { SERVICES_DATA, SERVICE_HIGHLIGHTS } from '../data/mockData';
import { TiltLink } from './Tilt';

const HIGHLIGHT_ICONS = [LayoutGrid, Settings];

export const ServicesSection: React.FC = () => {
  return (
    <section
      id="services-section"
      className="max-w-6xl mx-auto px-5 sm:px-9 md:px-14 pt-16 sm:pt-20 pb-14"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left column */}
        <div className="lg:col-span-5 flex flex-col lg:min-h-[420px]">
          <h2 className="text-ink text-[30px] sm:text-4xl font-medium tracking-[-0.02em] leading-[1.12]">
            A place to sleep, eat and work — all of it on the sand
          </h2>

          <p className="mt-5 text-slate-500 text-[11.5px] leading-relaxed max-w-sm">
            Mellow Bay is a beachfront hostel and coliving space in Weligama, with its own stretch of
            beach, a restaurant, a bar and a workspace for guests who stay a while.
          </p>

          {/* Two quiet icon highlights, pinned to the bottom of the column */}
          <div className="mt-12 lg:mt-auto grid grid-cols-2 gap-8 max-w-md">
            {SERVICE_HIGHLIGHTS.map((item, idx) => {
              const Icon = HIGHLIGHT_ICONS[idx] ?? LayoutGrid;
              return (
                <div key={item.id} className="space-y-4">
                  <Icon className="w-6 h-6 text-ink" strokeWidth={1.5} />
                  <p className="text-slate-500 text-[11px] leading-relaxed">{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: three horizontal service cards */}
        <div className="lg:col-span-7 space-y-3.5">
          {SERVICES_DATA.map((card) => (
            <TiltLink
              key={card.id}
              to={card.href}
              flat
              className="group bg-white rounded-2xl p-3.5 border border-slate-200/70 elev-1 hover:border-slate-300 flex flex-col sm:flex-row sm:items-start gap-5"
            >
              <div className="w-full sm:w-[104px] h-32 sm:h-[104px] rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  referrerPolicy="no-referrer"
                  className="tilt-layer w-full h-full object-cover scale-[1.06] transition-transform duration-500 group-hover:scale-[1.12]"
                />
              </div>

              <div className="min-w-0 sm:py-2 sm:pr-3 space-y-2">
                <h3 className="text-ink text-[17px] font-medium tracking-[-0.01em] flex items-center gap-1.5">
                  {card.title}
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-ink transition-colors" />
                </h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">{card.description}</p>
              </div>
            </TiltLink>
          ))}
        </div>
      </div>
    </section>
  );
};
