"""Format German display decimals without touching chart data or geometry."""
import re
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.local-tools'))
from bs4 import BeautifulSoup, Comment, Doctype

def display(text):
    def decimal(match):
        whole, fraction = match.groups()
        # Preserve German thousands such as 12.000 and 12.029.
        return match[0] if len(fraction) == 3 and whole != '0' else whole + ',' + fraction
    text = re.sub(r'(?<![\d.])(\d+)\.(\d+)(?!\d)', decimal, text)
    return re.sub(r'43,3[\s\u00a0\u202f]+% weltweit', '43,3% weltweit', text)

path = ROOT / 'dist/concept-traveller-stories-interactive/de/index.html'
soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
for node in list(soup.find_all(string=True)):
    if isinstance(node, (Comment, Doctype)) or node.find_parent(['script', 'style']):
        continue
    value = display(str(node))
    if value != str(node):
        node.replace_with(value)
for element in soup.find_all(True):
    for attr in ['aria-label', 'title', 'alt']:
        if element.has_attr(attr):
            element[attr] = display(element[attr])
path.write_text(str(soup), encoding='utf-8')
