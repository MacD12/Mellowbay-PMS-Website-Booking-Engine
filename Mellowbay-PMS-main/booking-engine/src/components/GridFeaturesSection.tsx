import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../assets/images';
import { HERO_DATA, REVIEW_CATEGORIES } from '../data/mockData';
import { TiltBox } from './Tilt';

interface GridFeaturesSectionProps {
  onOpenReviews: () => void;
  onOpenGallery: () => void;
}

const pillClass =
  'inline-flex items-center gap-1.5 text-[11px] font-medium px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-sm text-ink hover:bg-white shadow-sm transition-colors cursor-pointer';

const MoreButton: React.FC<{ onClick: () => void; label?: string }> = ({
  onClick,
  label = 'Learn more',
}) => (
  <button onClick={onClick} className={pillClass}>
    <span>{label}</span>
    <ArrowUpRight className="w-3 h-3" />
  </button>
);

const MoreLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link to={to} className={pillClass}>
    <span>{label}</span>
    <ArrowUpRight className="w-3 h-3" />
  </Link>
);

export const GridFeaturesSection: React.FC<GridFeaturesSectionProps> = ({
  onOpenReviews,
  onOpenGallery,
}) => {
  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-9 md:px-14 py-14 sm:py-16">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[30px] sm:text-4xl font-medium tracking-[-0.02em] leading-[1.12]">
          <span className="text-ink">Steps from the sand</span>
          <span className="block text-slate-400">and minutes from</span>
          <span className="block text-slate-400">everything else</span>
        </h2>
        <p className="mt-4 text-slate-500 text-[11px]">
          Weligama Beach is a {HERO_DATA.beachWalkMinutes}-minute walk from the door
        </p>
      </div>

      {/* Four-card mosaic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1 — Private beach */}
        <TiltBox className="bg-white rounded-[20px] p-4 border border-slate-200/70 elev-1 flex flex-col min-h-[300px]">
          <h3 className="text-ink text-[15px] font-medium leading-snug">
            Our own private beach area
          </h3>

          <div className="mt-4 flex-1 relative overflow-hidden rounded-[14px] bg-slate-100">
            {/* TODO: no beach photograph exists in the current shoot — this is the
                courtyard. Swap in a real beach frame when one is available. */}
            <img
              src={IMAGES.courtyardAbove}
              alt="The courtyard and garden, looking out over the palms"
              referrerPolicy="no-referrer"
              className="tilt-layer w-full h-full object-cover scale-[1.06]"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink/45 to-transparent">
              <MoreButton onClick={onOpenGallery} label="See photos" />
            </div>
          </div>
        </TiltBox>

        {/* 2 — Guest rating, straight from the listing */}
        <TiltBox className="bg-white rounded-[20px] p-4 border border-slate-200/70 elev-1 flex flex-col min-h-[300px]">
          <h3 className="text-ink text-[15px] font-medium leading-snug">
            Rated {HERO_DATA.rating} by {HERO_DATA.reviewsCount} guests
          </h3>

          <div className="mt-4 flex-1 space-y-2.5">
            {REVIEW_CATEGORIES.slice(0, 4).map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex items-baseline justify-between text-[10px]">
                  <span className="text-slate-500">{cat.label}</span>
                  <span className="font-semibold text-ink">{cat.score.toFixed(1)}</span>
                </div>
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${(cat.score / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <MoreButton onClick={onOpenReviews} label="See scores" />
          </div>
        </TiltBox>

        {/* 3 — Restaurant (dark) */}
        <TiltBox className="bg-ink rounded-[20px] p-4 flex flex-col min-h-[300px] elev-2">
          <h3 className="text-white text-[15px] font-medium leading-snug">
            Restaurant and bar open all day
          </h3>

          <div className="mt-4 flex-1 relative overflow-hidden rounded-[14px] bg-ink-soft">
            <img
              src={IMAGES.restaurantTables}
              alt="The restaurant, with the kitchen counter behind"
              referrerPolicy="no-referrer"
              className="tilt-layer w-full h-full object-cover opacity-90 scale-[1.06]"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink/80 to-transparent">
              <MoreLink to="/eat-and-work#eat" label="See the menu" />
            </div>
          </div>
        </TiltBox>

        {/* 4 — Coworking */}
        <TiltBox className="bg-white rounded-[20px] p-4 border border-slate-200/70 elev-1 flex flex-col min-h-[300px]">
          <h3 className="text-ink text-[15px] font-medium leading-snug">
            Coworking, yoga and a garden terrace
          </h3>

          <div className="mt-4 flex-1 relative overflow-hidden rounded-[14px] bg-slate-100">
            <img
              src={IMAGES.coworkingDesks}
              alt="Desks in the coworking space"
              referrerPolicy="no-referrer"
              className="tilt-layer w-full h-full object-cover scale-[1.06]"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink/45 to-transparent">
              <MoreLink to="/eat-and-work#work" label="Work from here" />
            </div>
          </div>
        </TiltBox>
      </div>
    </section>
  );
};
