export function buildHeadlineImages(page) {
  const photos = [
    ['experiences', 'An Indian traveller in sunglasses enjoying the sunshine'],
    ['scroll', 'A traveller with his phone and backpack under a clear sky'],
    ['solo', 'A solo traveller looking up into a clear blue sky'],
    ['challengers', 'A Black traveller looking ahead with his backpack'],
  ];
  let index = 0;
  page = page.replace(/<header class="sb-story-hero[^\"]*">[\s\S]*?<\/header>/g, header => {
    const [key, alt] = photos[index];
    const mirrored = index < 2;
    const reversed = index++ % 2 === 1;
    return header.replace(/class="sb-story-hero[^\"]*"/, `class="sb-story-hero sb-photo-hero gh-photo-hero${reversed ? ' gh-photo-reverse' : ''}${mirrored ? ' gh-photo-mirrored' : ''}"`)
      .replace('SOLO ONTHE RISE.', 'SOLO ON THE RISE.').replace('EXPERIENCES ARETAKING', 'EXPERIENCES ARE TAKING').replace('THE SCROLL ISGOING', 'THE SCROLL IS GOING').replace('THE CHALLENGERSARE', 'THE CHALLENGERS ARE')
      .replace(/<img class="sb-hero-photo"[^>]*>/, '')
      .replace(/^(<header[^>]*>)/, `$1<img class="sb-hero-photo" src="/assets/headline-${key}.png" alt="${alt}" loading="lazy" decoding="async" width="1902" height="827">`);
  });
  if (index !== 4) throw new Error(`Expected four headline heroes, received ${index}`);
  if (!page.includes('/assets/headline-images.css')) page = page.replace('</head>', '<link rel="stylesheet" href="/assets/headline-images.css"></head>');
  return page;
}
