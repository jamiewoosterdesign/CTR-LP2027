# CTR-LP2027 local handoff

Complete published static site snapshot, including English, Thai, Spanish, Italian, German, all images, hero video clips, raw video gallery, translation review, and the original project source.
Snapshot: published Sites version 264; source commit b758aa15c2dcf1af6920729c882292dbd1a65110.

## Run locally
1. Extract this ZIP. Open the extracted CTR-LP2027-local folder in your local coding app.
2. Install Node.js 20 or newer if needed.
3. Run `npm run dev` (no dependency installation required).
4. Open http://localhost:3000/concept-traveller-stories-interactive/ in Chrome.

The local server supports byte ranges for video playback. Do not double-click HTML files: absolute asset URLs need the local server.

## Pages
- English: /concept-traveller-stories-interactive/
- Thai: /concept-traveller-stories-interactive/th/
- Spanish: /concept-traveller-stories-interactive/es/
- Italian: /concept-traveller-stories-interactive/it/
- German: /concept-traveller-stories-interactive/de/
- Original video downloads: /hero-videos/
- Translation notes: /translation-review/
- Prior audit landing page: /index.html

## Push to the requested GitHub repository
The repository was empty when checked. No Git metadata or credentials are included.
From this extracted folder:

```sh
git init -b main
git add .
git commit -m "Import complete CTR landing page and translations"
git remote add origin https://github.com/jamiewoosterdesign/CTR-LP2027.git
git push -u origin main
```

Authenticate GitHub locally when prompted. If the remote has acquired commits since this handoff, fetch and review them first; do not force-push.

## Deploy the connected Vercel project ctr-lp2027
The push should trigger the existing Git integration. In that project use repository root, Framework Preset Other, build command `npm run build`, output directory `dist`. vercel.json includes these settings and a root redirect to the interactive English page. Remove any old Root Directory override if one exists. No environment variables are required for the static report. Check Vercel's deployment status; this handoff does not claim a completed Vercel deployment.

## Editing and original source
Edit the files under dist directly: they are the current production source for this portable static project. npm run build validates required files; it does not regenerate or overwrite pages. Commit dist: it is deliberately NOT ignored here.

source-reference contains the original tracked framework source and localization scripts for history and reference. It is not the portable app's build input. The original framework package and build scripts target Sites/Cloudflare; do not run them to rebuild these current pages. Some localization scripts assume the old workspace paths and fuzzy matching has previously contaminated generation labels. Do not run them blindly; preserve current corrected HTML and use stable selectors for any further translation updates.

localization/translation-audit-source.csv is the supplied copy deck snapshot. Preserve design figures +4.1pp and 29.7%; ignore the duplicate Australian introduction and the unused "Get found and booked at the right rate." line. Keep English "affiliates". German requires editorial review; prior spreadsheet errors were repaired. Fonts still use Google Fonts, so an internet connection is needed for those font downloads. Page content, images, scripts and videos are included locally.

## Honest QA status
Source and screenshot-based fixes were published, but a complete live visual desktop/mobile audit was NOT completed. Do not mark this task done without opening every language in an actual browser. See NEXT-CHAT.md for the remaining task.

