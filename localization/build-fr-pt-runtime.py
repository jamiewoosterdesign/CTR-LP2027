import json,sys,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'localization'))
from importlib import import_module
builder=import_module('build-fr-pt')
catalogs={c:builder.make_lookup(c,i) for c,i in [('fr',6),('pt',5)]}
# Runtime needs original short labels, not synthetic adjacent-row combinations.
allowed={builder.norm(e) for row in builder.DATA for e in row[0].splitlines()} | {builder.norm(e) for e in builder.EXTRA}
catalogs={c:{k:v for k,v in values.items() if k in allowed and len(k)<180} for c,values in catalogs.items()}
js=r'''(()=>{
const catalogs=CATALOGS,code=document.documentElement.dataset.reportLocale,map=catalogs[code];if(!map)return;
const norm=s=>s.normalize('NFKC').replace(/[^\p{L}\p{N}_%]+/gu,'').toLowerCase();
const templates=code==='fr'?['Profil {n} sur {total}','{n} marchés sélectionnés','Télécharger {n} PDF']:['Perfil {n} de {total}','{n} mercados selecionados','Descarregar {n} PDFs'];
function tr(s){let t=s.trim(),out=map[norm(t)];if(!out){let m=t.match(/^Profile (\d+) of (\d+)$/i);if(m)out=templates[0].replace('{n}',m[1]).replace('{total}',m[2]);m=t.match(/^(\d+) markets selected$/);if(m)out=templates[1].replace('{n}',m[1]);m=t.match(/^Download (?:(\d+) PDFs|PDF)$/);if(m)out=templates[2].replace('{n}',m[1]||'1');m=t.match(/^(.+), (\d+) of (\d+)$/);if(m)out=m[1]+', '+m[2]+(code==='fr'?' sur ':' de ')+m[3];}
let value=out?s.replace(t,out):s;value=value.replace(/(\d)\.(?=\d)/g,'$1,');if(code==='fr')value=value.replace(/(\d)\s*%/g,'$1\u00a0%');return value;}
function walk(root){if(root.nodeType===3){if(root.parentElement?.closest('script,style,svg'))return;const next=tr(root.nodeValue);if(next!==root.nodeValue)root.nodeValue=next;return;}if(root.nodeType!==1||root.matches('script,style,svg'))return;
for(const a of ['aria-label','title','alt'])if(root.hasAttribute(a)){const old=root.getAttribute(a),next=tr(old);if(next!==old)root.setAttribute(a,next);}for(const n of root.childNodes)walk(n);}
walk(document.body);
const label=document.querySelector('#global-headlines .sb-nav-section'),title=document.querySelector('#global-headlines .sb-section-title h2');if(label&&title)label.textContent=title.textContent.trim();
const current=document.querySelector('#global-headlines .sb-nav-current'),shifts=[...document.querySelectorAll('#global-headlines .sb-story')].map(e=>e.querySelector('.sb-index')?.textContent.trim());
function fixShift(){if(!current)return;const m=current.textContent.match(/^SHIFT\s+(\d+)$/);if(m&&shifts[+m[1]-1])current.textContent=shifts[+m[1]-1];}fixShift();
const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')walk(r.target);else if(r.type==='childList')r.addedNodes.forEach(walk);else walk(r.target);}fixShift();});
observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt']});
document.fonts.ready.then(()=>dispatchEvent(new Event('resize')));
})();'''.replace('CATALOGS',json.dumps(catalogs,ensure_ascii=False,separators=(',',':')))
(ROOT/'dist/assets/report-fr-pt-runtime.js').write_text(js,encoding='utf-8')
print('Wrote FR/PT runtime catalogs')
