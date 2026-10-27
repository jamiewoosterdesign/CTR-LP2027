/* Convert the remaining approved story cards without rewriting their editorial copy. */
function element(html, marker) {
 const start=html.indexOf(marker);if(start<0)throw Error(`Missing ${marker}`);
 const tag=html.slice(start+1).match(/^\w+/)[0];const tags=new RegExp(`<\/?${tag}\\b[^>]*>`, 'g');tags.lastIndex=start;let depth=0,m;
 while((m=tags.exec(html))){depth+=m[0].startsWith('</')?-1:1;if(!depth)return html.slice(start,tags.lastIndex);}
 throw Error(`Unclosed ${marker}`);
}
const metric=(value,label,detail='')=>`<div class="ib-overview-metric"><span>${label}</span><strong>${value}</strong>${detail?`<small>${detail}</small>`:''}</div>`;
const leadBar=chart=>`<div class="sb-market-bars">${element(chart,'<div class="sb-bullet">').replace(/<small[^>]*>[\s\S]*?<\/small>/g,'')}</div>`;
const neighbourPairs=[['Portugal',.21,'Spain',.06],['Costa Rica',.32,'Mexico',-.45],['Iceland',.35,'Finland',-.07],['Indonesia',.55,'Thailand',-.49]];
const changeCell=(name,value)=>`<div class="ib-change-cell ${value<0?'is-negative':'is-positive'}" style="--tint:${.08+Math.abs(value)/.55*.16}"><span>${name}</span><strong>${value>0?'+':'−'}${Math.abs(value).toFixed(2)}<small>pp</small></strong></div>`;
const neighbourMatrix=()=>`<div class="ib-change-matrix"><div class="ib-matrix-heading"><span>Challenger</span><span>Neighbour</span></div>${neighbourPairs.map(([a,v,b,w])=>`<div class="ib-change-pair">${changeCell(a,v)}${changeCell(b,w)}</div>`).join('')}</div><small class="sb-chart-note">Year-on-year change in destination preference · + gain / − decline.</small>`;
const previewFns={
 experiences:[
  ()=>metric('39.1%','A memorable moment','Reason to return'),
  leadBar,
  chart=>`<div class="ib-pay-preview"><p class="ib-pay-preview-label">Would pay extra for at least <span class="sr-pay-label-tail">one on-site experience</span></p>${element(chart,'<div class="sr-donut sr-half-gauge"').replaceAll('pay-gradient','pay-preview-gradient')}</div>`,
  ()=>`<div class="ib-room-preview"><strong>A big-screen<br>& streaming</strong><span>US / Australia</span></div>`
 ],
 regional:[
  ()=>metric('9.4%','First research stop','Social media'),
  leadBar,
  ()=>`<div class="ib-influence-preview"><strong>74.8<small>%</small></strong><b>Thailand</b></div>`
 ],
 challengers:[
  chart=>`<div class="ib-destination-preview"><div class="ib-rank-summary"><strong>#1</strong><b>Japan</b><span class="sb-badge">+1.8pp</span></div><div class="ib-rank-plot">${element(chart,'<div class="sb-lollipop-plot">')}</div></div>`,
  ()=>`<div class="ib-neighbour-preview"><div><span>Indonesia</span><strong>+0.55<small>pp</small></strong><i style="--length:100%"></i></div><div class="is-negative"><span>Thailand</span><strong>−0.49<small>pp</small></strong><i style="--length:89%"></i></div><small>Change in destination preference</small></div>`,
  ()=>`<div class="ib-city-preview"><span>Perth<img src="/assets/flag-au.svg" alt="Australia" width="24" height="18"></span><strong>+27</strong><small>places climbed</small></div>`
 ]
};
const types={experiences:['nostalgia','memories','pay','room'],regional:['discovery','growth','influence'],challengers:['destinations','neighbours','cities']};
export function buildRemainingBentos(page){
 for(const story of Object.keys(types)){
  const article=element(page,`<article class="sb-story" id="story-${story}">`);
  const oldGrid=element(article,'<div class="sb-grid">');
  const cards=[...oldGrid.matchAll(/<section class="sb-card[^\"]*">[\s\S]*?<\/section>/g)].map(m=>m[0]);
  if(cards.length!==types[story].length)throw Error(`Wrong card count in ${story}`);
  const built=cards.map((html,i)=>{
   const title=html.match(/<h3>([\s\S]*?)<\/h3>/)[1].replaceAll('<br>',' ');
   const copy=html.match(/<p class="sb-insight">([\s\S]*?)<\/p>/)[1].replace(/<br\s*\/?>/g,' ');
   let chart;
   if(story==='experiences'&&i===0)chart=element(html,'<div class="sb-lead-values">');
   else if(story==='regional'&&i===0)chart=element(html,'<div class="sb-channel-pair">');
   else {const from=html.indexOf('</h3>')+5;chart=html.slice(from,html.indexOf('<p class="sb-insight">',from));}
   if(story==='challengers'&&i===1)chart=neighbourMatrix();
   const badge=story==='experiences'&&i===0?html.match(/<span class="sb-badge">[\s\S]*?<\/span>/)[0]:'';
   const id=`${story}-${types[story][i]}`;
   const summary=i===0&&(story==='experiences'||story==='regional');
   return `<section class="sb-card ib-card ib-more-card ib-${types[story][i]}${badge?' ib-metric-lead':''}" id="${id}"><button class="ib-heading" aria-expanded="false" aria-controls="${id}-panel"><span class="ib-topline">${badge}</span><h3>${title}</h3></button><div class="ib-preview${summary?' ib-story-summary':''}">${summary?`<p class="sb-insight">${copy}</p>`:''}${previewFns[story][i](chart)}</div><div class="ib-full" id="${id}-panel" aria-hidden="true"><div class="ib-chart">${chart}</div><p class="sb-insight">${copy}</p></div></section>`;
  });
  const rows=built.length===4?[built.slice(0,2),built.slice(2)]:[built];
  const grid=`<div class="sb-grid"><div class="ib-grid ib-more-grid ${built.length===3?'ib-single-row':''}">${rows.map(row=>`<div class="ib-row ${row.length===3?'ib-row-three':'ib-row-top'}">${row.join('')}</div>`).join('')}</div></div>`;
  page=page.replace(article,article.replace(oldGrid,grid));
 }
 return page.replace('</head>','<link rel="stylesheet" href="/assets/remaining-bentos.css"></head>');
}
