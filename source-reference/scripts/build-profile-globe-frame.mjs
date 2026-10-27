export function buildProfileGlobeFrame(page){
 const start=page.indexOf('<section class="hero globe-light-hero profile-globe"'),end=page.indexOf('</section>',start)+10;
 if(start<0)throw Error('Profile globe missing');
 let section=page.slice(start,end).replace('id="globe" tabindex="0"','id="globe"').replace('Drag to rotate, or use arrow keys.', 'Drag to rotate.');
 section=section.replace(/<div class="copy">[\s\S]*?<\/div><div class="system"/,`<div class="copy"><p class="kicker">2027</p><h2>Traveller Profiles</h2><p class="lead">Essential insights to understand and attract key source markets</p></div><div class="system"`);
 const help=section.match(/<div class="globe-help">[\s\S]*?<\/div>/)?.[0];
 if(!help)throw Error('Globe help missing');
 section=section.replace(help,'').replace(/^[ \t]+$/gm,'');
 const icon='<svg class="globe-rotate-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17c2-7 20-7 22 0M5 17l-.5-5M5 17l5-1M27 17l.5-5M27 17l-5-1"/><path d="M8 22c4 2.5 12 2.5 16 0" opacity=".5"/></svg>';
 const updated=help.replace('<span class="globe-bulb" aria-hidden="true"></span>',icon).replace('aria-label="How to explore"','aria-label="Drag to rotate the globe"').replace('Drag the globe or select a country.<br>Choose a market to view its profile.','Drag to rotate. Select a country to explore its traveller profile.');
 section=section.replace('<div class="globe-stage">',updated+'<div class="globe-stage">');
 page=page.slice(0,start)+section+page.slice(end);
 return page.replace('</body>','<script src="/assets/profile-globe-frame.js" defer></script></body>').replace('</head>','<link rel="stylesheet" href="/assets/profile-globe-frame.css"></head>');
}
