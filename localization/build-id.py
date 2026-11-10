"""Build only Indonesian from current English markup and the supplied B/J copy deck."""
import sys, re, json, html, unicodedata, copy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.local-tools'))
from bs4 import BeautifulSoup, Comment
BASE=ROOT/'dist/concept-traveller-stories-interactive'
rows=json.loads((ROOT/'localization/indonesian-source-2026-11-10.json').read_text(encoding='utf8'))['rows']
def clean(s):return re.sub(r'\s+',' ',s.replace('\u2028',' ')).strip()
def norm(s):return re.sub(r'[^\w%]+','',unicodedata.normalize('NFKC',html.unescape(clean(s))).lower())
lookup={}
def add(e,t):
 e,t=clean(e),clean(t)
 if e and t and re.search('[A-Za-z]',e):lookup[norm(e)]=t
segments=[]
for e,t in rows[2:]:
 add(e,t)
 for sep in ['||',' | ']:
  a,b=e.split(sep),t.split(sep)
  if len(a)==len(b) and len(a)>1:
   for x,y in zip(a,b):add(x.replace('[CTA]',''),y.replace('[CTA]',''))
 a=[v.strip(' -–') for v in e.splitlines() if v.strip(' -–')]
 b=[v.strip(' -–') for v in t.splitlines() if v.strip(' -–')]
 if len(a)==len(b):
  segments.extend(zip(a,b))
  for x,y in zip(a,b):add(x,y)
for n in range(2,10):
 for i in range(len(segments)-n+1):add(' '.join(x for x,y in segments[i:i+n]),' '.join(y for x,y in segments[i:i+n]))
for e,t in list(rows)+segments:
 pat=r'^\s*(?:#?\d+(?:[.,]\d+)?\s*(?:%|pp|pts|p\.p\.|points?|poin)?)\s*[-–·]?\s*'
 e2,t2=re.sub(pat,'',e,flags=re.I),re.sub(pat,'',t,flags=re.I)
 if e2!=e and t2!=t:add(e2,t2)
 # Numbered figure labels retain their existing number and typography.
 for label in [e,e2]:
  if re.match(r'^\d{2}\s*[-–]',label):add(re.sub(r'^(\d{2})\s*[-–]\s*',r'\1 · ',label),t)
extra_path=ROOT/'localization/indonesian-ui.json'
extra=json.loads(extra_path.read_text(encoding='utf8')) if extra_path.exists() else {}
for e,t in extra.items():add(e,t)
soup=BeautifulSoup((BASE/'index.html').read_text(encoding='utf8'),'html.parser')
soup.html['lang']='id';soup.html['data-report-locale']='id'
for unused in soup.select('.carousel-source-hero'):unused.decompose()
def translate_unit(el,target):
 # Preserve meaningful inline emphasis and independent numeric spans.
 marks=[]
 for child in el.find_all(['span','strong','b','em','small'],recursive=False):
  source=clean(child.get_text(' ',strip=True));translated=lookup.get(norm(source))
  if not translated and re.fullmatch(r'[\d.,%+–− -]+',source):translated=re.sub(r'(?<=\d)\.(?=\d)',',',source)
  if translated and translated.lower() in target.lower():
   idx=target.lower().index(translated.lower());tag=copy.copy(child);tag.clear();tag.append(target[idx:idx+len(translated)]);marks.append((idx,idx+len(translated),tag))
 el.clear();pos=0
 for start,end,tag in sorted(marks,key=lambda m:m[0]):
  if start<pos:continue
  el.append(target[pos:start]);el.append(tag);pos=end
 el.append(target[pos:])
inline={'span','em','strong','b','br','small','sup','sub','mark'}
for el in list(soup.find_all(['h1','h2','h3','h4','p','a','button','label','figcaption','dt','dd','span','div'])):
 if not el.parent or el.find_parent(['script','style','svg']) or el.find(['svg','img','video','button','a','input','canvas']):continue
 if el.name in ['div','span'] and el.find(True):continue
 if el.find_parent(class_='report-language') or el.get('class')==['au-eyebrow']:continue
 if any(c.name not in inline for c in el.find_all(recursive=False) if c.name):continue
 target=lookup.get(norm(el.get_text(' ',strip=True)))
 if target:translate_unit(el,target)
for node in list(soup.find_all(string=True)):
 if isinstance(node,Comment) or node.find_parent(['script','style','svg']) or node.find_parent(class_='report-language'):continue
 old=str(node);target=lookup.get(norm(old))
 if target:node.replace_with((' ' if old.startswith(' ') else '')+target+(' ' if old.endswith(' ') else ''))
