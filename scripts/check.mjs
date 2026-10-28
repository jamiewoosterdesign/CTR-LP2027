import { stat } from 'node:fs/promises';
const paths=['index.html','concept-traveller-stories-interactive/index.html',...['th','es','it','de','fr','pt'].map(x=>`concept-traveller-stories-interactive/${x}/index.html`),'assets/report-locales.css','assets/report-locale-runtime.js','assets/report-fr-pt-runtime.js','assets/suitcase-hero-sequence.js','assets/brand/arrow-right.svg'];
for(const p of paths){const s=await stat(new URL('../dist/'+p,import.meta.url));if(!s.size)throw new Error('Empty: '+p);}
console.log('Static site ready: English + 6 translations, runtime and animation assets.');
