"""Apply the approved French editorial notes without rebuilding other locales."""
import re
from pathlib import Path

def refine(soup):
    for href, text in {
        '#global-headlines': 'Tendances Mondiales',
        '#ai-trust': 'IA & Confiance',
        '#traveller-profiles': 'Profils des Voyageurs',
    }.items():
        soup.select_one(f'#report-menu a[href="{href}"]').string = text
    heading = soup.select_one('#story-regional .sb-story-hero h2')
    heading.clear()
    heading.append('Le scroll prend une dimension ')
    emphasis = soup.new_tag('em')
    emphasis.string = 'régionale.'
    heading.append(emphasis)
    for link in soup.select('#sb-story-menu a'):
        if link.get('href') == '#story-regional':
            link.string = 'Le scroll prend une dimension régionale'
        else:
            link.string = link.get_text().rstrip().rstrip('.')
    for button in soup.select('.au-profile .au-tabs [data-journey="2"]'):
        button.string = 'Retour'
    for label in soup.select('.au-figure .au-eyebrow'):
        match = re.fullmatch(r'(\d{2})\s*[·–—-]?\s*(.+)', label.get_text(strip=True))
        if not match:
            raise ValueError('Unexpected figure label: ' + label.get_text())
        label.string = match[1] + ' · ' + match[2].upper()
    # Preserve the English label/value structure so its shared CSS applies.
    for paragraph, (label, value) in zip(soup.select('.methodology-summary > p'), [
        ("Période de l'enquête", '5–25 août 2026'),
        ('Nombre total de réponses', '12 029'),
        ('Pays', '14'),
        ('Propulsé par', 'Groupe Kantar'),
    ]):
        paragraph.clear()
        span = soup.new_tag('span')
        span.string = label
        paragraph.append(span)
        paragraph.append(value)

if __name__ == '__main__':
    import sys
    root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(root / '.local-tools'))
    from bs4 import BeautifulSoup
    path = root / 'dist/concept-traveller-stories-interactive/fr/index.html'
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    refine(soup)
    path.write_text(str(soup), encoding='utf-8')