for el in soup.find_all(True):
 for attr in ['aria-label','title','alt','placeholder']:
  if el.has_attr(attr) and norm(el[attr]) in lookup:el[attr]=lookup[norm(el[attr])]
 if el.has_attr('data-country'):el['data-localized-country']=lookup.get(norm(el['data-country']),el['data-country'])
for el in soup.select('.au-eyebrow'):
 text=el.get_text();m=re.match(r'^(\d{2})\s*·\s*(.*)$',text)
 if m:el.string=m[1]+' · '+lookup.get(norm(m[2]),m[2]).upper()
from importlib import import_module
soup.select_one('.hero-report-badge').replace_with(BeautifulSoup(import_module('hero-badge').badge_markup(rows[3][1]),'html.parser').p)
hero=soup.select_one('#report-hero-title');hero.clear();hero.append('Dunia kini bepergian dengan cara yang ');em=soup.new_tag('em');em.string='berbeda.';hero.append(em)
# Expanded chart key keeps its line break and source-approved translation.
for el in soup.select('.ib-expanded-key'):
 if 'destination preference' in el.get_text(' ',strip=True):el.string=lookup[norm('Year-on-year change in destination preference')]
for el in soup.select('#methodology *'):
 if el.string and el.string.strip()=='12,029':el.string='12.029'
soup.title.string='Changing Traveller Report 2027 | Bahasa Indonesia'
soup.select_one('meta[name=description]')['content']=rows[5][1]
for node in list(soup.find_all(string=True)):
 if isinstance(node,Comment) or node.find_parent(['script','style','svg']) or node.find_parent(class_='report-language'):continue
 old=str(node);old=old.replace('pts above the global average','poin di atas rata-rata global');new=re.sub(r'(?<=\d)\.(?=\d(?:[^\d]|$))',',',old)
 if new!=str(node):node.replace_with(new)
if not soup.select_one('link[href="/assets/report-locales.css"]'):soup.head.append(soup.new_tag('link',rel='stylesheet',href='/assets/report-locales.css'))
soup.body.append(soup.new_tag('script',src='/assets/report-id-runtime.js',defer=True))
for button in soup.select('[data-language]'):button['aria-selected']=str(button['data-language']=='id').lower()
toggle=soup.select_one('.report-language-toggle');toggle['aria-label']='Pilih bahasa, Bahasa Indonesia';toggle.select_one('span').string='ID';toggle.select_one('img')['src']='/assets/flag-id.svg'
for profile in soup.select('.au-profile'):
 title=profile.select_one('.au-hero h2').get_text(' ',strip=True)
 profile.select_one('.au-hero-download')['aria-label']='Unduh PDF profil '+title.lower()
 for ring,card in zip(profile.select('.au-rings g[aria-label]'),profile.select('.au-recommend')):
  ring['aria-label']=card.select_one('button').get_text(' ',strip=True)+', '+ring.get('data-value','').replace('.',',')+' persen'
out=BASE/'id';out.mkdir(exist_ok=True);(out/'index.html').write_text(str(soup),encoding='utf8')
original=BeautifulSoup((BASE/'index.html').read_text(encoding='utf8'),'html.parser')
english={clean(str(n)) for n in original.find_all(string=True) if not isinstance(n,Comment) and not n.find_parent(['script','style','svg']) and re.search('[A-Za-z]{3}',str(n))}
missing={}
for n in soup.find_all(string=True):
 if isinstance(n,Comment) or n.find_parent(['script','style','svg']) or n.find_parent(class_='report-language'):continue
 t=clean(str(n))
 if t in english and re.search('[A-Za-z]{3}',t):missing.setdefault(t, str(n.parent)[:400])
(ROOT/'localization/indonesian-remaining.json').write_text(json.dumps(missing,ensure_ascii=False,indent=2),encoding='utf8')
runtime_keys={norm(str(n)) for n in original.find_all(string=True)}|{norm(k) for k in extra}
runtime={k:v for k,v in lookup.items() if len(k)<180 and k in runtime_keys}
(ROOT/'localization/indonesian-runtime-map.json').write_text(json.dumps(runtime,ensure_ascii=False,indent=2),encoding='utf8')
print('Residual exact English strings:',len(missing))

(ROOT/"dist/assets/report-id-runtime.js").write_text((ROOT/"localization/id-runtime-template.js").read_text(encoding="utf8").replace("__CATALOG__",json.dumps(runtime,ensure_ascii=False)),encoding="utf8")
