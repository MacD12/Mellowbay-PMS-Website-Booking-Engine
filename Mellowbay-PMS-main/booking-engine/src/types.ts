export interface RoomType {
  id: string;
  title: string;
  subtitle: string;
  sleeps: number;
  bedSummary: string;
  category: 'dorm' | 'private' | 'suite';
  imageUrl: string;
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
  imageUrl: string;
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
