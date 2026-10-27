import fs from 'node:fs';
export function refineInteractiveStories(page) {
 page=page.replace('Social media as first research stop · scale 0 to 25%.','scale 0 to 25%.');
 const replaceChart=(title,chart)=>{
  const at=page.indexOf(`<h3>${title}</h3>`);
  if(at<0)throw Error(`Missing card: ${title}`);
  const from=at+`<h3>${title}</h3>`.length,to=page.indexOf('<p class="sb-insight">',from);
  page=page.slice(0,from)+chart+page.slice(to);
 };
 replaceChart('Willing to pay for more',`<div class="sr-pay-chart"><div class="sr-donut sr-half-gauge" role="img" aria-label="80.3% would pay extra for at least one on-site experience; 19.7% would not. In 2026, 77.5% would pay extra."><svg viewBox="0 0 360 210" aria-hidden="true"><defs><linearGradient id="pay-gradient"><stop stop-color="#006dff"/><stop offset="1" stop-color="#19cde0"/></linearGradient></defs><path d="M40 185a140 140 0 0 1 280 0" fill="none" stroke="#cce0ff" stroke-width="34"/><path d="M40 185a140 140 0 0 1 280 0" fill="none" stroke="url(#pay-gradient)" stroke-width="34" pathLength="100" stroke-dasharray="80.3 100"/><path class="sr-pay-marker" d="M273 106 L312 73" stroke="#253246" stroke-width="2.5"/></svg><div class="sr-donut-value"><strong>80.3<span>%</span></strong><span>2027</span></div></div><p class="sr-pay-caption">Would pay extra for at least <span class="sr-pay-label-tail">one on-site experience</span></p><div class="sr-pay-key"><span><i></i>2026: 77.5%</span><span><i></i>19.7% would not</span></div></div>`);
 const markets=[['Indonesia',71.8],['China',73.3],['Thailand',74.8]];
 const mobileInfluence=`<div class="sb-bubbles ib-influence-mobile">${markets.map(([name,value],i)=>`<div class="${['bubble-z','bubble-m','bubble-x'][i]}"><strong>${value}<small>%</small></strong><b>${name}</b></div>`).join('')}</div>`;
 replaceChart('Influencers live up to their name',`<div class="sr-influence-chart">${mobileInfluence}<div class="sr-influence-bubbles">${markets.map(([name,value],i)=>`<div class="sr-influence-market"><div class="sr-influence-circle sr-tone-${2-i}" style="--diameter:100%"><strong>${value}<small>%</small></strong><b>${name}</b></div></div>`).join('')}</div><div class="sr-influence-benchmark"><span>Global benchmark</span><strong>52.2<small>%</small></strong></div><p class="sb-chart-note">Social media creators as shapers of destination choice</p></div>`);
 const countries={'Perth':['au','Australia'],'Ho Chi Minh City':['vn','Vietnam'],'Chengdu':['cn','China'],'Frankfurt':['de','Germany'],'Gold Coast':['au','Australia']};
 for(const [city,[code,country]] of Object.entries(countries))page=page.replace(`<div class="sb-city-card"><h4>${city}</h4>`,`<div class="sb-city-card"><h4>${city}<img class="sr-city-flag" src="/assets/flag-${code}.svg" alt="${country}" width="24" height="18"></h4>`);
 const globe=fs.readFileSync('scripts/templates/globe-light-base.html','utf8');
 const start=globe.indexOf('<div class="side-layout profile-layout">'),end=globe.indexOf('<section class="report-coming"',start);
 if(start<0||end<0)throw Error('Missing profile section');
 page=page.replace('<footer class="sb-footer">',globe.slice(start,end)+'<footer class="sb-footer">');
 page=page.replaceAll('href="/concept-globe-light/#traveller-profiles"','href="#traveller-profiles"').replaceAll('href="/concept-globe-light/#profile-overview"','href="#profile-overview"');
 page=page.replace('</head>','<link rel="stylesheet" href="/assets/story-interactive-refinements.css"></head>');
 page=page.replace('</body>','<script src="/assets/globe-light-profile.js" defer></script></body>');
 return page;
}
