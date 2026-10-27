export function buildSuitcaseHero(page){
 const start=page.indexOf('<section class="hero globe-light-hero"');
 const end=page.indexOf('</section>',start)+10;
 const old=page.slice(start,end);
 const copy=old.slice(old.indexOf('<div class="copy">'),old.indexOf('<div class="system"'));
 const hero=`<section class="hero globe-light-hero suitcase-hero" id="report-top" aria-labelledby="report-hero-title"><picture class="suitcase-poster"><source media="(max-width:900px)" srcset="/assets/hero-morph-v2-mobile-poster.webp"><img class="suitcase-image" src="/assets/hero-morph-v2-desktop-poster.webp" alt="Silver suitcase floating against a blue sky" fetchpriority="high"></picture><video class="suitcase-image suitcase-video" data-desktop="/assets/hero-morph-v2-desktop.mp4" data-mobile="/assets/hero-morph-v2-mobile.mp4" data-fallback-desktop="/assets/hero-fallback-desktop.mp4" data-fallback-mobile="/assets/hero-fallback-mobile.mp4" autoplay muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video><div class="hero-inner">${copy.replace('<h1>','<h1 id="report-hero-title">')}</div></section>`;
 let globe=old.replace('id="report-top"','id="traveller-profiles"').replace('hero globe-light-hero','hero globe-light-hero profile-globe');
 const intro=`<div class="copy"><p class="kicker">Traveller profiles</p><h2>Explore the travellers <br>behind the trends.</h2><p class="lead">Get to know the priorities, booking habits and stay expectations of travellers from each market.</p><p class="profile-globe-instruction">Select a country on the globe to explore its traveller profile.</p><a class="profile-globe-start" href="#australia-overview">Explore the Australian traveller</a></div>`;
 globe=globe.replace(copy,intro).replace(/<a class="global-link[^>]*>[\s\S]*?<\/a>/,'').replace(/<div class="micro micro-mobile">[\s\S]*?<\/div>/,'').replace(/<a class="globe-scroll-hint"[\s\S]*?<\/a>/,'').replace('Interactive world of traveller signals','Explore traveller profiles by country').replace('Or simply scroll to explore.','Choose a market to view its profile.');
 page=page.slice(0,start)+hero+page.slice(end);
 page=page.replace('id="traveller-profiles" aria-labelledby="profile-title"','id="australia-profile" aria-labelledby="profile-title"');
 page=page.replace('<div class="side-layout profile-layout">',globe+'<div class="side-layout profile-layout">');
 return page.replace('</body>','<script src="/assets/suitcase-hero-video.js" defer></script></body>').replace(/^[ \t]+$/gm,'').replace('/assets/world-signals.js','/assets/profile-world-signals.js').replace('</head>','<link rel="stylesheet" href="/assets/suitcase-profile-hero.css"></head>');
}
