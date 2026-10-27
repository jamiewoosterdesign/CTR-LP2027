import json,csv
from pathlib import Path
root=Path('ctr-source/dist');d=json.loads(Path('locale-extra.json').read_text(encoding='utf-8'));extra={
'Previous':['ก่อนหน้า','Anterior','Precedente','Zurück'], 'Next':['ถัดไป','Siguiente','Successivo','Weiter'],
'Select your markets':d['Select your market'],'Close market selector':['ปิดตัวเลือกตลาด','Cerrar selector de mercado','Chiudi selettore del mercato','Marktauswahl schließen'],
"PDF downloads aren't available yet.":['ยังไม่สามารถดาวน์โหลด PDF ได้ในขณะนี้','Las descargas de PDF aún no están disponibles.','I download PDF non sono ancora disponibili.','PDF-Downloads sind noch nicht verfügbar.']}
d.update(extra)
rows=list(csv.DictReader(open('translation-audit-source.csv',encoding='utf-8')))
for country in ['Australia','Canada','China','France','Germany','India','Indonesia','Italy','Mexico','Singapore','Spain','Thailand','United Kingdom','United States']:
 r=next((r for r in rows if r['English']==country),None)
 if r:d[country]=[r[k] for k in ['Thai','Spanish','Italian','German']]
config={code:{e:vals[i] for e,vals in d.items()} for i,code in enumerate(['th','es','it','de'])}
prefix='const catalogs='+json.dumps(config,ensure_ascii=False)+';'
js="""(()=>{CATALOG const lang=document.documentElement.lang,map=catalogs[lang];if(!map)return;const templates={th:['โปรไฟล์ {n} จาก {total}','เลือก {n} ตลาดแล้ว','ดาวน์โหลด PDF {n} ไฟล์'],es:['Perfil {n} de {total}','{n} mercados seleccionados','Descargar {n} PDF'],it:['Profilo {n} di {total}','{n} mercati selezionati','Scarica {n} PDF'],de:['Profil {n} von {total}','{n} Märkte ausgewählt','{n} PDFs herunterladen']};function tr(s){const t=s.trim();if(map[t])return s.replace(t,map[t]);let m=t.match(/^Profile (\\d+) of (\\d+)$/i);if(m)return templates[lang][0].replace('{n}',m[1]).replace('{total}',m[2]);m=t.match(/^(\\d+) markets selected$/);if(m)return templates[lang][1].replace('{n}',m[1]);m=t.match(/^Download (?:(\\d+) PDFs|PDF)$/);if(m)return templates[lang][2].replace('{n}',m[1]||'1');return s;}function walk(root){if(root.nodeType===3){const next=tr(root.nodeValue);if(next!==root.nodeValue)root.nodeValue=next;return;}if(root.nodeType!==1||root.matches('script,style,svg'))return;for(const attr of ['aria-label','title','alt'])if(root.hasAttribute(attr)){const old=root.getAttribute(attr),next=tr(old);if(next!==old)root.setAttribute(attr,next);}for(const n of root.childNodes)walk(n);}walk(document.body);const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')walk(r.target);else if(r.type==='childList')r.addedNodes.forEach(walk);else walk(r.target);}});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt']});document.fonts.ready.then(()=>dispatchEvent(new Event('resize')));})();""".replace('CATALOG',prefix)
(root/'assets/report-locale-runtime.js').write_text(js,encoding='utf-8')
for path in [root/'concept-traveller-stories-interactive/index.html']+list((root/'concept-traveller-stories-interactive').glob('*/index.html')):
 s=path.read_text(encoding='utf-8');s=s.replace('</body>','<script src="/assets/report-locale-navigation.js" defer></script></body>');path.write_text(s,encoding='utf-8')
