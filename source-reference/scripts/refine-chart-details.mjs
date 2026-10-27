export function refineChartDetails(page){
 page=page.replace(/<dl class="sb-market-list">[\s\S]*?<\/dl>/g,list=>list.replace(/<dt>([\s\S]*?)<\/dt><dd>([\s\S]*?)<\/dd>/g,'<dt>$2</dt><dd>$1</dd>'));

 page=page.replace(/<section class="sb-card ib-card ib-card-3"[^>]*>[\s\S]*?<\/section>/,card=>card
  .replaceAll('CHOOSES A STANDARD ROOM','Chooses a standard room')
  .replaceAll('WON’T PAY FOR EXTRAS','Won’t pay for extras')
  .replaceAll('BOOKS LAST-MINUTE','Books last-minute')
  .replace('<b>Solo 19.2%</b>','<b>solo travellers</b>')
  .replace('<b>Solo 7.5%</b>','<b>solo travellers</b>'));

 // Centre each radial marker on the 140-unit arc, with equal overhang.
 const radial=(percent)=>{const angle=Math.PI*(1-percent/100);return [118,162].map((r,i)=>`${i?'L':'M'}${(180+r*Math.cos(angle)).toFixed(2)} ${(185-r*Math.sin(angle)).toFixed(2)}`).join(' ')};
 page=page.replace(/d="M273 106 L312 73"/g,`d="${radial(77.5)}"`)
 .replace(/d="M151 27l8 48"/g,`class="chart-benchmark-marker" d="${radial(43.3)}"`)
 .replace(/class="([^"<>]*\bbadge[^"<>]*)"(>\s*[−-]\d)/g,'class="$1 is-negative-badge"$2');
 page=page.replace(/<section class="sb-card ib-card ib-lead" id="solo-detail-lead">[\s\S]*?<\/section>/,card=>{
 if(card.includes('ib-stat-badge'))return card;
 const badge=card.match(/<span class="sb-badge">[^<]*<\/span>/)?.[0];if(!badge)throw Error('Missing lead badge');
 card=card.replace('<span class="ib-topline">'+badge+'</span>','');
 const pill=badge.replace('sb-badge','sb-badge ib-stat-badge').replace('+2.3 pts','+2.3pp');
 card=card.replace('<div class="ib-current"><span>2027</span>','<div class="ib-current">'+pill);
 card=card.replace(/(<div class="sb-lead-current"><span>2027<\/span><strong>[^<]*<\/strong>)/,'$1'+pill);
 return card.replace(/<p class="sb-source">[\s\S]*?<\/p>/,'')
 .replaceAll('little change, solo trips are','little change, <span class="ib-solo-emphasis">solo trips</span> are')
 .replace('<strong>16.1%</strong></div></div>','<strong>16.1%</strong><small class="ib-solo-caption">Solo trips</small></div></div>');
 });

 page=page.replace(/<section class="sb-card ib-card ib-more-card ib-nostalgia[^>]*>[\s\S]*?<\/section>/,card=>{
 const badge='<span class="sb-badge ib-stat-badge">+2.4pp</span>';
 return card.replace('<span class="ib-topline"><span class="sb-badge">+2.4pp</span></span>','')
 .replace('<strong>39.1%</strong><small>','<div class="ib-metric-value"><strong>39.1%</strong>'+badge+'</div><small>')
 .replace('<span>2027</span><strong>39.1%</strong>','<span>2027</span><strong>39.1%</strong>'+badge);
 });
 page=page.replace(/(<div class="sr-donut sr-half-gauge"[^>]*>)/g,'$1<span class="sb-badge ib-pay-badge">+2.8pp</span>');
 return page;
}
