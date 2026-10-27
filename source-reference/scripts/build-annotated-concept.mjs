import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from '/tmp/ctr-static-tools/node_modules/linkedom/esm/index.js';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'dist/concept-globe-light/index.html'), 'utf8');
const assets = fs.readFileSync(path.join(root, 'dist/figma-globe-assets/index.html'), 'utf8');
const { document } = parseHTML(source);
const { document: assetDocument } = parseHTML(assets);

document.title = 'Changing Traveller Report 2027 - Annotated design rationale';
document.querySelector('meta[name="description"]')?.setAttribute('content', 'Static annotated desktop concept for the Changing Traveller Report 2027.');
document.body.classList.add('static-annotated');
document.querySelectorAll('script').forEach(node => node.remove());
document.querySelector('.page-switch')?.remove();

const globe = assetDocument.querySelector('.static-globe')?.cloneNode(true);
if (globe) {
  globe.classList.add('hero-static-globe');
  globe.querySelector('#ocean')?.setAttribute('id', 'notes-ocean');
  globe.querySelector('#atmosphere')?.setAttribute('id', 'notes-atmosphere');
  globe.querySelector('#sphere-clip')?.setAttribute('id', 'notes-sphere-clip');
  globe.querySelectorAll('[fill="url(#ocean)"]').forEach(n => n.setAttribute('fill', 'url(#notes-ocean)'));
  globe.querySelectorAll('[fill="url(#atmosphere)"]').forEach(n => n.setAttribute('fill', 'url(#notes-atmosphere)'));
  globe.querySelectorAll('[clip-path="url(#sphere-clip)"]').forEach(n => n.setAttribute('clip-path', 'url(#notes-sphere-clip)'));
  const stage = document.querySelector('.globe-stage');
  stage.innerHTML = '';
  stage.append(globe);
  stage.insertAdjacentHTML('beforeend', `<div class="static-marker marker-au"><span></span>Australia</div><div class="static-marker marker-eu"><span></span>Europe</div><div class="static-marker marker-us"><span></span>United States</div><p class="static-globe-label">14 markets · one global view</p>`);
}

const art = type => {
  if (type === 'discover') return `<svg viewBox="0 0 320 220" role="img" aria-label="Globe and search lens"><defs><radialGradient id="mini-ocean" cx="38%" cy="30%"><stop stop-color="#dff5fb"/><stop offset="1" stop-color="#b8dfec"/></radialGradient></defs><circle cx="145" cy="106" r="72" fill="url(#mini-ocean)" stroke="#0878a5"/><g fill="none" stroke="#0878a5" opacity=".62"><ellipse cx="145" cy="106" rx="34" ry="72"/><ellipse cx="145" cy="106" rx="61" ry="72"/><path d="M73 106h144M82 72h126M82 140h126"/></g><circle cx="198" cy="77" r="37" fill="#fff" fill-opacity=".5" stroke="#199f6a" stroke-width="4"/><path d="m225 104 29 29" stroke="#199f6a" stroke-width="7" stroke-linecap="round"/></svg>`;
  if (type === 'experience') return `<svg viewBox="0 0 320 220" role="img" aria-label="Hotel room with bed, window and bedside lamp"><g fill="#e5f4f8" stroke="#0878a5" stroke-width="2" stroke-linejoin="round"><path d="M48 54h218v132H48z" fill-opacity=".5"/><path d="M72 133h132v46H72z"/><path d="m72 133 27-22h126l-21 22z" fill="#f4fbfd"/><path d="M198 67h48v43h-48z" fill="#f7fcfe"/><path d="M198 88h48M222 67v43"/><path d="M222 139h27v40h-27z"/><path d="M235 96v43"/><path d="m218 97h34l-7 18h-21z" fill="#f4fbfd"/></g><g fill="none" stroke="#199f6a" stroke-width="4"><path d="M48 54h218v132H48z"/><path d="M222 139h27v40h-27zM235 96v43m-17 1h34"/></g></svg>`;
  if (type === 'commit') return `<svg viewBox="0 0 320 220" role="img" aria-label="Calendar with confirmed date"><g fill="#e5f4f8" stroke="#0878a5" stroke-width="2"><rect x="65" y="47" width="190" height="137" rx="15"/><path d="M65 84h190M105 37v25M215 37v25" stroke-width="6" stroke-linecap="round"/><path d="M91 108h27M140 108h27M189 108h27M91 136h27M140 136h27" opacity=".65"/></g><circle cx="215" cy="145" r="28" fill="#effbf5" stroke="#199f6a" stroke-width="3"/><path d="m201 145 10 10 19-22" fill="none" stroke="#199f6a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `<svg viewBox="0 0 320 220" role="img" aria-label="Price tag showing value"><g transform="rotate(-8 160 110)"><path d="M63 67h128l65 48-65 48H63z" fill="#e5f4f8" stroke="#0878a5" stroke-width="3" stroke-linejoin="round"/><circle cx="211" cy="115" r="10" fill="#f7fcfe" stroke="#0878a5" stroke-width="3"/><text x="130" y="132" text-anchor="middle" font-family="Source Sans 3,Arial" font-size="60" font-weight="600" fill="#199f6a">$</text></g><path d="M88 176c52 16 108 9 144-12" fill="none" stroke="#199f6a" stroke-width="4" stroke-linecap="round"/></svg>`;
};

const stories = [
  ['discovery','discover','Every search is a new doorway.',['OTAs','Search','Recommendations'],'Discovery and booking can happen in different places.'],
  ['experience','experience','Make the upgrade worth it.',['The room','The comfort','The details'],'Show the practical value behind a better room.'],
  ['events','commit','An occasion becomes a journey.',['The occasion','The journey','The stay'],'Help guests plan the event and the stay together.'],
  ['purpose','value','A higher price needs a clear purpose.',['The purpose','The conditions','The impact'],'Explain where the contribution goes and what it changes.']
];

for (const [id,type,title,labels,caption] of stories) {
  const story = document.querySelector(`#story-${id}`);
  if (!story) continue;
  story.classList.add('has-explorer');
  const card = story.querySelector('.gh-change');
  const badge = card.querySelector('.gh-delta');
  const delta = badge?.textContent.match(/\d+/)?.[0];
  if (delta) badge.innerHTML = `<span class="delta-plus">+</span><strong>${delta}</strong><span class="delta-percent">%</span>`;
  const panel = document.createElement('section');
  panel.className = 'headline-explorer static-explorer';
  panel.innerHTML = `<div class="hx-top"><span class="hx-label">Explore the hotel opportunity</span></div><h4>${title}</h4><div class="hx-stage"><div class="hx-orbit"></div><div class="hx-art art-visible">${art(type)}</div></div><div class="hx-options" role="group" aria-label="${title}">${labels.map((label,i)=>`<button type="button" aria-pressed="${i===0}">${label}</button>`).join('')}</div><p class="hx-caption">${caption}</p>`;
  card.prepend(panel);
  const stat = document.createElement('div'); stat.className = 'hx-stat';
  [...card.children].filter(child => child !== panel).forEach(child => stat.append(child));
  const intro = document.createElement('div'); intro.className = 'hx-stat-intro';
  const eyebrow = stat.querySelector('.gh-eyebrow'), metric = stat.querySelector('.gh-metric');
  if (eyebrow) intro.append(eyebrow); if (metric) intro.append(metric); stat.prepend(intro);
  card.closest('.gh-evidence')?.before(stat);
}

