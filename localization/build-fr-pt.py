"""Add only FR/PT from the current English HTML, using exact copy-deck matches.
Requires BeautifulSoup (python -m pip install beautifulsoup4 --target .local-tools).
Never rebuilds the four existing translations. Production figures/DOM stay English-led.
"""
import sys, re, json, html, unicodedata
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.local-tools'))
from bs4 import BeautifulSoup, NavigableString, Comment
ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'dist/concept-traveller-stories-interactive'
DATA = json.loads((ROOT/'localization/translation-source-2026-10-28.json').read_text(encoding='utf-8'))['rows']
EXTRA = json.loads((ROOT/'localization/fr-pt-ui.json').read_text(encoding='utf-8'))
def clean(s): return re.sub(r'\s+', ' ', s.replace('\u2028',' ')).strip()
def norm(s): return re.sub(r'[^\w%]+','',unicodedata.normalize('NFKC',html.unescape(clean(s))).lower())

# Clear copy errors only. Editorial questions in the review remain untouched.
FIX = {
 'fr': {22: DATA[21][6].replace('et plus un rite de passage','et non plus un rite de passage').replace('par vingtenaires','par les vingtenaires'),
 43:'Choisit une chambre standard',63:DATA[62][6].replace('les point ','les points '),
 81:DATA[80][6].replace('constituent sur le podium','occupent les trois premières places'),
 169:'n°55',187:DATA[186][6].replace('sa capitales','sa capitale'),194:DATA[193][6].replace('toute autre','tout autre'),
 201:DATA[200][6].replace(' Réservation',''),388:DATA[387][6].removeprefix('le '),
 450:DATA[449][6].replace('peuvent','peut').replace('leur hébergement','son hébergement'),
 451:DATA[450][6].replace('Ils passeront','Il passera'),453:DATA[452][6].replace('indépendantq','indépendants'),
 557:DATA[556][6],558:'à leurs côtés.',
 620:'Ces voyageurs représentent la plus grande',621:'part des réservations',622:'effectuées via les OTA, mais ils',623:'s’ouvrent également aux possibilités offertes par l’IA.',
 761:'Le personnel et l’expérience jouent tous deux un rôle essentiel pour inciter ce client',762:'à revenir.',
 878:'Les agences de voyages ont toujours la cote',957:DATA[956][6].replace('Les personnel','Le personnel'),
 986:'40,5 % voyageront avec leur',987:'partenaire ou conjoint',1060:'23,6 % voyageront en solo',
 1079:DATA[1078][6].replace('gère','gérer'),
 1090:'Les programmes de fidélité incitent davantage',1091:'ce client à revenir que presque tout autre voyageur.',
 1046:DATA[1045][6].replace('les point ','les points ')},
 'pt': {203:DATA[202][5].replace('através dessas plataformas do que os pontos de fidelização','através dessas plataformas'),
 321:DATA[320][5].replace('UUma','Uma'),342:'Pessoal, assistência ao cliente, comunicação',
 372:DATA[371][5].replace('O personalidade','A personalidade'),396:DATA[395][5].replace('France','França'),
 451:DATA[450][5].replace('po telefone','por telefone'),474:'Regresso',
 780:'Apresente a aventura como um extra reservável no momento do pagamento, não como algo que os hóspedes tenham de',
 1060:'23,6% viajarão a solo'}
}

