import {buildPlaybookSection} from './build-playbook-section.mjs';
import {refineChallengerCards} from './refine-challenger-cards.mjs';
import {refineReportNavigation} from './refine-report-navigation.mjs';
import {restoreDatasetLabels} from './restore-dataset-labels.mjs';
import {refineChartDetails} from './refine-chart-details.mjs';
import {refineSectionTitles} from './refine-section-titles.mjs';
import {refineMasterCopy} from './refine-master-copy.mjs';
import {optimizeReportImages} from './optimize-report-images.mjs';
import {buildCountryProfiles} from './build-country-profiles.mjs';
import {buildAustraliaProfile} from './build-australia-profile.mjs';
import {buildGenerations} from './build-generations.mjs';
import {buildProfileGlobeFrame} from './build-profile-globe-frame.mjs';
import {buildHeadlineImages} from './build-headline-images.mjs';
import {buildAILongform} from './build-ai-longform.mjs';
import {buildSuitcaseHero} from './build-suitcase-hero.mjs';
import { buildRemainingBentos } from './build-remaining-bentos.mjs';
import { refineInteractiveStories } from './refine-interactive-stories.mjs';
import fs from 'node:fs';
let page=fs.readFileSync('scripts/templates/traveller-stories-base.html','utf8');
const start=page.indexOf('<article class="sb-story" id="story-solo">'),end=page.indexOf('<article class="sb-story" id="story-experiences">');
let solo=page.slice(start,end);
const cards=[...solo.matchAll(/<section class="sb-card (?!sb-full sb-lead-card)[^"]*">[\s\S]*?<\/section>/g)];
if(cards.length!==4)throw Error('Expected four supporting cards');
const chevron='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
const previews=[
 html=>`<div class="ib-preview-bubble">${html.match(/<div class="bubble-x">[\s\S]*?<\/div>/)[0]}</div>`,
 html=>`<div class="sb-dot-chart">${html.slice(html.indexOf('<div class="sb-dot-series">'),html.indexOf('<div class="sb-dot-series">',html.indexOf('<div class="sb-dot-series">')+1))}</div>`,
 html=>`<div class="sb-market-bars">${html.slice(html.indexOf('<div class="sb-bullet">'),html.indexOf('<div class="sb-bullet">',html.indexOf('<div class="sb-bullet">')+1))}</div>`,
 html=>`<div class="sb-spend">${html.match(/<div class="sb-gauge">[\s\S]*?<\/div>/)[0]}</div>`
];
const leading=['+3.1pp','+2.9pp','23.6%','55%'];
const newCards=cards.map((m,i)=>{const html=m[0],title=html.match(/<h3>([\s\S]*?)<\/h3>/)[1].replaceAll('<br>',' '),content=html.slice(html.indexOf('</h3>')+5,-10),copy=content.match(/<p class="sb-insight">([\s\S]*?)<\/p>$/)[1],chart=content.replace(/<p class="sb-insight">[\s\S]*?<\/p>$/,'').replace(/<text[^>]*>43\.3% global<\/text>/g,'').replace('</svg><strong>55%</strong>','</svg><span class="ib-gauge-benchmark">43.3% global</span><strong>55%</strong>');const paragraph=`<p class="sb-insight">${i===0?copy.replace('passage. ', 'passage.<br>'):copy}</p>`,detail=`<div class="ib-chart">${chart}</div>${paragraph}`;return `<section class="sb-card ib-card ib-card-${i}" id="solo-detail-${i}"><button class="ib-heading" aria-expanded="false" aria-controls="solo-panel-${i}"><span class="ib-topline"></span><h3>${title}</h3></button><span class="ib-strip-stat">${leading[i]}</span><div class="ib-preview">${previews[i](chart).replaceAll('gauge-blue','preview-gauge-blue')}</div><div class="ib-full" id="solo-panel-${i}" aria-hidden="true">${detail}</div></section>`;});
const lead=solo.match(/<section class="sb-card sb-full sb-lead-card">[\s\S]*?<\/section>/)[0];
const leadTitle=lead.match(/<h3>([\s\S]*?)<\/h3>/)[1];
const leadCopy=lead.match(/<p class="sb-insight">([\s\S]*?)<\/p>/)[1];
const leadBadge=lead.match(/<span class="sb-badge">[\s\S]*?<\/span>/)[0];
const leadDetails=lead.slice(lead.indexOf('<div class="sb-lead-body">'),-10).replace(/<h3>[\s\S]*?<\/h3>/,'');
const leadCard=`<section class="sb-card ib-card ib-lead" id="solo-detail-lead"><button class="ib-heading" aria-expanded="false" aria-controls="solo-panel-lead"><span class="ib-topline">${leadBadge}</span><h3>${leadTitle}</h3></button><div class="ib-preview ib-lead-preview"><p class="sb-insight">${leadCopy}</p><div class="ib-current"><span>2027</span><strong>16.1%</strong></div></div><div class="ib-full" id="solo-panel-lead" aria-hidden="true">${leadDetails}</div></section>`;
solo=solo.replace(lead,'').replace(cards.map(x=>x[0]).join(''),`<div class="ib-grid"><div class="ib-row ib-row-top">${leadCard}${newCards[0]}</div><div class="ib-row ib-row-bottom">${newCards.slice(1).join('')}</div></div>`);
page=page.slice(0,start)+solo+page.slice(end);
page=page.replace('<title>CTR 2027 - Traveller stories</title>','<title>CTR 2027 - Interactive traveller stories</title>').replace('</head>','<link rel="stylesheet" href="/assets/interactive-bento.css"></head>').replace('</body>','<script src="/assets/interactive-bento.js" defer></script></body>');
page=page.replace('Return to globe-light concept','View the static story design').replace('href="/concept-globe-light/">View the static','href="/concept-traveller-stories/">View the static');
page=buildHeadlineImages(buildAILongform(buildSuitcaseHero(buildRemainingBentos(refineInteractiveStories(page)))));
page=buildProfileGlobeFrame(page);
page=page.replace('</head>','<link rel="stylesheet" href="/assets/bento-fit.css"></head>').replace('</body>','<script src="/assets/bento-fit.js" defer></script></body>');
page=buildGenerations(page);
page=buildCountryProfiles(buildAustraliaProfile(page));
page=refineMasterCopy(page);
// Separate the company destination from the report's back-to-top link.
page=page.replace(/<a class="report-brand" href="#report-top">([\s\S]*?)<span class="report-brand-title">([\s\S]*?)<\/span><\/a>/, '<div class="report-brand"><a class="report-logo-link" href="https://www.siteminder.com/" target="_blank" rel="noopener noreferrer" aria-label="SiteMinder website">$1</a><a class="report-brand-title" href="#report-top">$2</a></div>');
page=page.replace('<a href="/concept-traveller-stories/">View the static story design</a>','<a href="https://www.siteminder.com/" target="_blank" rel="noopener noreferrer">Visit SiteMinder</a>');
page=page.replace('</head>','<link rel="stylesheet" href="/assets/report-links.css"></head>');
page=page.replace(/<div class="au-tags">([\s\S]*?)<\/div>/g,(_,content)=>'<div class="au-tags">'+content.replace(/(<i>[\s\S]*?<\/i>)?<span>([\s\S]*?)<\/span>/g,(_,dot,text)=>'<span class="au-tag-item">'+(dot||'')+'<span>'+text+'</span></span>')+'</div>');
page=refineChartDetails(refineSectionTitles(page));
page=refineChallengerCards(restoreDatasetLabels(page));
page=optimizeReportImages(page);
page=page.replace('</head>','<link rel="stylesheet" href="/assets/report-font-minimum.css"><link rel="stylesheet" href="/assets/chart-detail-refinements.css"></head>');
page=page.replace('</body>','<script src="/assets/body-copy-wrap.js" defer></script></body>');
page=refineReportNavigation(page);
page=page.replace('</head>','<link rel="stylesheet" href="/assets/profile-carousel.css"></head>').replace('<script src="/assets/profile-world-signals.js"','<script src="/assets/profile-carousel.js" defer></script><script src="/assets/profile-world-signals.js"');
page=buildPlaybookSection(page);
page=page.replace(/<footer class="sb-footer">[\s\S]*?<\/footer>/,'');
page=page.replace('</head>','<link rel="stylesheet" href="/assets/report-footer.css"></head>').replace('</main>', '</main>'+'<footer class="report-footer"><div class="report-footer-inner"><div class="report-footer-brand"><a class="report-footer-logo" href="https://www.siteminder.com/" target="_blank" rel="noopener noreferrer" aria-label="SiteMinder website"><img src="/assets/siteminder-logo-footer.svg" alt="SiteMinder" width="110" height="27" loading="lazy"></a><a class="report-footer-title" href="#report-top">Changing Traveller Report 2027</a></div><p class="report-footer-copyright">© 2026 SiteMinder</p></div></footer>');
fs.mkdirSync('dist/concept-traveller-stories-interactive',{recursive:true});fs.writeFileSync('dist/concept-traveller-stories-interactive/index.html',page);
