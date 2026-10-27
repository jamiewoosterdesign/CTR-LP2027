"""Extract the profile copy and tables verbatim from the approved master text."""
from pathlib import Path
import re,json,math
text=Path('scripts/data/master-profiles.txt').read_text()
meta=[('Australian','Australia','australia','au'),('Canadian','Canada','canada','ca'),('Chinese','China','china','cn'),('French','France','france','fr'),('German','Germany','germany','de'),('Indian','India','india','in'),('Indonesian','Indonesia','indonesia','id'),('Italian','Italy','italy','it'),('Mexican','Mexico','mexico','mx'),('Singaporean','Singapore','singapore','sg'),('Spanish','Spain','spain','es'),('Thai','Thailand','thailand','th'),('UK','United Kingdom','uk','gb'),('American','United States','usa','us')]
profiles=[]
for n,(adjective,country,key,flag) in enumerate(meta):
 start=text.index('The '+adjective+' traveller')
 end=text.index('The '+meta[n+1][0]+' traveller',start) if n+1<len(meta) else len(text)
 lines=[s.strip() for s in text[start:end].splitlines() if s.strip() and not s.strip().startswith('___')]
 heading=lines.pop(0)
 if lines[0]==heading: lines.pop(0)
 p={'key':key,'country':country,'adjective':adjective,'flag':flag,'intro':' '.join(lines[:lines.index('Keywords:')]),'tags':lines[lines.index('Keywords:')+1].split(' / ')}
 p['tags']=[v.strip() for v in p['tags']]
 fi=next(i for i,x in enumerate(lines) if 'Three defining figures' in x)
 ji=next(i for i,x in enumerate(lines) if 'Three stops on the journey' in x)
 ri=next(i for i,x in enumerate(lines) if 'Three recommendations worth acting on' in x)
 figures=[]
 for i in range(fi+1,ji):
  if lines[i].startswith('{'):
   m=re.fullmatch(r'([\d.]+)% (.+)',lines[i+1]); g=re.search(r'([\d.]+)%',lines[i+2]);assert m and g
   figures.append([lines[i].strip('{}').replace('Who Travel companion','Travel companion'),float(m[1]),float(g[1]),m[2]])
 p['figures']=figures;assert len(figures)==3
 journeys=[]
 for name in ['Research','Booking','Return']:
  a=lines.index(name,ji);b=lines.index(['Booking','Return'][['Research','Booking'].index(name)],a+1) if name!='Return' else ri
  ls=lines[a+1:b]; code=ls[ls.index('Global')-1]; idx=ls.index('1'); data=ls[idx:]
  assert len(data)==24,(key,name,data)
  rows=[]
  for i in range(0,24,4):
   assert data[i]==str(i//4+1)
   rows.append([data[i+1],float(data[i+2].rstrip('%')),float(data[i+3].rstrip('%'))])
  journeys.append({'key':name.lower(),'name':name,'title':ls[0],'copy':ls[1],'max':math.ceil(max(max(x[1:]) for x in rows)/10)*10,'rows':rows})
 p['code']=code;p['journeys']=journeys
 rec=[];ls=lines[ri+1:]
 for i,num in enumerate(['01','02','03']):
  a=ls.index(num);b=ls.index(['02','03'][i],a+1) if i<2 else len(ls)
  body=ls[a+1:b]; title=body[0]; paragraphs=body[1:]
  if len(paragraphs)==1:
   paragraphs=re.split(r'(?<=\.) (?=[A-Z])',paragraphs[0],maxsplit=1)
  assert len(paragraphs)==2,(key,body)
  v=float(re.search(r'([\d.]+)%',paragraphs[0])[1]);rec.append({'title':title,'value':v,'signal':paragraphs[0],'tip':paragraphs[1]})
 p['recommendations']=rec;profiles.append(p)
Path('scripts/data/country-profiles.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2)+'\n')
print('Extracted',len(profiles),'profiles,',sum(len(p['journeys'])*6 for p in profiles),'benchmark rows,',sum(len(p['recommendations']) for p in profiles),'recommendations')
