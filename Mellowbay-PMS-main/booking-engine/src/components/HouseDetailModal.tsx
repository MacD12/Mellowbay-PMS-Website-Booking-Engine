import React, { useState } from 'react';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../assets/images';
import { HERO_DATA } from '../data/mockData';
import { RoomType } from '../types';

interface RoomDetailModalProps {
  project: RoomType | null;
  onClose: () => void;

}

export const HouseDetailModal: React.FC<RoomDetailModalProps> = ({
  project,
  onClose,

}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!project) return null;

  const currentImg = selectedImage || project.imageUrl;
  const thumbnails = [project.imageUrl, IMAGES.roomPillowDetail];

  return (
    <div className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Gallery */}
          <div className="md:col-span-7 space-y-3">
            <div className="overflow-hidden rounded-2xl bg-slate-100 aspect-[16/10] relative">
              <img
                src={currentImg}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-3 left-3 bg-ink/80 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1 rounded-lg">
                Sleeps {project.sleeps} • {project.bedSummary}
              </span>
            </div>

            <div className="flex gap-2">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(thumb)}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-colors ${
                    currentImg === thumb ? 'border-plum' : 'border-transparent'
                  }`}
                >
                  <img
                    src={thumb}
                    alt={idx === 0 ? 'Room' : 'Property'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-5 space-y-5">
            <div>
              <span className="text-[9px] uppercase font-semibold tracking-[0.16em] text-plum bg-plum/10 px-2.5 py-1 rounded-md">
                {project.category === 'dorm'
                  ? 'Dormitory'
                  : project.category === 'suite'
                    ? 'Family suite'
                    : 'Private room'}
              </span>
              <h2 className="text-2xl font-medium text-ink tracking-[-0.02em] mt-2 leading-snug">
                {project.title}
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{project.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-ink text-white space-y-1">
              <div className="text-[11px] text-white/50">Check-in / check-out</div>
              <div className="text-base font-semibold leading-snug">
                {HERO_DATA.checkIn}
                <span className="text-white/40 font-normal"> · </span>
                {HERO_DATA.checkOut}
              </div>
              <div className="text-[10px] text-white/50">
                Minimum check-in age {HERO_DATA.minAge}. Prices are confirmed when we reply.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Sleeps', value: `${project.sleeps}` },
                { label: 'Beds', value: project.bedSummary },
                { label: 'Bathroom', value: project.privateBathroom ? 'Private' : 'Shared' },
                { label: 'Sea view', value: project.seaView ? 'Yes' : 'No' },
              ].map((spec) => (
                <div key={spec.label} className="p-3 bg-paper rounded-xl">
                  <span className="text-slate-400 text-[10px] block">{spec.label}</span>
                  <span className="font-medium text-ink">{spec.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-ink">In this room:</span>
              <div className="flex flex-wrap gap-1.5">
                {project.features.map((feat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] bg-paper text-slate-600 px-2.5 py-1 rounded-lg"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <Link
              to="/book"
              onClick={onClose}
              className="w-full py-3 bg-plum hover:bg-plum-dark text-white font-medium text-xs rounded-xl pressable transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Book this room</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
