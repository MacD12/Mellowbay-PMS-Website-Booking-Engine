import React from 'react';
import type { Photo as PhotoData } from '../types';

interface PhotoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  photo: PhotoData;
  /**
   * Set on the one image that is the page's Largest Contentful Paint — in
   * practice the header photograph, above the fold on every page. It loads
   * eagerly at high priority; everything else waits until it is near the
   * viewport. Marking more than one image per page as priority is the same as
   * marking none, because the point is the ordering.
   */
  priority?: boolean;
  /** Overrides the alt text from the photo record. Pass '' for decoration. */
  alt?: string;
}

/**
 * Every photograph on the site goes through here.
 *
 * Three things it guarantees that a bare <img> did not:
 *
 * - `width`/`height` are always present, so the browser reserves the right box
 *   before the file arrives and the page stops shifting under the reader. This
 *   is most of the Cumulative Layout Shift half of Core Web Vitals. The values
 *   are the file's intrinsic pixels; the CSS still decides the rendered size.
 * - Everything below the fold is `loading="lazy"`, so a page with twelve
 *   photographs fetches the one you can see. The header image opts out via
 *   `priority`, because lazy-loading your own LCP element delays it.
 * - `alt` comes from the photo record by default, so a frame is described the
 *   same way everywhere it appears.
 */
export const Photo: React.FC<PhotoProps> = ({ photo, priority = false, alt, ...rest }) => (
  <img
    src={photo.src}
    alt={alt ?? photo.alt}
    width={photo.width}
    height={photo.height}
    loading={priority ? 'eager' : 'lazy'}
    // Off the main thread either way; on the priority image it is the decode,
    // not the fetch, that tends to be the last thing holding up the paint.
    decoding="async"
    fetchPriority={priority ? 'high' : 'auto'}
    {...rest}
  />
);
