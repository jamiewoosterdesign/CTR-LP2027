# Hero handover (Claude, 28 Oct 2026)

The hero media on `/concept-traveller-stories-interactive/` (EN + de/es/fr/it/pt/th) was replaced. Nothing else on the page changed. **This supersedes the NEXT-CHAT.md note about keeping the original "subtle first loop and lazy-loaded extended sequence"**: that old hero (`suitcase-hero-sequence.js`, `hero-morph-*.mp4`, `hero-*-*.mp4`) is no longer referenced. Its files are still in `dist/assets` but unused, so nothing else breaks. Please don't restore it, and don't edit the files listed below while working on translations.

## What it is
A seamless loop of six bags (silver → backpack → pink → duffle → orange → leather → silver). Each bag hovers, then spins, and the next bag takes over at peak motion blur. The bags are transparent video on top of a separately animated sky.

## Files (all new)
- `dist/assets/ctr-hero.css`: layer styling. Bags are shifted right on desktop (`--ctr-bag-x:24%`) and centred at ≤900px.
- `dist/assets/ctr-hero.js`: playback logic.
- `dist/assets/ctr-hero/bag-poster.webp`: still frame shown instantly (frame 0 of the intro, transparent).
- `dist/assets/ctr-hero/intro.webm`: silver ⇄ backpack, 384 frames at 24 fps (4.1 MB, VP9 with alpha). Loops on its own.
- `dist/assets/ctr-hero/rest.webm`: the other four bags, 844 frames (11.3 MB). Downloaded in full in the background.
- `dist/assets/ctr-hero/sky-base.jpg`, `clouds-high.webp`, `clouds-low.webp`: the sky. The two cloud layers drift left at different speeds (repeat-x, tile 2330×1080).

## Markup (identical in all 7 pages)
- In `#report-top`, the old `<picture class="suitcase-poster">` and `<video class="suitcase-video">` were replaced by `<div class="suitcase-poster ctr-hero"><div class="suitcase-image ctr-stage" role="img" aria-label="…">`. This contains the sky layers, `img.ctr-bag-poster`, `video.ctr-intro` and `video.ctr-rest`.
- The stage keeps the classes `suitcase-poster` / `suitcase-image` on purpose. The existing rules in `suitcase-profile-hero.css` (desktop 90% box top-right with masks; mobile square box at the bottom) still size and position it, and the white copy overlay (`.suitcase-hero:before`) is unchanged.
- The `aria-label` holds the localized alt text from the old poster image. Translate it there if needed.
- Head: added `<link href="/assets/ctr-hero.css">` after `suitcase-profile-hero.css`, and preloads for `sky-base.jpg` and `bag-poster.webp`.
- Scripts: `suitcase-hero-sequence.js` was swapped for `ctr-hero.js`.

## How playback works
1. On load, the sky and the still bag show immediately.
2. `intro.webm` starts and loops seamlessly for as long as needed.
3. After the page `load` event, `rest.webm` is fetched in full (as a blob).
4. Once the rest has loaded, the intro hands over to it at frame 290, which is identical in both files. At the end of the rest, playback hands back to intro frame 0.
5. Each swap waits for the incoming video's first drawn frame (`requestVideoFrameCallback`), so there are no blank frames.

Other behaviour:
- Playback pauses when the hero is off-screen or the tab is hidden.
- With `prefers-reduced-motion`, there is no video and no cloud drift: you get the still bag over a static sky.
- Safari can't render transparent VP9, so it gets the still bag over moving clouds.
- Test the fallback with `?hero=static`.
