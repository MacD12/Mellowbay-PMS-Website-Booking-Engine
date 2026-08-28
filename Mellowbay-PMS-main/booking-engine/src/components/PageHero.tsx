import React from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
}

/**
 * Header band for the inner pages — the same pinned, blue-ground treatment as the
 * home hero, but shorter and with a single line of type.
 */
export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, intro, image, imageAlt }) => (
  <section className="sticky top-0 z-0 bg-hero overflow-hidden">
    <div className="hidden lg:block absolute top-14 right-0 w-[46%] h-[380px] rounded-l-[28px] overflow-hidden shadow-[0_24px_60px_-24px_rgba(16,17,20,0.45)]">
      <img
        src={image}
        alt={imageAlt}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center"
      />
    </div>

    <div className="relative max-w-6xl mx-auto px-5 sm:px-9 md:px-14 pt-28 sm:pt-32 lg:pt-36 pb-16">
      <div className="lg:max-w-[44%] space-y-5 min-h-[220px] lg:min-h-[340px]">
        {/* Dark type: this band is the sand ground with no scrim over it, so the
            text sits straight on a light surface. */}
        <span className="block text-[9px] font-semibold text-ink/55 uppercase tracking-[0.2em]">
          {eyebrow}
        </span>

        <h1 className="text-ink text-[38px] sm:text-5xl lg:text-[54px] font-medium tracking-[-0.03em] leading-[1.02]">
          {title}
        </h1>

        <p className="text-ink/70 text-[13px] sm:text-sm leading-relaxed max-w-sm">{intro}</p>
      </div>

      {/* Mobile / tablet image */}
      <div className="lg:hidden mt-8 rounded-[22px] overflow-hidden aspect-[4/3] shadow-xl">
        <img
          src={image}
          alt={imageAlt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  </section>
);
