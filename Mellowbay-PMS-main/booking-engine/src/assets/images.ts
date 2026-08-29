// Photography of the property, shot on site. Filenames come from the source
// export and carry no meaning, so the semantic name lives here — this file is
// the single place to re-point a photo without touching the pages that use it.
//
// Each entry carries its intrinsic pixel size and its alt text alongside the
// URL. The size is what lets every <img> reserve its box before the file
// arrives, which is most of the Cumulative Layout Shift score; the alt text
// lives here rather than at the call site so one frame cannot end up described
// three different ways on three different pages.
//
// Alt text describes what is actually in the frame. It is not a place to
// repeat keywords — a search engine that catches you doing it discounts the
// lot, and a screen reader user just gets nonsense.
import type { Photo } from '../types';

import buildingFacadeSrc from './images/mello-bay-images/unnamed.webp';
import communalTableSrc from './images/mello-bay-images/516955948.jpg';
import communalTableWideSrc from './images/mello-bay-images/516955940.jpg';
import corridorGuestSrc from './images/mello-bay-images/516959438.jpg';
import corridorMonoSrc from './images/mello-bay-images/516959109.jpg';
import corridorPalmsSrc from './images/mello-bay-images/516958780.jpg';
import courtyardAboveSrc from './images/mello-bay-images/516956334.jpg';
import coworkingBeanbagSrc from './images/mello-bay-images/516959075.jpg';
import coworkingDeskArtSrc from './images/mello-bay-images/516955944.jpg';
import coworkingDeskRowSrc from './images/mello-bay-images/516955945.jpg';
import coworkingDesksSrc from './images/mello-bay-images/516955922.jpg';
import coworkingFocusSrc from './images/mello-bay-images/516955953.jpg';
import coworkingLaptopSrc from './images/mello-bay-images/516955905.jpg';
import coworkingMonitorsSrc from './images/mello-bay-images/534137062.jpg';
import coworkingNeonSrc from './images/mello-bay-images/534169832.jpg';
import coworkingPeopleSrc from './images/mello-bay-images/516955946.jpg';
import coworkingPortraitSrc from './images/mello-bay-images/516955939.jpg';
import coworkingRoomSrc from './images/mello-bay-images/516955941.jpg';
import coworkingSignSrc from './images/mello-bay-images/516959087.jpg';
import coworkingWindowSrc from './images/mello-bay-images/516955943.jpg';
import gardenTerraceDaySrc from './images/mello-bay-images/516956320.jpg';
import guestYellowDoorsSrc from './images/mello-bay-images/516959437.jpg';
import loungeCeilingSrc from './images/mello-bay-images/516955900.jpg';
import loungeChairsSrc from './images/mello-bay-images/516955928.jpg';
import loungeRattanChairsSrc from './images/mello-bay-images/516955899.jpg';
import loungeReadingSrc from './images/mello-bay-images/516955864.jpg';
import loungeSeatingSrc from './images/mello-bay-images/516955896.jpg';
import muralPlantsSrc from './images/mello-bay-images/516955861.jpg';
import plantDarkSrc from './images/mello-bay-images/516959130.jpg';
import roomBedDetailSrc from './images/mello-bay-images/553193244.jpg';
import roomDoorsSrc from './images/mello-bay-images/516958802.jpg';
import roomDoubleSrc from './images/mello-bay-images/532008000.jpg';
import roomKingBedSrc from './images/mello-bay-images/553191344.jpg';
import roomPillowDetailSrc from './images/mello-bay-images/553191180.jpg';
import stairwellSrc from './images/mello-bay-images/516958490.jpg';
import terraceDaybedSrc from './images/mello-bay-images/516959403.jpg';
import terraceLoungerSrc from './images/mello-bay-images/516959433.jpg';
import terraceNightSrc from './images/mello-bay-images/600421598.jpg';

const photo = (src: string, width: number, height: number, alt: string): Photo => ({
  src,
  width,
  height,
  alt,
});

