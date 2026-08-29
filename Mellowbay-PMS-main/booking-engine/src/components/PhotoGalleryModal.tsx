import React from 'react';
import { MapPin, X } from 'lucide-react';
import { GALLERY_PHOTOS } from '../data/mockData';
import { Photo } from './Photo';
import { TiltBox } from './Tilt';

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The mosaic, one entry per photo, applied only from `lg` up — narrower screens
 * get a plain one- or two-column stack where varied tile sizes would only make
 * the pictures small.
 *
 * The spans are chosen so the twelve photos tile the three columns exactly, with
 * no holes: a hero opens it, a portrait breaks the middle, and the last frame
 * runs the full width to close it off.
 */
const SPANS = [
  'lg:col-span-2 lg:row-span-2', // the building — opening hero
  '',
  '',
  '',
  '',
  '',
  'lg:row-span-2', // the beanbag — the tall one, and the only portrait crop here
  '',
  '',
  '',
  '',
  'lg:col-span-3', // the terrace after dark — full-width finish
];

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full p-6 sm:p-8 shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-medium text-ink tracking-[-0.02em]">
              Around the property
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              The workspace, the rooms, the shared lounges and the garden terrace
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* `min-h-0` lets this pane actually scroll instead of squeezing the rows,
            and `content-start` keeps every row at its stated height. */}
        <div
          className="min-h-0 flex-1 overflow-y-auto py-6 pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                     auto-rows-[230px] sm:auto-rows-[200px] lg:auto-rows-[180px] content-start gap-4"
        >
          {GALLERY_PHOTOS.map((item, i) => (
            <TiltBox
              key={item.id}
              flat
              className={`group relative overflow-hidden rounded-2xl bg-ink ${SPANS[i] ?? ''}`}
            >
              <Photo
                photo={item.image}
                className="tilt-layer h-full w-full object-cover scale-[1.06] transition-transform duration-500 group-hover:scale-[1.12]"
              />

              {/* Category rides top-left so the bottom is left to the caption alone. */}
              <span className="absolute top-3 left-3 rounded-full bg-ink/55 backdrop-blur-sm px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/90">
                {item.year}
              </span>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/45 to-transparent p-4 pt-10 text-white">
                <h3 className="text-sm font-medium leading-snug">{item.title}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/65">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-clamp-1">{item.location}</span>
                </div>
              </div>
            </TiltBox>
          ))}
        </div>
      </div>
    </div>
  );
};
