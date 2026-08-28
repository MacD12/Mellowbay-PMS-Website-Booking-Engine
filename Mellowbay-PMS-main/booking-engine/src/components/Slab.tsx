import React from 'react';

/**
 * The light content panel every page sits on. Its rounded bottom corners are what
 * carve the dark footer into wings, so the radius here must stay in step with the
 * pull-up in Layout.
 *
 * The shadow stack reads bottom-to-top as: ambient spread, tight contact shadow,
 * the lift off the hero above, then an inset that shades the panel's own bottom
 * edge so it reads as a rounded lip rather than a flat cut.
 */
export const Slab: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="relative z-10 -mt-8 rounded-t-[36px] rounded-b-[56px] bg-paper
      shadow-[0_-24px_60px_-30px_rgba(16,17,20,0.35),0_14px_24px_-8px_rgba(0,0,0,0.7),0_38px_70px_-28px_rgba(0,0,0,0.85),0_70px_110px_-50px_rgba(0,0,0,0.9),inset_0_-22px_30px_-26px_rgba(16,17,20,0.45)]"
  >
    {children}
  </div>
);
