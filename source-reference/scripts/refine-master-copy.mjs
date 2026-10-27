// Retain approved abbreviated headings and design copy; reconcile meaning with the master.
export function refineMasterCopy(page){
 const replacements=[
 ['Memories trump points at chains','Memories trump rewards at chains'],
 ['happier to skip the upgrade','happy to skip the upgrade'],
 ['Across most of Asia, social content creators are clearly overtaking','Across most of Asia, social content creators are overtaking'],
 ['While the global figure is holding flat, these three Asian markets are posting the sharpest gains.','While the global figure is holding flat, the markets posting the sharpest gains are contained within the region that leapfrogged straight to mobile.'],
 ['Japan extends its lead as the world’s dream destination for a second year, while South Korea has now caught up to France, and China to the USA.','Asia’s role now spans both the world’s largest outbound region and its dreamiest destination. Japan has retained the top spot for a second consecutive year, while South Korea has drawn level with France and China with the US.'],
 ['their bigger neighbours','their more renowned neighbours'],
 ['giving known destinations a miss','giving capital cities a miss'],
 ['keeps growing: Spa services','keeps growing: spa services']
 ];
 replacements.forEach(([from,to])=>{page=page.replaceAll(from,to);});
 const ages=[['Gen Z','2,227'],['Millennials','4,478'],['Gen X','3,046'],['Baby Boomers','2,167'],['Radio Babies','111']];
 const markets=[['Australia',854],['Canada',862],['China',868],['France',869],['Germany',866],['India',863],['Indonesia',848],['Italy',864],['Mexico',863],['Singapore',844],['Spain',870],['Thailand',869],['UK',855],['USA',834]];
 const list=items=>`<dl>${items.map(([name,count])=>`<div><dt>${name}</dt><dd>${count}</dd></div>`).join('')}</dl>`;
 const methodology=`<section class="report-methodology" aria-labelledby="methodology-title"><h2 id="methodology-title">Methodology</h2><div class="methodology-summary"><p><span>Survey period</span>5–25 August 2026</p><p><span>Total responses</span>12,029</p><p><span>Countries</span>14</p><p><span>Powered by</span>Kantar Group</p></div><details><summary>View respondent breakdown<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="methodology-details"><div><h3>Age demographics</h3>${list(ages)}</div><div><h3>Countries</h3>${list(markets)}</div></div></details></section>`;
 return page.replace('<footer class="sb-footer">',methodology+'<footer class="sb-footer">').replace('</head>','<link rel="stylesheet" href="/assets/report-methodology.css"></head>');
}
