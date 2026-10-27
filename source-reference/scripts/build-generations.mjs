const groups=[
['gen-z','Gen Z','generation-gen-z-portrait.webp','center',[
['The most enthusiastic traveller','60%','report a stronger desire to travel next year.','dots',60],
['Review-driven','#1','Guest reviews and ratings are their #1 property-choice factor.','stars',100],
['Willing to spend on extras','94%','Only 6% skip paying for any add-on or on-site experience.','bar',94],
['Cautious','71%','have walked away from an online booking over a trust concern.','gauge',71]]],
['millennials','Millennials','generation-millennials-portrait.webp','center',[
['The most<br>internationally-<br>minded','77%','are planning a trip abroad in 2027.','dots',77],
['High-end','38%','The least likely to pick a Standard Room and the most likely to pick a boutique/luxury hotel (15%).','bar',38],
['Loyalty-driven','26%','would return to a hotel because of its loyalty program.','gauge',26],
['AI-curious','17%','are open to letting AI handle most or all of their trip planning.','bar',17]]],
['gen-x','Gen X','generation-gen-x-portrait.webp','center',[
['The most OTA-<br>native','30%','start accommodation research on a booking site or app.','dots',30],
['Drawn to groups and chains','23%','pick a well-known group or chain hotel as their preferred accommodation.','gauge',23],
['Price-driven','57%','name price comparison as their top reason to book via an OTA, and 72.5% cite competitive pricing as a reason to pick a chain.','bar',57],
['Caffeine-dependent','47%','say a premium coffee or tea station would elevate their stay.','bar',47]]],
['baby-boomers','Baby Boomers','generation-baby-boomers.png','right',[
['The most<br>trusting','75%','have never abandoned a booking over a trust concern.','dots',75],
['Likely to skip paid extras','47%','skip every on-site experience, while 30% avoid paid add-ons.','bar',47],
['Influenced by people','86%','Friends and family shape destination choices.','bar',86],
['Location-driven','75%','Location influences property choice.','gauge',75]]]
];
function graphic(type,value){
 if(type==='dots')return `<div class="gen-dots" aria-hidden="true">${Array.from({length:100},(_,i)=>`<i${((9-Math.floor(i/10))*10+i%10)<value?' class="filled"':''}></i>`).join('')}</div>`;
 if(type==='bubble')return '';
 if(type==='stars')return '<div class="gen-stars" aria-hidden="true">★★★★★</div>';
 if(type==='bar')return `<div class="gen-bar" aria-hidden="true"><i style="width:${value}%"></i></div>`;
 return `<svg class="gen-gauge" viewBox="0 0 200 105" aria-hidden="true"><path d="M 12 94 A 82 82 0 0 1 188 94" pathLength="100"/><path class="gen-gauge-fill" d="M 12 94 A 82 82 0 0 1 188 94" pathLength="100" stroke-dasharray="${value} 100"/></svg>`;
}
function metric(group,m,i){const [title,stat,copy,type,value]=m,id=`gen-${group}-${i}`;const label=group==='gen-z'&&i===2?'Willing to pay for extras':'';const body=`<div class="gen-visual gen-${type}">${graphic(type,value)}<strong class="gen-stat" data-count-final="${stat}">${stat}</strong>${label?`<span class="gen-stat-label">${label}</span>`:''}</div><p class="gen-copy">${copy}</p>`;return `<section class="sb-card ib-card gen-metric ${i===0?'gen-lead':''}"><div class="ib-heading"><h3>${title}</h3></div><div class="ib-preview">${body}</div></section>`;}
function generation(g){const [id,name,img,pos,metrics]=g;return `<article class="sb-story gen-story" id="generation-${id}" aria-label="${name}"><div class="ib-grid gen-grid"><div class="ib-row gen-top" data-bento-static><section class="sb-card ib-card gen-portrait"><img src="/assets/${img}" alt="" loading="lazy" style="object-position:${pos} center"><div class="ib-heading"><h3>${name}</h3></div></section>${metric(id,metrics[0],0)}</div><div class="ib-row gen-bottom" data-bento-static>${metrics.slice(1).map((m,i)=>metric(id,m,i+1)).join('')}</div></div></article>`;}
export function buildGenerations(page){
 if(page.includes('id="generations" class="gen-section"'))return page;
 const section=`<section id="generations" class="gen-section"><div class="sb-layout"><aside class="sb-nav" aria-label="Generations"><button class="sb-nav-toggle" aria-expanded="false" aria-controls="generation-menu"><span class="gen-nav-label">GENERATION</span><strong class="gen-nav-current">Gen Z</strong><svg class="sb-menu-chevron" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><nav id="generation-menu">${groups.map(g=>`<a href="#generation-${g[0]}">${g[1]}</a>`).join('')}</nav></aside><section class="sb-content"><header class="sb-section-title"><p>THE GENERATIONAL PERSPECTIVE</p><h2>Generation Gaps</h2><p>Four generations. Four travel mindsets.</p></header>${groups.map(generation).join('')}</section></div></section>`;
 return page.replace('<section class="hero globe-light-hero profile-globe',section+'<section class="hero globe-light-hero profile-globe').replaceAll('href="/concept-globe-light/#generations"','href="#generations"').replace('</head>','<link rel="stylesheet" href="/assets/generations.css"></head>').replace('</body>','<script src="/assets/generations.js" defer></script></body>');
}
