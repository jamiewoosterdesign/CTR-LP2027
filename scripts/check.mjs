import { stat, readFile } from 'node:fs/promises';
import { normalizeFigureLabels } from './normalize-figure-labels.mjs';
await normalizeFigureLabels({ check: true });
const paths=['index.html','concept-traveller-stories-interactive/index.html',...['th','es','it','de','fr','pt'].map(x=>`concept-traveller-stories-interactive/${x}/index.html`),'assets/report-locales.css','assets/report-locale-runtime.js','assets/report-fr-pt-runtime.js','assets/ctr-hero.css','assets/ctr-hero.js',...['bag-poster.webp','sky-base.jpg','clouds-high.webp','clouds-low.webp','intro.webm','rest.webm'].map(x=>`assets/ctr-hero/${x}`),'assets/brand/arrow-right.svg'];
for(const p of paths){const s=await stat(new URL('../dist/'+p,import.meta.url));if(!s.size)throw new Error('Empty: '+p);}
for (const locale of ['', 'de', 'es', 'fr', 'it', 'pt', 'th']) {
  const html = await readFile(new URL(`../dist/concept-traveller-stories-interactive/${locale ? locale + '/' : ''}index.html`, import.meta.url), 'utf8');
  const strips = [...html.matchAll(/<div class="au-tags">(.*?)<\/div>/gs)];
  if (strips.length !== 14 || strips.some(([, strip]) => (strip.match(/class="au-tag-item"/g) || []).length !== 3 || (strip.match(/<i>\u00b7<\/i>/g) || []).length !== 2)) {
    throw new Error(`Profile traits need three labels and two interpuncts in ${locale || 'en'}`);
  }
}
console.log('Profile traits: all 98 market profiles have three labels and two separators.');
console.log('Static site ready: English + 6 translations, runtime and animation assets.');
