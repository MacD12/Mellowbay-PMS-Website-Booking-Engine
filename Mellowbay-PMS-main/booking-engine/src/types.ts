/**
 * A photograph, with everything an <img> needs to be rendered well: the URL the
 * bundler produced, the intrinsic size so the browser can reserve the box
 * before the bytes arrive, and the alt text.
 *
 * Width and height are the file's real pixel dimensions, not the size it is
 * displayed at — the browser only wants the ratio, and CSS decides the rest.
 */
export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface RoomType {
  id: string;
  title: string;
  subtitle: string;
  sleeps: number;
  bedSummary: string;
  category: 'dorm' | 'private' | 'suite';
  image: Photo;
  features: string[];
  description: string;
  privateBathroom: boolean;
  seaView: boolean;
}

/** A rated category from published guest reviews. */
export interface ReviewCategory {
  label: string;
  score: number;
}

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  image: Photo;
  features: string[];
  /** Route this card links through to. */
  href: string;
}

export interface EnquiryState {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId: string;
  extras: string[];
  contactName: string;
  phone: string;
  email: string;
}