def make_lookup(code, col):
 rows = [[r[0] if r else '', FIX[code].get(i+1, r[col] if len(r)>col else '')] for i,r in enumerate(DATA)]
 lookup = {}
 def add(e,t):
  e,t=clean(e),clean(t)
  if e and t and re.search('[A-Za-z]',e) and '#ERROR!' not in t: lookup[norm(e)]=t
 for i,(e,t) in enumerate(rows):
  if i<2:continue
  add(e,t)
  for sep in ['||',' | ']:
   a,b=e.split(sep),t.split(sep)
   if len(a)==len(b) and len(a)>1:
    for x,y in zip(a,b):add(x.replace('[CTA]',''),y.replace('[CTA]',''))
  a=[v.strip(' -–') for v in e.splitlines() if v.strip(' -–')]
  b=[v.strip(' -–') for v in t.splitlines() if v.strip(' -–')]
  if len(a)==len(b):
   for x,y in zip(a,b):add(x,y)
 # Exact adjacent-row/line recombination supports sentences split over sheet cells.
 segments=[]
 for e,t in rows:
  a=[clean(v.strip(' -–')) for v in e.splitlines() if v.strip(' -–')]
  b=[clean(v.strip(' -–')) for v in t.splitlines() if v.strip(' -–')]
  if len(a)==len(b):segments.extend(zip(a,b))
  elif '\n' not in e and '\n' not in t:segments.append((e,t))
 for n in range(2,10):
  for i in range(len(segments)-n+1):add(' '.join(x for x,y in segments[i:i+n]),' '.join(y for x,y in segments[i:i+n]))
 # Strip display figures/numbering from paired component labels, never from data.
 for e,t in list(rows)+segments:
  pat=r'^\s*(?:#?\d+(?:[.,]\d+)?\s*(?:%|pp|pts|p\.p\.|points?|pontos?)?)\s*[-–·]?\s*'
  e2,t2=re.sub(pat,'',e,flags=re.I),re.sub(pat,'',t,flags=re.I)
  if e2!=e and t2!=t:add(e2,t2)
  if ' - ' in e and re.search(' / ',e):
   a,b=re.split(r'\s[-–]\s',e,maxsplit=1),re.split(r'\s[-–]\s',t,maxsplit=1)
   if len(a)==len(b)==2:
    add(a[0],b[0]);add(a[1],b[1])
 for e,values in EXTRA.items():add(e,values[code])
 return lookup