export const IMAGES = {
  // ---- Exterior and grounds ----
  // TODO: 480x360 is the smallest file in the set and it is used as a page
  // header. Re-export it at 1600px wide when the original is to hand.
  buildingFacade: photo(
    buildingFacadeSrc,
    480,
    360,
    'The Mellow Bay building on Matara Road in Pelena, Weligama',
  ),
  courtyardAbove: photo(
    courtyardAboveSrc,
    512,
    768,
    'The sand courtyard at Mellow Bay, with loungers, palms and string lights',
  ),
  gardenTerraceDay: photo(
    gardenTerraceDaySrc,
    1024,
    683,
    'Two guests sitting with drinks on a daybed in the garden terrace at Mellow Bay',
  ),
  terraceNight: photo(
    terraceNightSrc,
    576,
    768,
    'Guests spread across floor cushions on the Mellow Bay terrace in the evening',
  ),
  terraceDaybed: photo(terraceDaybedSrc, 512, 768, 'A shaded daybed on the terrace at Mellow Bay'),
  terraceLounger: photo(terraceLoungerSrc, 512, 768, 'A lounger in the garden at Mellow Bay'),

  // ---- Coworking ----
  // The workspace trades under the name Connect Co-Working Space, which is why
  // several of these frames carry that signage.
  coworkingPeople: photo(
    coworkingPeopleSrc,
    1024,
    683,
    'Three people working on laptops at the shared desks in the Mellow Bay coworking space',
  ),
  coworkingDesks: photo(
    coworkingDesksSrc,
    1024,
    683,
    'Rows of white coworking desks and chairs under painted murals at Mellow Bay',
  ),
  coworkingRoom: photo(
    coworkingRoomSrc,
    1024,
    683,
    'The main coworking room at Mellow Bay, with desks, ceiling fans and mural walls',
  ),
  coworkingLaptop: photo(
    coworkingLaptopSrc,
    1024,
    683,
    'A guest working at a laptop beside a garden window in the Weligama coworking space',
  ),
  coworkingFocus: photo(
    coworkingFocusSrc,
    1024,
    683,
    'A remote worker at a laptop under rattan pendant lights at Mellow Bay',
  ),
  coworkingWindow: photo(
    coworkingWindowSrc,
    1024,
    683,
    'Coworking desks beside a tall window looking onto the garden at Mellow Bay',
  ),
  coworkingMonitors: photo(
    coworkingMonitorsSrc,
    614,
    768,
    'A dual-monitor workstation in the Mellow Bay coworking space in Weligama',
  ),
  coworkingNeon: photo(
    coworkingNeonSrc,
    576,
    768,
    'A guest working late at a desk lit by a neon lightning-bolt sign',
  ),
  coworkingBeanbag: photo(
    coworkingBeanbagSrc,
    576,
    768,
    'A guest working from a beanbag chair in the Mellow Bay lounge',
  ),
  coworkingSign: photo(
    coworkingSignSrc,
    1024,
    683,
    'The Connect Co-Working Space sign on the glass door at Mellow Bay, Weligama',
  ),
  coworkingDeskArt: photo(
    coworkingDeskArtSrc,
    576,
    768,
    'A single desk and lamp beside a large painted mural at Mellow Bay',
  ),
  coworkingDeskRow: photo(
    coworkingDeskRowSrc,
    512,
    768,
    'A row of coworking desks along the mural wall at Mellow Bay',
  ),
  coworkingPortrait: photo(
    coworkingPortraitSrc,
    512,
    768,
    'A guest at work in the Mellow Bay coworking space',
  ),

  // ---- Lounge and shared spaces ----
  // These frames were previously labelled as a restaurant. They are the
  // communal lounge and the long shared tables, which is what they have always
  // shown, and what the property still offers.
  loungeSeating: photo(
    loungeSeatingSrc,
    1024,
    683,
    'The communal lounge at Mellow Bay, with rattan chairs, plants and pendant lights',
  ),
  communalTable: photo(
    communalTableSrc,
    1024,
    683,
    'The long shared table in the Mellow Bay communal area, under rattan pendant lights',
  ),
  communalTableWide: photo(
    communalTableWideSrc,
    512,
    768,
    'The communal long table and plants in the shared coliving space at Mellow Bay',
  ),
  loungeCeiling: photo(
    loungeCeilingSrc,
    1024,
    683,
    'Rattan pendant lights and a ceiling fan above the lounge at Mellow Bay',
  ),
  loungeRattanChairs: photo(
    loungeRattanChairsSrc,
    512,
    768,
    'Rattan chairs and a potted plant in the Mellow Bay lounge',
  ),
  loungeChairs: photo(
    loungeChairsSrc,
    512,
    768,
    'Round rattan chairs and murals in the shared lounge at Mellow Bay',
  ),
  loungeReading: photo(
    loungeReadingSrc,
    1024,
    683,
    'A guest reading in a rattan chair by the window at Mellow Bay',
  ),
  muralPlants: photo(
    muralPlantsSrc,
    1024,
    683,
    'A painted mural and tropical plants in the shared space at Mellow Bay',
  ),
  corridorPalms: photo(
    corridorPalmsSrc,
    512,
    768,
    'Palms and yellow shutters along the corridor at Mellow Bay',
  ),
  corridorGuest: photo(corridorGuestSrc, 512, 768, 'A guest in the corridor at Mellow Bay'),
  guestYellowDoors: photo(
    guestYellowDoorsSrc,
    512,
    768,
    'The yellow guest room doors at Mellow Bay',
  ),

  // ---- Rooms ----
  roomDouble: photo(
    roomDoubleSrc,
    576,
    768,
    'A private double room at Mellow Bay, with a mural, bedside lamp and air-conditioning',
  ),
  roomKingBed: photo(
    roomKingBedSrc,
    539,
    768,
    'The deluxe family suite at Mellow Bay, with a large bed and wooden furniture',
  ),
  roomDoors: photo(
    roomDoorsSrc,
    1024,
    683,
    'Numbered yellow doors to the guest rooms at Mellow Bay in Weligama',
  ),
  roomBedDetail: photo(roomBedDetailSrc, 576, 768, 'Bed linen detail in a Mellow Bay guest room'),
  roomPillowDetail: photo(
    roomPillowDetailSrc,
    576,
    768,
    'Pillow and headboard detail in a Mellow Bay guest room',
  ),

  // ---- Texture and detail ----
  stairwell: photo(stairwellSrc, 512, 768, 'The stairwell at Mellow Bay'),
  corridorMono: photo(corridorMonoSrc, 512, 768, 'A corridor at Mellow Bay'),
  plantDark: photo(plantDarkSrc, 512, 768, 'A tropical plant against a dark wall at Mellow Bay'),
} satisfies Record<string, Photo>;

export type ImageKey = keyof typeof IMAGES;