document.querySelectorAll('.gh-more,.profile-more').forEach(d => d.setAttribute('open',''));
document.querySelectorAll('button,a,summary,[tabindex]').forEach(el => el.removeAttribute('tabindex'));

const notes = [
  ['left',170,'01','Immediate orientation','The headline states the report’s value quickly, while the two routes let readers either begin with the findings or jump to the Hotelier’s Playbook.'],
  ['right',500,'02','A global idea made tangible','The globe turns a global research study into something people can understand at a glance. Country markers also preview the market-level profiles later in the report.'],
  ['left',1060,'03','Clear routes through a long report','Persistent section navigation reduces the effort of moving through a dense report and makes it easier to return to a specific finding.'],
  ['right',1450,'04','Four stories instead of one data wall','The findings are grouped into short editorial stories. Each one moves from the change, to supporting evidence, to a practical hotel response.'],
  ['left',2060,'05','Show the meaning, not only the number','The visual explorer gives each story a recognisable idea. Its three views connect the research to decisions a hotel can actually make.'],
  ['right',2760,'06','Comparison with clear provenance','Published 2026 figures create a credible baseline. Illustrative 2027 values are clearly identified until final research is available.'],
  ['left',3500,'07','Progressive disclosure','Supporting evidence stays available without making the first scan feel overwhelming. Readers can move from the headline to detail when they need it.'],
  ['right',4450,'08','An action closes every story','Each story ends with one plain-language opportunity, helping hoteliers translate research into a next step rather than leaving the insight abstract.'],
  ['left',5350,'09','Profiles bring the research closer','A country-led profile turns global research into a more relevant journey, from discovery and comparison to the stay itself.'],
  ['right',6150,'10','Patterns become easier to scan','Repeated card, tab and evidence structures help readers understand new material faster. The interface does not make them relearn the page in every section.'],
  ['left',7000,'11','Designed for desktop and mobile','On smaller screens, the three story options stack into full-width, touch-friendly rows. Every choice stays visible, with no sideways scrolling.'],
  ['right',7700,'12','A modular system for the full report','AI and trust, generations and 12 market profiles can be added as distinct modules without turning the report back into one long undifferentiated document.']
];

const sitePage = document.createElement('div'); sitePage.className = 'annotated-site-page';
[...document.body.children].forEach(child => sitePage.append(child));
const canvas = document.createElement('div'); canvas.className = 'annotation-canvas'; canvas.append(sitePage);
const layer = document.createElement('aside'); layer.className = 'annotation-layer'; layer.setAttribute('aria-label','Design rationale');
layer.innerHTML = `<header class="annotation-intro"><p>Changing Traveller Report 2027</p><h1>Design rationale</h1><span>Static desktop concept · prepared for Figma import</span></header>` + notes.map(([side,top,n,title,copy]) => `<article class="design-note ${side}" style="top:${top}px"><span>${n}</span><h2>${title}</h2><p>${copy}</p></article>`).join('');
canvas.append(layer); document.body.append(canvas);

const css = fs.readFileSync(path.join(root,'dist/assets/annotated-concept.css'),'utf8');
const style = document.createElement('style'); style.textContent = css; document.head.append(style);
const out = '<!doctype html>\n' + document.documentElement.outerHTML;
const dir = path.join(root,'dist/concept-globe-light-notes'); fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'index.html'),out);
console.log(`Built ${path.relative(root,path.join(dir,'index.html'))}`);
