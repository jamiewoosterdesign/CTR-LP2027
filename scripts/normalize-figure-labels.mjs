import { readFile, writeFile } from 'node:fs/promises';

const locales = ['', 'de', 'es', 'fr', 'it', 'pt', 'th'];
export async function normalizeFigureLabels({ check = false } = {}) {
  let changed = 0;
  for (const locale of locales) {
    const path = new URL(`../dist/concept-traveller-stories-interactive/${locale ? locale + '/' : ''}index.html`, import.meta.url);
    const source = await readFile(path, 'utf8');
    let count = 0;
    const result = source.replace(/(<p class="au-eyebrow">)([^<]*)(<\/p>)/g, (_, open, label, close) => {
      const match = label.match(/^(\d{2})\s*(?:[\u00b7\u2013\u2014-]\s*)?(.+?)\s*$/u);
      if (!match) throw new Error(`Unexpected figure label in ${locale || 'en'}: ${label}`);
      if (match[1] !== String(count % 3 + 1).padStart(2, '0')) throw new Error(`Unexpected figure sequence in ${locale || 'en'}`);
      count++;
      // Preserve HTML entities while uppercasing the translated label.
      const title = match[2].split(/(&[^;]+;)/u).map(part => part.startsWith('&') ? part : part.toLocaleUpperCase(locale || 'en')).join('');
      const normalized = `${match[1]} \u00b7 ${title}`;
      if (normalized !== label) changed++;
      return open + normalized + close;
    });
    if (count !== 42) throw new Error(`Expected 42 figure labels in ${locale || 'en'}, found ${count}`);
    if (check && result !== source) throw new Error(`Run node scripts/normalize-figure-labels.mjs: inconsistent labels in ${locale || 'en'}`);
    if (!check && result !== source) await writeFile(path, result);
  }
  console.log(`Figure labels: 294 checked across 7 languages; ${changed} ${check ? 'inconsistent' : 'updated'}.`);
}

if (process.argv[1]?.endsWith('normalize-figure-labels.mjs')) await normalizeFigureLabels({ check: process.argv.includes('--check') });
