// Dataset descriptions are reader-facing copy, not removable production notes.
// Wording is retained from CTR 27 - MASTER FILE, Global Signals.
export function restoreDatasetLabels(page){
 const titles={
  'experiences-room':'The top-ranked in-room touches',
  'regional-growth':'Year-on-year growth in social media as the first research stop',
  'regional-influence':'Social media creators as shapers of destination choice',
  'challengers-destinations':'2027’s dream destinations',
  'challengers-cities':'The destinations climbing the city list fastest'
 };
 return page.replace(/<section class="sb-card ib-card[^>]*>[\s\S]*?<\/section>/g,card=>{
  const id=card.match(/\bid="([^"]+)"/)?.[1];
  const label=text=>`<p class="ib-dataset-title">${text}</p>`;
  if(titles[id]){
   card=card.replace(/(<div class="ib-preview[^\"]*">)/,'$1'+label(titles[id]));
   card=card.replace('<div class="ib-chart">','<div class="ib-chart">'+label(titles[id]));
   // Promote the existing full label instead of repeating it as a footnote.
   if(id==='regional-influence')card=card.replace('<p class="sb-chart-note">Social media creators as shapers of destination choice</p>','');
  }
  if(id==='regional-discovery')card=card.replace('<div class="ib-chart">','<div class="ib-chart">'+label('First research stop'));
  if(id==='experiences-nostalgia')card=card
   .replace('<div class="ib-overview-metric"><span>A memorable moment</span>','<div class="ib-overview-metric"><span>Reason to return to a hotel</span><small class="ib-memory-caption">A memorable moment</small>')
   .replace('<small>Reason to return</small>','')
   .replace(/a memorable moment\.<\/p>/g,'<span class="ib-memory-emphasis">a memorable moment.</span></p>')
   .replace('<div class="ib-chart">','<div class="ib-chart">'+label('Reason to return to a hotel<span class="ib-memory-caption">A memorable moment</span>'));
  if(id==='experiences-memories')card=card.replace('<div class="ib-preview">','<div class="ib-preview">'+label('Reason to choose a hotel chain')).replace('<div class="ib-chart">','<div class="ib-chart">'+label('Reason to choose a hotel chain'));
  return card;
 });
}
