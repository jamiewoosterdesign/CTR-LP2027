"""Keep the same report-label and year-chip structure in every locale.
Only changes badge markup; does not regenerate pages or touch hero media.
"""
import re,sys,html
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.local-tools'))
from bs4 import BeautifulSoup

def badge_markup(text):
 year=re.search(r'\b2027\b',text)
 assert year,'Report badge must contain its edition year'
 name=re.sub(r'\s+',' ',text[:year.start()]+' '+text[year.end():]).strip()
 return '<p class="hero-report-badge"><span class="hero-report-name">'+html.escape(name,quote=False)+'</span><span class="hero-report-year">2027</span></p>'

if __name__=='__main__':
 base=ROOT/'dist/concept-traveller-stories-interactive'
 paths=[base/'index.html']+[base/code/'index.html' for code in ['th','es','it','de','fr','pt']]
 for path in paths:
  source=path.read_bytes().decode('utf-8')
  pattern=r'<p class="hero-report-badge">.*?</p>'
  original=re.search(pattern,source,re.S)
  assert original,path
  text=BeautifulSoup(original[0],'html.parser').get_text(' ',strip=True)
  source=source[:original.start()]+badge_markup(text)+source[original.end():]
  path.write_bytes(source.encode('utf-8'))
 print('All seven hero badges use the shared label/year structure.')
