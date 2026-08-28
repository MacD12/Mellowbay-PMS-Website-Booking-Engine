import React from 'react';
import { ArrowUpRight, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HERO_DATA, NEARBY, REVIEW_CATEGORIES } from '../data/mockData';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews-section" className="max-w-6xl mx-auto px-5 sm:px-9 md:px-14 py-6 sm:py-8">
      <div className="bg-ink text-white rounded-[28px] px-6 sm:px-10 py-10 sm:py-12">
        {/* Heading */}
        <h2 className="text-[26px] sm:text-[34px] font-medium tracking-[-0.02em] leading-[1.15] max-w-2xl">
          What our guests actually rate us on
        </h2>

        {/* Headline score */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2.5 bg-white text-ink px-4 py-2.5 rounded-full">
            <span className="text-lg font-semibold leading-none">
              {HERO_DATA.rating.toFixed(1)}
            </span>
            <span className="text-[11px] font-medium">{HERO_DATA.ratingWord}</span>
          </span>

          <span className="text-[11px] text-white/55">
            {HERO_DATA.reviewsCount} verified guest reviews
          </span>
        </div>

        {/* Category scores, exactly as published */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          {REVIEW_CATEGORIES.map((cat) => (
            <div key={cat.label} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-white/70">{cat.label}</span>
                <span className="text-sm font-semibold">{cat.score.toFixed(1)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${(cat.score / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Beach highlight + distances */}
        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Waves className="w-4 h-4" />
            </span>
            <div>
              <div className="text-sm font-medium">
                Top-rated beach nearby · {HERO_DATA.beachScore.toFixed(1)}
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">
                Guests rate the beach higher than anything else
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {NEARBY.map((place) => (
              <div key={place.label}>
                <div className="text-sm font-medium">{place.distance}</div>
                <div className="text-[10.5px] text-white/50 leading-snug mt-0.5">{place.label}</div>
              </div>
            ))}
          </div>
        </div>

        <Link
          to={HERO_DATA.bookingPath}
          className="mt-8 inline-flex items-center gap-1.5 text-[11px] font-medium bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-full transition-colors"
        >
          <span>Book your stay</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};