def build(code,col):
 lookup=make_lookup(code,col)
 soup=BeautifulSoup((BASE/'index.html').read_text(encoding='utf-8'),'html.parser')
 soup.html['lang']='fr' if code=='fr' else 'pt-PT'
 for unused in soup.select('.carousel-source-hero'):unused.decompose()
 inline={'span','em','strong','b','i','br','small','sup','sub','mark'}
 translated=set()
 # Translate complete prose units without flattening controls, charts or data.
 for el in list(soup.find_all(['h1','h2','h3','h4','p','a','button','label','figcaption','dt','dd','span','div'])):
  if not el.parent or el.find_parent(['script','style','svg']) or el.find(['svg','img','video','button','a','input','canvas']) or el.select_one('.report-arrow'):continue
  if el.name in ['div','span'] and el.find(True):continue
  if any(c.name not in inline for c in el.find_all(recursive=False) if c.name):continue
  if any(re.search(r'\d',v.get_text()) and (v.name in ['strong','b'] or re.search(r'stat|value|number',' '.join(v.get('class',[])))) for v in el.find_all(['strong','b','span'])):continue
  e=clean(el.get_text(' ',strip=True));t=lookup.get(norm(e))
  if t and re.search('[A-Za-z]',e):el.clear();el.append(t);translated.add(norm(t))
 for node in list(soup.find_all(string=True)):
  if isinstance(node,Comment) or node.parent.name in ['script','style'] or node.find_parent('svg'):continue
  e=clean(str(node));t=lookup.get(norm(e))
  if t and re.search('[A-Za-z]',e):
   node.replace_with((' ' if str(node).startswith(' ') else '')+t+(' ' if str(node).endswith(' ') else ''));translated.add(norm(t))
 for el in soup.find_all(True):
  for attr in ['aria-label','title','alt','placeholder']:
   if el.has_attr(attr) and norm(el[attr]) in lookup:el[attr]=lookup[norm(el[attr])]
 for el in soup.select('[data-country]'):el['data-localized-country']=lookup.get(norm(el['data-country']),el['data-country'])
 # Keep the hero's existing emphasis and layout.
 h=soup.select_one('#report-hero-title');h.clear()
 a,b=('Le monde','voyage autrement.') if code=='fr' else ('A forma como o mundo','viaja está a mudar.')
 h.append(a+' ');em=soup.new_tag('em');em.string=b;h.append(em)
 # This heading is split across inline nodes in English; translate it as a unit.
 h=soup.select_one('#france-title');h.clear();h.append('Le voyageur français' if code=='fr' else 'O viajante francês')
 headlines={
  'fr':[('Les voyageurs partent','en solo.'),('Les expériences avant','les récompenses.'),('La découverte via les réseaux sociaux','stagne'),('Les concurrents','gagnent du terrain.')],
  'pt':[('Cada vez mais viajantes optam por','viajar a solo.'),('As experiências estão a tornar-se mais importantes do que','acumular pontos.'),('A descoberta através das redes sociais','está a estagnar'),('Os concorrentes estão a','ganhar terreno.')]
 }
 for h,(a,b) in zip(soup.select('.sb-story-hero h2'),headlines[code]):
  h.clear();h.append(a+' ');em=soup.new_tag('em');em.string=b;h.append(em)
 for profile in soup.select('.au-profile'):
  country=profile.get('data-localized-country',profile.get('data-country',''))
  for el in profile.select('[aria-label]'):
   old=el['aria-label']
   if old.startswith('Download '):el['aria-label']=('Télécharger le profil PDF : ' if code=='fr' else 'Descarregar o perfil PDF: ')+country
   elif 'traveller journey' in old.lower():el['aria-label']='Parcours du voyageur' if code=='fr' else 'Percurso do viajante'
   elif 'traveller recommendations' in old.lower():el['aria-label']='Recommandations pour les voyageurs' if code=='fr' else 'Recomendações para os viajantes'
  cards=profile.select('.au-recommend')
  for g,card in zip(profile.select('.au-rings g[aria-label]'),cards):
   title=card.select_one('button')
   if title:g['aria-label']=clean(title.get_text(' ',strip=True))+', '+g.get('data-value','')+' %'
 # Normalise only visible numeric text, preserving all data attributes/styles.
 for node in list(soup.find_all(string=True)):
  if isinstance(node,Comment) or node.parent.name in ['script','style'] or node.find_parent('svg'):continue
  text=str(node)
  if text.strip() in ['English','Español','Deutsch','Français','Italiano','Português','ไทย']:continue
  text=text.replace('pts above the global average','pts au-dessus de la moyenne mondiale' if code=='fr' else 'pontos acima da média global')
  if code=='fr':text=re.sub(r'\bGlobal(?=\s+\d)','Monde',text)
  text=re.sub(r'(?<=\d)\.(?=\d)',',',text)
  if re.fullmatch(r'\s*pp\s*',text):text=text.replace('pp','pp' if code=='fr' else 'p.p.')
  text=re.sub(r'(?<=\d)\s*pp\b',' pp' if code=='fr' else ' p.p.',text)
  if code=='fr':text=re.sub(r'(?<=\d)\s*%', '\u00a0%',text)
  if text!=str(node):node.replace_with(text)
 soup.title.string='Changing Traveller Report 2027 | '+('Français' if code=='fr' else 'Português')
 soup.select_one('meta[name=description]')['content']=DATA[5][col]
 css=soup.new_tag('link',rel='stylesheet',href='/assets/report-locales.css');soup.head.append(css)
 script=soup.new_tag('script',src='/assets/report-fr-pt-runtime.js',defer=True);soup.body.append(script)
 soup.html['data-report-locale']=code
 out=BASE/code;out.mkdir(exist_ok=True);(out/'index.html').write_text(str(soup),encoding='utf-8')
 # Residual English list is a review aid, not a fuzzy replacement mechanism.
 original=BeautifulSoup((BASE/'index.html').read_text(encoding='utf-8'),'html.parser')
 english={clean(str(n)) for n in original.find_all(string=True) if not isinstance(n,Comment) and not n.find_parent(['script','style','svg']) and re.search('[A-Za-z]{3}',str(n))}
 missing=[]
 for node in soup.find_all(string=True):
  if isinstance(node,Comment) or node.find_parent(['script','style','svg']):continue
  t=clean(str(node))
  if t in english and re.search('[A-Za-z]{3}',t):missing.append(t)
 return list(dict.fromkeys(missing))

if __name__=='__main__':
 missing={c:build(c,i) for c,i in [('fr',6),('pt',5)]}
 (ROOT/'localization/fr-pt-remaining.json').write_text(json.dumps(missing,ensure_ascii=False,indent=2),encoding='utf-8')
 print({c:len(v) for c,v in missing.items()})
