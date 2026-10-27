import sys,csv,json,re
from pathlib import Path
sys.path.insert(0,'locale-tools')
from bs4 import BeautifulSoup,Comment
root=Path('ctr-source/dist');rows=list(csv.DictReader(open('translation-audit-source.csv',encoding='utf-8')));languages={'th':'Thai','es':'Spanish','it':'Italian','de':'German'}
rt=root/'assets/report-locale-runtime.js';js=rt.read_text(encoding='utf-8');start=js.index('const catalogs=')+len('const catalogs=');end=js.index('; const lang=',start);catalogs=json.loads(js[start:end]);benchmark=next(r for r in rows if r['English'].startswith('Global benchmark'))
countries=['Australia','Canada','China','France','Germany','India','Indonesia','Italy','Mexico','Singapore','Spain','Thailand','United Kingdom','United States']
for code,col in languages.items():
 p=root/'concept-traveller-stories-interactive'/code/'index.html';s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser');cat=catalogs[code]
 cat['Global benchmark']=re.sub(r'[:：]?\s*52[.,]2\s*%.*$','',benchmark[col]).strip()
 for country in countries:
  r=next((r for r in rows if r['English'].strip()==country),None);name=r[col].strip() if r else cat.get(country,country);cat[country]=name
  links=s.select('.profile-country-nav nav a[data-country="'+country+'"]')
  for a in links:
   bad=a.get_text(' ',strip=True);a['data-localized-country']=name
   for n in list(a.find_all(string=True)):n.extract()
   a.append(name)
   if bad!=name:
    for n in list(s.find_all(string=lambda v:v and v.strip()==bad)):
     if n.parent.name not in ['script','style']:n.replace_with(name)
   term='Travellers from '+('the ' if country.startswith('United ') else '')+country
   labelrow=next((r for r in rows if r['English']==term),None)
   label=labelrow[col] if labelrow else {'th':'นักเดินทางจาก '+name,'es':'Viajeros de '+name,'it':'Viaggiatori da '+name,'de':'Reisende aus '+name}[code]
   a['data-globe-label']=label;cat[term]=label
 for n in list(s.find_all(string=True)):
  if n.parent.name not in ['script','style'] and n.strip()=='Global benchmark':n.replace_with(cat['Global benchmark'])
 p.write_text(str(s),encoding='utf-8')
js=js[:start]+json.dumps(catalogs,ensure_ascii=False)+js[end:];rt.write_text(js,encoding='utf-8')
# Generate marker labels from the translated navigation metadata at creation time.
p=root/'assets/profile-world-signals.js';v=p.read_text(encoding='utf-8');v=v.replace("const hoverLabel='Travellers from '+(c.name.startsWith('United ')?'the ':'')+c.name;", "const localizedLink=[...document.querySelectorAll('.profile-country-nav nav a')].find(a=>a.dataset.country===c.name);\n const hoverLabel=localizedLink?.dataset.globeLabel||('Travellers from '+(c.name.startsWith('United ')?'the ':'')+c.name);");p.write_text(v,encoding='utf-8')
for file in ['profile-carousel.js','globe-light-profile.js']:
 p=root/'assets'/file;v=p.read_text(encoding='utf-8');v=v.replace('textContent=links[current].dataset.country','textContent=links[current].dataset.localizedCountry||links[current].dataset.country').replace('textContent=current.dataset.country','textContent=current.dataset.localizedCountry||current.dataset.country');p.write_text(v,encoding='utf-8')
print('Fixed country labels, globe labels, and benchmark copy in four languages.')
