const cities=[['Perth','au','Australia',75,48],['Ho Chi Minh City','vn','Vietnam',82,55],['Chengdu','cn','China',105,78],['Frankfurt','de','Germany',98,72],['Gold Coast','au','Australia',107,81]];
export function refineChallengerCards(page){
 return page.replace(/<section class="sb-card ib-card[^>]*id="challengers-[^"]+"[^>]*>[\s\S]*?<\/section>/g,card=>{
  const id=card.match(/id="([^"]+)"/)[1];
  const city=id==='challengers-cities';
  if(city){
   const chart='<p class="ib-dataset-title">Top city destinations</p><div class="ib-city-ranks">'+cities.map(([name,code,country,previous,current])=>`<div class="ib-city-rank-card"><h4>${name}<img src="/assets/flag-${code}.svg" alt="${country}" width="24" height="18"></h4><span class="ib-city-rank-year">2027 rank</span><strong class="ib-city-current-rank">#${current}</strong><div class="ib-city-climb"><img src="/assets/arrow-up.svg" alt="" width="16" height="16"><b>${previous-current}</b><span>places climbed</span></div><p class="ib-city-previous">2026 rank <b>#${previous}</b></p></div>`).join('')+'</div>';
   const copy='The same pattern holds at the city level: travellers already sold on a country are giving capital cities a miss for locations less travelled.';
   card=card.replace(/<div class="ib-full"[\s\S]*?<\/section>$/,`<div class="ib-full" id="challengers-cities-panel" aria-hidden="true"><div class="ib-chart">${chart}</div><p class="sb-insight">${copy}</p></div></section>`);
   card=card.replace('<strong>+27</strong><small>places climbed</small>','<strong>#48</strong><small>2027 rank</small>');
   card=card.replace('The destinations climbing the city list fastest','Top city destinations');
  }else{
   card=card.replace('</h3></button>','</h3><span class="ib-expanded-key">Year-on-year change in<br>destination preference</span></button>');
   card=card.replace(/<small class="sb-chart-note">[\s\S]*?<\/small>/g,'');
   if(id==='challengers-destinations')card=card.replace('<div class="ib-chart"><p class="ib-dataset-title">2027’s dream destinations</p>','<div class="ib-chart">');
   if(id==='challengers-neighbours')card=card.replace('their bigger neighbours','their more renowned neighbours');
  }
  return card;
 });
}
