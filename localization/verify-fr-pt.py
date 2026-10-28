"""Verify that localisation preserves report data and working structures."""
import sys,re
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'.local-tools'))
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'dist/concept-traveller-stories-interactive'
def read(path):return BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
en=read(BASE/'index.html')
for e in en.select('.carousel-source-hero'):e.decompose()
def numbers(el):
 return [re.sub(r'[^\d]','',str(n)) for n in el.find_all(string=True) if re.fullmatch(r'[\s#Nn°º.º+−\-\d.,%]+',str(n)) and re.search(r'\d',str(n))]
for code in ['fr','pt']:
 s=read(BASE/code/'index.html')
 assert len(s.select('.ib-card'))==35
 assert len(s.select('.au-profile'))==14
 ids=[e['id'] for e in s.select('[id]')];assert len(ids)==len(set(ids))
 assert s.html['lang']==('fr' if code=='fr' else 'pt-PT')
 for src in en.select('.ib-card[id],.au-profile[id]'):
  dst=s.find(id=src['id']);assert dst is not None,src['id']
  assert numbers(src)==numbers(dst),(code,src['id'],'numeric display changed')
  for selector in ['[data-value]','[stroke-dasharray]','[style]']:
   a,b=src.select(selector),dst.select(selector)
   assert len(a)==len(b),(code,src['id'],selector)
   attr={'[data-value]':'data-value','[stroke-dasharray]':'stroke-dasharray','[style]':'style'}[selector]
   assert [e[attr] for e in a]==[e[attr] for e in b],(code,src['id'],attr)
 for selector in ['.au-tag-item','.gen-tabs button','.gen-story','.au-journey','.au-recommend','.report-arrow']:
  assert len(en.select(selector))==len(s.select(selector)),(code,selector)
 for el in s.select('[src]'):
  src=el['src']
  if src.startswith('/'):assert (ROOT/'dist'/src.lstrip('/')).is_file(),src
 for a in s.select('a[href^="#"]'):
  target=a['href'][1:]
  if target:assert target in ids,(code,target)
 assert 'Will travel solo' not in s.get_text()
 assert 'pts above the global average' not in s.get_text()
 assert 'ERROR!' not in s.get_text()
 assert '55' in s.select_one('#challengers-cities').get_text() if s.select_one('#challengers-cities') else True
 print(code+': 35 cards, 14 profiles; figures, chart data, controls, assets and anchors verified.')
