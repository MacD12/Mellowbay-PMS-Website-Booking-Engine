import React from 'react';
import { Link } from 'react-router-dom';
import { useTilt } from '../ui/useTilt';

/**
 * Wrappers that attach the pointer tilt to a card.
 *
 * These exist because `useTilt` owns a ref per element and hooks cannot be
 * called inside a `.map()`. Each card in a list therefore needs to be its own
 * component — that is all these are.
 *
 * Callers still supply their own `className`; `tilt` is merged in so the card
 * keeps whatever surface styling it already had.
 */

type TiltBoxProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Adds the pointer-tracking sheen. Skip it on dark or image-filled cards. */
  glare?: boolean;
  /** Softer rotation, for cards much wider than they are tall. */
  flat?: boolean;
};

const classes = (base: string | undefined, glare?: boolean, flat?: boolean) =>
  ['tilt', glare && 'tilt-glare', flat && 'tilt-flat', base].filter(Boolean).join(' ');

export const TiltBox: React.FC<TiltBoxProps> = ({
  className,
  glare,
  flat,
  children,
  ...rest
}) => {
  const tilt = useTilt<HTMLDivElement>();
  return (
    <div {...rest} {...tilt} className={classes(className, glare, flat)}>
      {children}
    </div>
  );
};

type TiltLinkProps = React.ComponentProps<typeof Link> & {
  glare?: boolean;
  flat?: boolean;
};

export const TiltLink: React.FC<TiltLinkProps> = ({
  className,
  glare,
  flat,
  children,
  ...rest
}) => {
  const tilt = useTilt<HTMLAnchorElement>();
  return (
    <Link {...rest} {...tilt} className={classes(className, glare, flat)}>
      {children}
    </Link>
  );
};
