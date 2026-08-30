# Brand masters

Source artwork for the Mellow Bay Living identity. **Nothing here is deployed.**

These files used to sit in `public/`, which Vite copies to `dist/` verbatim. That
put roughly 3 MB of full-resolution logo variants on the public web on every
build — reachable by URL, crawlable, and never once referenced by a page. They
live here instead, still in the repository, still to hand.

## What the site actually serves

The derivatives in `public/` are generated from these and are the only versions
the site loads:

| Served file | Made from | Used for |
| --- | --- | --- |
| `mellow-bay-logo-white-480.png` | `mellow-bay-logo-white.png` | Navbar, over the dark hero and the solid bar |
| `mellow-bay-logo-black-480.png` | `mellow-bay-logo-black.png` | Navbar, over the light sand pages |
| `mellow-bay-icon-256.png` | `mellow-bay-mark-black.png` | Favicon |
| `mellow-bay-icon-180.png` | `mellow-bay-mark-black.png` | Apple touch icon |

The wordmarks are drawn at 114–136 CSS pixels. The masters are 3764 px wide — a
92 kB download and an 18 MB decode on a phone, for a logo — so they are resized
to 480 px, which still covers a 3x display.

The icons are cropped in from `mellow-bay-mark-black.png`, which carries wide
margins around the circle; at 16 px in a tab strip those margins would shrink
the mark to nothing. They are flattened onto the artwork's own white ground,
because a transparent icon disappears into whichever tab strip it lands on.

## Regenerating

If a master changes, regenerate its derivative at the same dimensions and keep
`LOGO_SIZE` in `src/components/Navbar.tsx` in step — those numbers are what stop
the page shifting while the logo loads, so a stale pair is worse than none.

## The rest

`Web-NavBar-Logo-MellowBay.png` is the first navbar lockup supplied. It carries a
`COWORKING | ROOMS | COMMUNITY` line that is illegible at navbar size, and was
superseded by the white/black pair. Kept for reference.

The `IMG_*.png` and `*.jpg.jpeg` files are further exports of the same identity
in assorted crops and colourways.
