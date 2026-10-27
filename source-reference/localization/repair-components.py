import sys,re,json
from pathlib import Path
sys.path.insert(0,'locale-tools')
from bs4 import BeautifulSoup
root=Path('ctr-source/dist');base=root/'concept-traveller-stories-interactive';en=BeautifulSoup((base/'index.html').read_text(encoding='utf-8'),'html.parser')
labels={'th':{'Gen Z':'Gen Z','Millennials':'มิลเลนเนียล','Gen X':'Gen X','Boomers':'เบบี้บูมเมอร์','Baby Boomers':'เบบี้บูมเมอร์','Japan':'ญี่ปุ่น','South Korea':'เกาหลีใต้','USA':'สหรัฐอเมริกา'},'es':{'Gen Z':'Generación Z','Millennials':'Millennials','Gen X':'Generación X','Boomers':'Baby boomers','Baby Boomers':'Baby boomers','Japan':'Japón','South Korea':'Corea del Sur','USA':'EE. UU.'},'it':{'Gen Z':'Gen Z','Millennials':'Millennial','Gen X':'Gen X','Boomers':'Baby boomer','Baby Boomers':'Baby boomer','Japan':'Giappone','South Korea':'Corea del Sud','USA':'Stati Uniti'},'de':{'Gen Z':'Generation Z','Millennials':'Millennials','Gen X':'Generation X','Boomers':'Babyboomer','Baby Boomers':'Babyboomer','Japan':'Japan','South Korea':'Südkorea','USA':'USA'}}
unit={'th':('จุด','จุดเปอร์เซ็นต์'),'es':('pp','puntos porcentuales'),'it':('pp','punti percentuali'),'de':('pp','Prozentpunkte')}
for code,names in labels.items():
 p=base/code/'index.html';s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
 # Match these components by stable selectors, never a fuzzy text replacement.
 for sel in ['#solo-detail-0 .sb-bubbles b','#solo-detail-0 .ib-preview-bubble b','.gen-tabs button','.gen-story .gen-portrait h3']:
  original=en.select(sel);translated=s.select(sel);assert len(original)==len(translated),(code,sel)
  for a,b in zip(original,translated):
   value=a.get_text(' ',strip=True);assert value in names,(code,value);b.clear();b.append(names[value])
 for sec in en.select('.ib-card[id]'):
  local=s.find(id=sec['id']);assert local
  a=sec.select('.sb-badge');b=local.select('.sb-badge');assert len(a)==len(b),(code,sec['id'])
  for src,dst in zip(a,b):
   txt=src.get_text(strip=True)
   if re.fullmatch(r'[+−-]?\d+(?:\.\d+)?pp',txt):
    num=txt[:-2];display=num.replace('.',',') if code!='th' else num;dst.clear();dst.append(display+' '+unit[code][0]);dst['title']=display+' '+unit[code][1];dst['aria-label']=dst['title']
  for src,dst in zip(sec.select('small'),local.select('small')):
   if src.get_text(strip=True)=='pp':dst.clear();dst.append(unit[code][0]);dst['title']=unit[code][1]
 for sel in ['#challengers-destinations .ib-rank-summary>b','#challengers-destinations .sb-lollipop>b']:
  for src,dst in zip(en.select(sel),s.select(sel)):
   key=src.get_text(strip=True)
   if key in names:dst.clear();dst.append(names[key])
 p.write_text(str(s),encoding='utf-8')
# Keep the explicit label dictionary with the source for future rebuilds.
Path('ctr-source/localization/component-labels.json').write_text(json.dumps(labels,ensure_ascii=False,indent=2),encoding='utf-8')
print('Restored label-only generation controls and bubbles in all four languages.')
