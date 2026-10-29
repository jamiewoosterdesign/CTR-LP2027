(() => {
 document.querySelectorAll('.ib-grid').forEach(grid=>{
 const rows=[...grid.querySelectorAll('.ib-row:not([data-bento-static])')];
 const cards=[...grid.querySelectorAll('.ib-row:not([data-bento-static]) .ib-card')];
 grid.querySelectorAll('[data-bento-static] .ib-heading').forEach(heading=>{heading.disabled=true;heading.removeAttribute('aria-expanded');heading.removeAttribute('aria-controls');});
 const hover=matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)');
 const mobile=matchMedia('(max-width: 900px)');
 let enterTimer,leaveTimer;
 function set(active){
  clearTimeout(leaveTimer);
  rows.forEach(row=>row.classList.toggle('has-open',Boolean(!mobile.matches&&active&&row.contains(active))));
  cards.forEach(card=>{
   const open=mobile.matches||card===active;
   card.classList.toggle('is-expanded',open);
   const heading=card.querySelector('.ib-heading');
   heading.disabled=mobile.matches;
   heading.setAttribute('aria-expanded',String(open));
   const panel=card.querySelector('.ib-full');panel.setAttribute('aria-hidden',String(!open));panel.inert=!open;
   card.querySelector('.ib-preview').setAttribute('aria-hidden',String(open));
  });
 }
 cards.forEach(card=>{
  card.querySelector('.ib-full').inert=true;
  card.addEventListener('pointerenter',()=>{if(hover.matches){clearTimeout(enterTimer);clearTimeout(leaveTimer);enterTimer=setTimeout(()=>set(card),75);}});
  card.addEventListener('pointerleave',()=>clearTimeout(enterTimer));
  card.addEventListener('focusin',event=>{if(!mobile.matches&&event.target.matches(':focus-visible'))set(card);});
  card.addEventListener('click',()=>{if(!mobile.matches&&!hover.matches)set(card.classList.contains('is-expanded')?null:card);});
  card.addEventListener('keydown',event=>{if(!mobile.matches&&event.key==='Escape')set(null);});
 });
 grid.addEventListener('pointerleave',()=>{if(hover.matches){clearTimeout(enterTimer);leaveTimer=setTimeout(()=>set(null),160);}});
 grid.addEventListener('focusout',event=>{if(!grid.contains(event.relatedTarget))set(null);});
 mobile.addEventListener('change',()=>{clearTimeout(enterTimer);clearTimeout(leaveTimer);set(null);});
 set(null);
 });
})();

// One entrance per default preview; expansion is deliberately left untouched.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),active=new Set();
 const previews=[...document.querySelectorAll(innerWidth<=900?'#global-headlines .sb-story .ib-full':'#global-headlines .sb-story .ib-preview')];
 function animate(el,frames,options={}){const a=el.animate(frames,{duration:480,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards',...options});active.add(a);a.finished.catch(()=>{}).finally(()=>active.delete(a));}
 const observer=new IntersectionObserver(entries=>entries.forEach(({target:preview,isIntersecting})=>{
  if(!isIntersecting)return;
  preview.dataset.introPlayed='true';observer.unobserve(preview);
  if(reduced.matches||(innerWidth>900&&preview.closest('.ib-card').classList.contains('is-expanded')))return;
  const card=preview.closest('.ib-card'),running=[];
  const track=(el,frames,options)=>{animate(el,frames,options);running.push(el);};
  preview.querySelectorAll('.sb-track i,.ib-neighbour-preview i').forEach((bar,i)=>track(bar,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{delay:i*65}));
  preview.querySelectorAll('[stroke-dasharray]').forEach(arc=>track(arc,[{strokeDasharray:'0 100'},{strokeDasharray:arc.getAttribute('stroke-dasharray')}]));
  preview.querySelectorAll('.sb-lollipop-stem').forEach(bar=>track(bar,[{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0 0 0 0)'}]));
  const dots=[...preview.querySelectorAll('.sb-dots .on')];dots.forEach((dot,i)=>track(dot,[{opacity:.15},{opacity:1}],{duration:140,delay:i*420/Math.max(1,dots.length)}));
  preview.querySelectorAll('.bubble-x,.bubble-m,.bubble-z,.ib-influence-preview').forEach(el=>track(el,[{opacity:0,scale:'.9'},{opacity:1,scale:'1'}]));
  preview.querySelectorAll('strong').forEach(el=>{
   const text=el.firstChild;if(!text||text.nodeType!==3||!/^\+?\d+([.,]\d+)?%?$/.test(text.textContent.trim()))return;
   const final=text.textContent,match=final.match(/\d+(?:[.,]\d+)?/),value=parseFloat(match[0].replace(',','.')),digits=(match[0].split(/[.,]/)[1]||'').length,decimal=match[0].includes(',')?',':'.',start=performance.now();let frame;
   const finish=()=>{cancelAnimationFrame(frame);text.textContent=final;};
   function step(now){if(reduced.matches||(innerWidth>900&&card.classList.contains('is-expanded'))){finish();return;}const t=Math.min(1,(now-start)/750);text.textContent=final.replace(match[0],(value*(1-Math.pow(1-t,3))).toFixed(digits).replace('.',decimal));if(t<1)frame=requestAnimationFrame(step);else finish();}frame=requestAnimationFrame(step);
  });
  // Hover must never replay or compete with the entrance.
  const stop=()=>{running.forEach(el=>el.getAnimations().forEach(a=>a.finish()));};
  card.addEventListener('pointerenter',stop,{once:true});
 }),{threshold:.2,rootMargin:'0px 0px -60px 0px'});
 previews.forEach(p=>observer.observe(p));
 reduced.addEventListener('change',()=>{if(reduced.matches)active.forEach(a=>a.finish());});
})();
