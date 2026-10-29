# Hero handover (Claude, 28 Oct 2026)

The hero media on `/concept-traveller-stories-interactive/` (EN + de/es/fr/it/pt/th) was replaced. Nothing else on the page changed. **This supersedes the NEXT-CHAT.md note about keeping the original "subtle first loop and lazy-loaded extended sequence"**: that old hero (`suitcase-hero-sequence.js`, `hero-morph-*.mp4`, `hero-*-*.mp4`) is no longer referenced. The unused legacy files were archived outside the project and removed on 29 October 2026. Please don't restore it, and don't edit the files listed below while working on translations.

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
- In `#report-top`, the old `<picture class="suitcase-poster">` and `<video class="suitcase-video">` were replaced by `<div class="suitcase-poster ctr-hero">`. It holds two layers:
  - `div.suitcase-image.ctr-stage` (role="img", localized `aria-label`): the sky and two cloud layers. It sits inside the existing masked media box, behind the white copy glow.
  - `div.suitcase-image.ctr-bags` > `div.ctr-bagframe`: the still frame `img.ctr-bag-poster` plus `video.ctr-intro` and `video.ctr-rest`. It uses the same box but has no mask and doesn't clip. Its z-index is 2, so the bags sit in front of the white glow (`.suitcase-hero:before`) and the bottom fade; `.hero-inner` is z-index 3.
- Layer order: sky → white glow → bags → copy.
- Bags show at 75% scale and are shifted right on desktop (`--ctr-bag-scale`, `--ctr-bag-x` in `ctr-hero.css`).
- `ctr-hero.js` sizes `.ctr-bagframe` as a 16:9 cover box over the media box.
- Head: `ctr-hero.css` is linked after `suitcase-profile-hero.css`, with preloads for `sky-base.jpg` and `bag-poster.webp`.
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
