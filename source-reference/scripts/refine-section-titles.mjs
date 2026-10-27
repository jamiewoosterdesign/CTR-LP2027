export function refineSectionTitles(page){
 page=page.replace(/(<header class="sb-section-title">)<p>[A-Z ]+<\/p>/g,'$1');
 page=page.replace(/<header class="[^"]*gh-photo-hero[^\"]*">[\s\S]*?<\/header>/g,hero=>hero.replace(/(<p class="sb-index">STORY \d{2})[^<]*(<\/p>)/,'$1$2').replace(/(<\/h2>)<p>[\s\S]*?<\/p>/,'$1'));
 page=page.replace('<h2>Solo on<br>the <em>rise.</em></h2>','<h2>Travellers are<br>riding <em>solo.</em></h2>');
 page=page.replace(/(<a href="#story-solo">)[\s\S]*?(<\/a>)/g,'$101 Travellers are riding solo$2');
 page=page.replaceAll('<h3>Plan to travel solo</h3>','<h3>The fastest-growing segment</h3>');
 page=page.replaceAll('<h3>Asia rises in the top 5</h3>','<h3>Asia: now the origin and destination</h3>');
 page=page.replace(/(<a href="#story-[^"]+">)0[1-4]\s+/g,'$1');
 page=page.replaceAll('<h3>Where it’s growing the fastest</h3>','<h3>Where it’s taking off</h3>').replaceAll('<h3>Where it’s taking off</h3>','<h3>Where it’s taking off</h3>');
 page=page.replace(/<section class="sb-card ib-card ib-card-2"[^>]*>[\s\S]*?<\/section>/,card=>card.replace(/<p class="sb-insight">[\s\S]*?<\/p>/,'<p class="sb-insight">American travellers increased their solo-travel share by nearly 10 percentage points this year, and Italian travellers leapt from one of the lowest rates in the study to almost 15%.</p>'));
 page=page.replace(/(<p class="sb-index">)STORY (0[1-4])(<\/p>)/g,'$1SHIFT $2$3');
 return page;
}
