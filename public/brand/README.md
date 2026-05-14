# TrustSignal brand assets

Reconstructed from brand guide screenshots — geometry approximated from raster source.
If the actual logo files exist in vector form elsewhere, replace these.

## Files

- `mark.svg` — mark only, `currentColor` (re-skinnable via CSS)
- `mark-coral.svg` — mark, Coral Red #E8614D
- `mark-white.svg` — mark, Warm White #FAF9F7
- `mark-black.svg` — mark, Near Black #0F0F0F
- `wordmark.svg` — wordmark only, `currentColor`
- `lockup-horizontal.svg` — mark + wordmark side-by-side, `currentColor`
- `lockup-stacked.svg` — mark above wordmark, `currentColor`

## Color tokens

| Name           | Hex       | Use                                         |
|----------------|-----------|---------------------------------------------|
| Coral Red      | `#E8614D` | Primary accent, CTAs, logo mark             |
| Near Black     | `#0F0F0F` | Primary backgrounds, body text              |
| Warm White     | `#FAF9F7` | Text on dark, light backgrounds, cards      |
| Muted Gray     | `#757575` | Secondary text, subtle borders, disabled    |
| Verified Green | `#2D7A4F` | Semantic only — verified, confirmed, success |

## Typography

- Primary: Space Grotesk Bold (700) — headings and wordmark
- Body / UI: Inter

## Usage rules

- The mark sits on a 128×128 grid. Do not stretch.
- Minimum mark height: 24px screen, 0.25in print.
- Coral on Near Black is the primary lockup.
- The brand is austere — resist embellishment.

## OG image

The site OG image is rendered dynamically at `/api/og` (see `app/api/og/route.tsx`).
It uses the same mark geometry as the SVGs in this folder.
