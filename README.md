# Changing Traveller Report 2027

Current production source for the seven language pages: English, German, Spanish, French, Italian, Portuguese and Thai.

## Run and validate
Use Node.js 20 or newer. Run `npm run dev`, then open http://localhost:3000/concept-traveller-stories-interactive/. Run `npm run build` to validate required pages and animation assets. The build validates `dist`; it does not regenerate it. Edit and commit `dist` directly.

## Production routes
English uses `/concept-traveller-stories-interactive/`. Translations use the same route followed by `de/`, `es/`, `fr/`, `it/`, `pt/` or `th/`. The site root redirects to English.

All seven pages share `/assets/`, including the current hero animation. See HERO-HANDOVER.md for animation details. Preserve the shared brand arrow and flag license.

## Deployment
The connected Vercel project is `ctr-lp2027`; GitHub main triggers deployment. `vercel.json` sets the build command and `dist` output. No environment variables or dependencies are required. Confirm deployment success separately from local validation.

## Supporting material
`localization/` preserves translation sources and helpers. `source-reference/` is historical reference, not build input. Do not regenerate corrected pages with older framework or localization scripts without reviewing the result.

## Cleanup, 29 October 2026
Removed unused legacy hero videos, original images superseded by WebP assets, unused scripts/styles and the static export, comparison/audit landing and video/review pages. The seven report pages and all assets reachable from them were preserved byte for byte. The deployment output fell from 163.68 MB to 24.46 MB (decimal).

A verified recovery archive is stored outside this repository and deployment at `SiteMinder/_Exports/CTR-pre-cleanup-b50f23b-2026-10-29.zip`. It contains the removed files and dependency audit. QA evidence remains local in `qa/` and is excluded from Git and manual Vercel uploads.
