export function refineReportNavigation(page){
 page=page.replace('<header class="report-nav">','<header class="report-nav desktop-persistent">');
 page=page.replace('<p class="kicker">Changing Traveller Report 2027</p>','<p class="kicker hero-mobile-kicker">Changing Traveller Report 2027</p><p class="hero-report-badge"><span>SiteMinder’s Changing Traveller Report</span><span class="hero-report-year">2027</span></p>');
 page=page.replaceAll('>Global headlines <','>Global Signals <').replaceAll('>Global headlines<','>Global Signals<').replaceAll('>AI &amp; trust<','>AI &amp; Trust<');

 page=page.replace('<a href="#global-headlines">Global Signals</a><a href="#ai-trust">AI &amp; Trust</a><a href="#generations">Generations</a><a href="#traveller-profiles">Traveller profiles</a>', '<a href="#global-headlines">Global Signals</a><a href="#ai-trust">AI &amp; Trust</a><a href="#generations">Generation Gaps</a><a href="#traveller-profiles">Traveller Profiles</a>');
 page=page.replace(/(<a class="report-cta"[^>]*>)Hotelier’s Playbook[\s\S]*?<\/a>/,'$1Hotelier’s Playbook</a>');
 page=page.replace('<h1 id="report-hero-title">The world travels <em>differently.</em></h1>','<h1 id="report-hero-title">The world is<br> travelling <em>differently.</em></h1>');
 page=page.replace(/(<div class="micro">)The world’s largest accommodation-specific traveller study[^<]*(<\/div>)/,'$1The world’s largest accommodation-specific consumer survey$2');
 const start=page.indexOf('<section id="generations" class="gen-section">');
 if(start<0)throw Error('Missing generations');
 const re=/<\/?section\b[^>]*>/g;re.lastIndex=start;let depth=0,end=0,m;
 while((m=re.exec(page))){depth+=m[0].startsWith('</')?-1:1;if(!depth){end=re.lastIndex;break;}}
 if(!end)throw Error('Unclosed generations');
 let generations=page.slice(start,end).replace('class="gen-section"','class="gen-section gen-tabbed"');
 generations=generations.replace(/<aside class="sb-nav"[\s\S]*?<\/aside>/,'');
 const tabs='<div class="gen-tabs" role="group" aria-label="Choose a generation">'+[['gen-z','Gen Z'],['millennials','Millennials'],['gen-x','Gen X'],['baby-boomers','Boomers']].map(([id,name],i)=>`<button type="button" data-generation="generation-${id}" aria-controls="generation-${id}" aria-pressed="${i===0}">${name}</button>`).join('')+'</div>';
 generations=generations.replace(/(<header class="sb-section-title">[\s\S]*?<\/header>)/,'<div class="gen-section-heading">$1'+tabs+'</div>');
 page=page.slice(0,start)+page.slice(end);
 if(!page.includes('<section class="hero globe-light-hero profile-globe"'))throw Error('Missing traveller profiles');
 page=page.replace('<section class="hero globe-light-hero profile-globe"',generations+'<section class="hero globe-light-hero profile-globe"');
 page=page.replace('<a href="#traveller-profiles">Traveller Profiles</a></nav>','<a href="#traveller-profiles">Traveller Profiles</a><a class="report-mobile-playbook" href="#playbook">Hotelier’s Playbook</a></nav>');
 return page.replace('</head>','<link rel="stylesheet" href="/assets/report-navigation-update.css"></head>');
}
