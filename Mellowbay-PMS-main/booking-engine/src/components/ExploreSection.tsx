import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SITE_SECTIONS } from '../data/mockData';
import { TiltLink } from './Tilt';

/** Closing hub on the home page — a way through to every other page on the site. */
export const ExploreSection: React.FC = () => (
  <section className="max-w-6xl mx-auto px-5 sm:px-9 md:px-14 py-14 sm:py-16">
    <div className="mb-8">
      <h2 className="text-[30px] sm:text-4xl font-medium tracking-[-0.02em] leading-[1.12]">
        <span className="text-ink">Where to next</span>
      </h2>
      <p className="mt-4 text-slate-500 text-[11px]">
        The rest of the site, in four stops
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {SITE_SECTIONS.map((section, i) => (
        <TiltLink
          key={section.to}
          to={section.to}
          glare
          className="group bg-white rounded-[20px] border border-slate-200/70 overflow-hidden flex flex-col elev-1 hover:border-slate-300"
        >
          <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
            {/* Scaled a touch past the frame so the parallax shift never
                exposes an edge as the card tilts. */}
            <img
              src={section.imageUrl}
              alt={section.title}
              referrerPolicy="no-referrer"
              className="tilt-layer w-full h-full object-cover scale-[1.06] transition-transform duration-500 group-hover:scale-[1.12]"
            />
          </div>

          <div className="p-5 flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {String(i + 1).padStart(2, '0')} · {section.label}
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-ink transition-colors shrink-0" />
            </div>

            <h3 className="text-[15px] font-medium leading-snug">{section.title}</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">{section.detail}</p>
          </div>
        </TiltLink>
      ))}
    </div>
  </section>
);
