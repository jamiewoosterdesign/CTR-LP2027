"""Restore English chart structure while preserving the approved German copy."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.local-tools'))
from bs4 import BeautifulSoup

path = ROOT / 'dist/concept-traveller-stories-interactive/de/index.html'
soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
english = BeautifulSoup((path.parent.parent / 'index.html').read_text(encoding='utf-8'), 'html.parser')

# Translation flattened each bar row to text. Reuse its original English markup,
# including the exact width, then put the existing German label back inside it.
for source, target in zip(english.select('#solo-detail-3 .sb-mini-bars'), soup.select('#solo-detail-3 .sb-mini-bars')):
    for original, row in zip(source.select(':scope > div'), target.select(':scope > div')):
        label = row.get_text(strip=True)
        replacement = BeautifulSoup(str(original), 'html.parser').div
        replacement.select_one('b, span').string = label
        row.replace_with(replacement)

note = soup.select_one('#solo-detail-2 .sb-chart-note')
note.string = note.get_text().rstrip('.') + '.'

for paragraph in soup.select('#experiences-nostalgia .sb-insight'):
    copy = paragraph.get_text().replace('Preis-Leistungs-Verhältnis und Lage sind', 'Das Preis-Leistungs-Verhältnis und die Lage sind')
    paragraph.clear()
    prefix, emphasis = copy.rsplit('ein unvergesslicher Moment.', 1)
    paragraph.append(prefix)
    span = soup.new_tag('span', attrs={'class': 'ib-memory-emphasis'})
    span.string = 'ein unvergesslicher Moment.'
    paragraph.append(span)
    if emphasis:
        paragraph.append(emphasis)

caption = soup.select_one('#experiences-nostalgia .ib-dataset-title')
caption.clear()
caption.append('Grund für die Rückkehr in ein Hotel')
span = soup.new_tag('span', attrs={'class': 'ib-memory-caption'})
span.string = 'Ein unvergesslicher Moment'
caption.append(span)

# Keep the gauge key's two swatches and the dot chart's label/value styling.
key = soup.select_one('#experiences-pay .sr-pay-key')
key.clear()
for text in ['2026: 77,5 %', '19,7 % würden nicht']:
    span = soup.new_tag('span')
    span.append(soup.new_tag('i'))
    span.append(text)
    key.append(span)
for series in soup.select('#solo-detail-1 .ib-full .sb-dot-series'):
    label = series.select_one(':scope > div')
    name, value = label.get_text().split(' ', 1)
    label.clear()
    bold = soup.new_tag('b')
    bold.string = name
    span = soup.new_tag('span')
    span.string = value
    label.append(bold)
    label.append(span)

# The same chart-structure audit found two other lost text wrappers.
for selector, phrase, css_class in [
    ('#solo-detail-lead .sb-insight', 'Alleinreisen', 'ib-solo-emphasis'),
    ('#experiences-pay .ib-pay-preview-label, #experiences-pay .sr-pay-caption', 'ein Erlebnis vor Ort', 'sr-pay-label-tail'),
]:
    for element in soup.select(selector):
        before, after = element.get_text().split(phrase, 1)
        element.clear()
        element.append(before)
        span = soup.new_tag('span', attrs={'class': css_class})
        span.string = phrase
        element.append(span)
        element.append(after)

path.write_text(str(soup), encoding='utf-8')
