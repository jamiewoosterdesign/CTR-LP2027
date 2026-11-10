(()=>{
 if(document.documentElement.lang!=='id')return;
 const map=__CATALOG__;
 const norm=s=>s.normalize('NFKC').replace(/[^\p{L}\p{N}_%]+/gu,'').toLowerCase();
 const country=s=>map[norm(s)]||s;
 function tr(s){
  const t=s.trim();let out=/[A-Za-z]/.test(t)?map[norm(t)]:null,m;
  if(!out&&(m=t.match(/^Profile (\d+) of (\d+)$/)))out=`Profil ${m[1]} dari ${m[2]}`;
  if(!out&&(m=t.match(/^(.+), profile (\d+) of (\d+)$/)))out=`${country(m[1])}, profil ${m[2]} dari ${m[3]}`;
  if(!out&&(m=t.match(/^(\d+): (.+) traveller profile$/)))out=`${m[1]}: profil wisatawan ${country(m[2])}`;
  if(!out&&(m=t.match(/^Travellers from (?:the )?(.+)$/)))out=`Wisatawan dari ${country(m[1])}`;
  if(!out&&(m=t.match(/^(.+), (\d+) of (\d+)$/)))out=`${country(m[1])}, ${m[2]} dari ${m[3]}`;
  if(!out&&(m=t.match(/^SHIFT (\d+)$/)))out=`PERUBAHAN ${m[1]}`;
  if(!out&&t.startsWith('Global Signals, SHIFT '))out=t.replace('Global Signals, SHIFT ','Sinyal Global, PERUBAHAN ');
  const value=out?s.replace(t,out):s;
  return value.replace(/(\d)\.(?=\d(?:[^\d]|$))/g,'$1,');
 }
 function walk(root){
  if(root.nodeType===3){if(root.parentElement?.closest('script,style,svg,[data-language]'))return;const next=tr(root.nodeValue);if(next!==root.nodeValue)root.nodeValue=next;return;}
  if(root.nodeType!==1||root.matches('script,style,svg,[data-language]'))return;
  for(const attr of ['aria-label','title','alt'])if(root.hasAttribute(attr)){const old=root.getAttribute(attr),next=tr(old);if(next!==old)root.setAttribute(attr,next);}
  for(const node of root.childNodes)walk(node);
 }
 walk(document.body);
 new MutationObserver(records=>{for(const r of records){if(r.type==='childList')r.addedNodes.forEach(walk);else walk(r.target);}}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt']});
 document.fonts.ready.then(()=>dispatchEvent(new Event('resize')));
})();
