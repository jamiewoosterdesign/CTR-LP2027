import { stat, readFile } from 'node:fs/promises';
import { normalizeFigureLabels } from './normalize-figure-labels.mjs';
await normalizeFigureLabels({ check: true });
const editions=JSON.parse(await readFile(new URL('../dist/assets/playbook-editions.json',import.meta.url),'utf8'));
const profilePdfs=JSON.parse(await readFile(new URL('../dist/assets/traveller-profile-pdfs.json',import.meta.url),'utf8'));
if(editions.length!==12||new Set(editions.map(e=>e.id)).size!==12)throw new Error('Expected 12 unique playbook editions');
const paths=['index.html','concept-traveller-stories-interactive/index.html',...['th','es','it','de','fr','pt','id'].map(x=>`concept-traveller-stories-interactive/${x}/index.html`),'assets/report-locales.css','assets/report-locale-runtime.js','assets/report-fr-pt-runtime.js','assets/report-id-runtime.js','assets/ctr-hero.css','assets/ctr-hero.js',...['bag-poster.webp','sky-base.jpg','clouds-high.webp','clouds-low.webp','intro.webm','rest.webm'].map(x=>`assets/ctr-hero/${x}`),'assets/brand/arrow-right.svg'];
for(const p of paths){const s=await stat(new URL('../dist/'+p,import.meta.url));if(!s.size)throw new Error('Empty: '+p);}
for (const locale of ['', 'de', 'es', 'fr', 'it', 'pt', 'th', 'id']) {
  const html = await readFile(new URL(`../dist/concept-traveller-stories-interactive/${locale ? locale + '/' : ''}index.html`, import.meta.url), 'utf8');
  if(/https?:\/\/[^\s"<>]*(?:vercel\.app|chatgpt\.site)/.test(html))throw new Error(`Report links must not depend on the preview domain in ${locale||'en'}`);
  if(!html.includes('data-language="id"'))throw new Error(`Missing Indonesian language option in ${locale||'en'}`);
  const strips = [...html.matchAll(/<div class="au-tags">(.*?)<\/div>/gs)];
  if (strips.length !== 14 || strips.some(([, strip]) => (strip.match(/class="au-tag-item"/g) || []).length !== 3 || (strip.match(/<i>\u00b7<\/i>/g) || []).length !== 2)) {
    throw new Error(`Profile traits need three labels and two interpuncts in ${locale || 'en'}`);
  }
  {
    const miniBars = [...html.matchAll(/<div class="sb-mini-bars">([\s\S]*?)<\/div><\/div>/g)];
    if (miniBars.length !== 2 || miniBars.some(([, chart]) => (chart.match(/<i style="width:/g) || []).length !== 2)) {
      throw new Error(`Solo comparison charts need both bars in ${locale || 'en'}`);
    }
  }
  const picker=html.match(/<div class="playbook-options-grid">([\s\S]*?)<\/div>/)?.[1]||'';
  const options=[...picker.matchAll(/<button\b[^>]*data-market="([^"]+)"[^>]*data-pdf-url="([^"]+)"/g)];
  if(options.length!==12||options.some((m,i)=>m[1]!==editions[i].id||m[2]!==editions[i].url))throw new Error(`Playbook editions or links differ in ${locale||'en'}`);
  if(/<img\b/.test(picker)||/<div\b[^>]*class="playbook-options"[^>]*>\s*<p>/.test(html))throw new Error(`Playbook picker must omit flags and visible helper text in ${locale||'en'}`);
  const profileLinks=[...html.matchAll(/<a\b[^>]*class="au-hero-download"[^>]*>/g)];
  const expected=Object.values(profilePdfs[locale||'en']);
  if(profileLinks.length!==14||expected.some(url=>!profileLinks.some(([tag])=>tag.includes(`href="${url}"`)&&tag.includes('target="_blank"')&&tag.includes('rel="noopener noreferrer"')&&!tag.includes('aria-disabled'))))throw new Error(`Profile PDF links incomplete in ${locale||'en'}`);
  if(!/<a\b[^>]*class="playbook-download-selected"/.test(html))throw new Error(`Missing native PDF link in ${locale||'en'}`);
  const recommendations=[...html.matchAll(/<div\b[^>]*class="au-recommend-body"[^>]*>\s*<p>[^<]*<strong>/g)];
  if(recommendations.length!==42)throw new Error(`Each recommendation needs its independent statistic in ${locale||'en'}`);
  if (['de', 'es', 'it'].includes(locale) && html.includes('>Will travel solo<')) {
    throw new Error(`Untranslated solo-travel figure in ${locale}`);
  }
}
console.log('Profile traits: all 112 market profiles have three labels and two separators.');
console.log('Static site ready: English + 7 translations, runtime and animation assets.');
