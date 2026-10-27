import sys,csv,re,html,json,unicodedata
from pathlib import Path
sys.path.insert(0,str(Path('locale-tools').resolve()))
from bs4 import BeautifulSoup,NavigableString,Comment
root=Path('ctr-source/dist'); source=(root/'concept-traveller-stories-interactive/index.html').read_text(encoding='utf-8')
rows=list(csv.DictReader(open('translation-audit-source.csv',encoding='utf-8')))
langs={'th':'Thai','es':'Spanish','it':'Italian','de':'German'}
def norm(s):return re.sub(r'[^\w%]+','',unicodedata.normalize('NFKC',html.unescape(s)).lower())
def clean(s):return re.sub(r'\s+',' ',s.replace('\u2028',' ').replace('\u00a0',' ')).strip()
allmissing={};counts={}
for code,col in langs.items():
 lookup={};raw={}
 def add(e,t):
  e=clean(e);t=clean(t)
  if e and t and '#ERROR!' not in t: lookup[norm(e)]=t;raw[e]=t
 for i,r in enumerate(rows):
  if i in [0,11,37]:continue
  e=r['English'];t=r[col]
  if col=='German' and '#ERROR!' in t:t=e.replace('pp',' Prozentpunkte').replace('Gen X','Generation X').replace('.',',')
  if col=='German' and re.fullmatch(r'0\.\d+',t.strip()) and '%' in e:t=e.replace('.',',')
  add(e,t)
  en=[v.strip(' -\n') for v in e.splitlines() if v.strip(' -\n')];tr=[v.strip(' -\n') for v in t.splitlines() if v.strip(' -\n')]
  if len(en)==len(tr):
   for a,b in zip(en,tr):add(a,b)
 for n in range(2,9):
  for i in range(len(rows)-n+1):
   group=rows[i:i+n]
   if all('\n' not in r['English'] and '#ERROR!' not in r[col] for r in group):add(' '.join(r['English'] for r in group),' '.join(r[col] for r in group))
 # Add component variants for editorial numbering, split stats and paired labels.
 for e,t in list(raw.items()):
  if '||' in e and '||' in t:
   for a,b in zip(e.split('||'),t.split('||')):add(a,b)
  if ' | ' in e and ' | ' in t:
   for a,b in zip(e.split(' | '),t.split(' | ')):add(a.replace('[CTA]','').strip(),re.sub(r'\[[^]]+\]','',b).strip())
  e2=re.sub(r'^\s*(?:#?\d+(?:[.,]\d+)?\s*%?|[+−]\d+(?:[.,]\d+)?pp)\s*[-–·]?\s*','',e)
  t2=re.sub(r'^\s*(?:#?\d+(?:[.,]\d+)?\s*%?)\s*[-–·]?\s*','',t)
  if e2!=e:add(e2,t2)
  if e.endswith('traveller') and 'PDF' not in t:add(e+'.',t)
 for e,t in list(raw.items()):
  if e.startswith('The ') and 'traveller' in e:add(e.replace(' || PDF DOWNLOAD',''),t.split('||')[0].strip())
 # Recombine spreadsheet line fragments, independent of row boundaries.
 segments=[]
 for r in rows:
  a=[clean(v.strip(' -')) for v in r['English'].splitlines() if v.strip(' -')];b=[clean(v.strip(' -')) for v in r[col].splitlines() if v.strip(' -')]
  if len(a)==len(b):segments.extend(zip(a,b))
 for n in range(2,10):
  for i in range(len(segments)-n+1):add(' '.join(a for a,b in segments[i:i+n]),' '.join(b for a,b in segments[i:i+n]))
 for i in [82,83,84,85,86]:
  a=rows[i]['English'].split(' - ');b=rows[i][col].split(' - ')
  if len(a)==len(b):
   for e,t in zip(a,b):add(e,t)
 add('Chooses a standard room',rows[41][col])
 add('The world’s largest accommodation-specific consumer survey',rows[6][col])
 add('The scroll is going regional',rows[87][col] if 'scroll' in rows[87]['English'].lower() else rows[88][col])
 for e,vals in json.loads(Path('locale-extra.json').read_text(encoding='utf-8')).items():add(e,vals[list(langs).index(code)])
 for country in ['United Kingdom','Canada','Germany','France','Italy','Mexico','Spain','China','Singapore','Thailand','India','Indonesia','Australia','United States']:
  if country in raw:pass
 for i in [82,83,84,85,86]:
  e=rows[i]['English'].split(' - ')[0];t=rows[i][col]
  t=re.split(r'\s[-–—]\s',t)[0];add(e,t)
 # Site numbers override erroneous spreadsheet numbers.
 for e in ['14%','+4.1pp','29.7%']:lookup[norm(e)]=e.replace('.',',') if code in ['es','it','de'] else e
 soup=BeautifulSoup(source,'html.parser');soup.html['lang']=code
 # Whole inline components first, so translated sentences remain grammatical.
 changed=0
 inline={'span','em','strong','b','i','br','small','sup','sub','mark'}
 for el in list(soup.find_all(['h1','h2','h3','h4','p','a','button','label','figcaption','dt','dd','span','div'])):
  if el.find_parent(['script','style','svg']) or el.find(['svg','img','video','button','a','input','canvas']):continue
  if any(re.search(r'\d',v.get_text()) and (v.name in ['strong','b'] or re.search(r'stat|value|number',' '.join(v.get('class',[])))) for v in el.find_all(['strong','b','span'])):continue
  if any(child.name not in inline for child in el.find_all(recursive=False) if child.name):continue
  text=clean(el.get_text(' ',strip=True));t=lookup.get(norm(text))
  if t and re.search('[A-Za-z]',text) and len(text)>1:el.clear();el.append(t);changed+=1
 for node in list(soup.find_all(string=True)):
  if isinstance(node,Comment) or node.parent.name in ['script','style'] or node.find_parent('svg'):continue
  text=clean(str(node));t=lookup.get(norm(text))
  if t and re.search('[A-Za-z]',text):node.replace_with((' ' if str(node).startswith(' ') else '')+t+(' ' if str(node).endswith(' ') else ''));changed+=1
 for el in soup.find_all(True):
  for attr in ['aria-label','title','alt','placeholder']:
   if el.has_attr(attr) and norm(el[attr]) in lookup:el[attr]=lookup[norm(el[attr])]
 # Exact locale-specific headline, preserving the gradient highlight.
 titles={'th':['พฤติกรรมการเดินทางของผู้คนทั่วโลก','กำลังเปลี่ยนแปลงไป'],'es':['El mundo viaja','de otra manera.'],'it':['Il mondo viaggia','in modo diverso.'],'de':['Die Welt reist','anders.']}
 h=soup.select_one('#report-hero-title');h.clear();h.append(titles[code][0]+' ');em=soup.new_tag('em');em.string=titles[code][1];h.append(em)
 # Omit the unused hidden prototype carousel, which is not part of this design.
 for unused in soup.select('.carousel-source-hero'):unused.decompose()
 for el in soup.find_all(string=True):
  if isinstance(el,Comment) or el.parent.name in ['script','style']:continue
  v=str(el).replace('ปรแกรม','โปรแกรม') if code=='th' else str(el)
  if v!=str(el):el.replace_with(v)
 for el in soup.select('[data-country]'):
  el['data-localized-country']=lookup.get(norm(el['data-country']),el['data-country'])
 soup.title.string={'th':'รายงานนักเดินทางปี 2027 | SiteMinder','es':'Changing Traveller Report 2027 | Español','it':'Changing Traveller Report 2027 | Italiano','de':'Changing Traveller Report 2027 | Deutsch'}[code]
 runtime=soup.new_tag('script',src='/assets/report-locale-runtime.js',defer=True);soup.body.append(runtime)
 css=soup.new_tag('link',rel='stylesheet',href='/assets/report-locales.css');soup.head.append(css)
 translated_norms={norm(v) for v in lookup.values()}
 missing=[]
 for node in soup.find_all(string=True):
  if node.parent.name in ['script','style'] or node.find_parent('svg') or isinstance(node,Comment):continue
  text=clean(str(node))
  if re.search(r'[A-Za-z]{3}',text) and norm(text) not in translated_norms and not re.fullmatch(r'[\d\s%+.,−–-]+',text):missing.append(text)
 allmissing[code]=list(dict.fromkeys(missing));counts[code]=changed
 out=root/'concept-traveller-stories-interactive'/code;out.mkdir(parents=True,exist_ok=True);(out/'index.html').write_text(str(soup),encoding='utf-8')
Path('locale-missing.json').write_text(json.dumps(allmissing,ensure_ascii=False,indent=2),encoding='utf-8')
print(counts);print('MISSING',len(allmissing['th']));print('\n'.join(allmissing['th']))
