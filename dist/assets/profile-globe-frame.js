(()=>{
 const frame=document.querySelector('.profile-globe .system'),help=frame?.querySelector('.globe-help'),button=help?.querySelector('button');if(!button)return;
 const show=open=>{help.classList.toggle('is-open',open);button.setAttribute('aria-expanded',String(open));};
 help.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show(true);});
 help.addEventListener('pointerleave',()=>{if(document.activeElement!==button)show(false);});
 button.addEventListener('focus',()=>show(true));button.addEventListener('blur',()=>show(false));
 button.addEventListener('click',()=>show(true));
 document.addEventListener('pointerdown',e=>{if(!help.contains(e.target))show(false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')show(false);});
 // Deterministic starfield: a single static background, never a per-frame particle loop.
 let seed=27;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const stars=[];for(let i=0;i<100;i++){const x=(random()*1200).toFixed(2),y=(random()*640).toFixed(2),radius=(.45+random()*.8).toFixed(2),alpha=(.18+random()*.42).toFixed(2);stars.push(`<circle cx="${x}" cy="${y}" r="${radius}" fill="#d5e6ff" opacity="${alpha}"/>`);}
 const sky=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640" preserveAspectRatio="none">${stars.join('')}</svg>`;
 frame.style.setProperty('--globe-stars',`url("data:image/svg+xml,${encodeURIComponent(sky)}")`);
 const note=document.createElement('p');note.className='globe-explore-note';note.textContent='Select a traveller profile on the globe, or scroll down to explore.';frame.append(note);
 const track=document.createElement('div');track.className='globe-scroll-track';frame.before(track);track.append(frame);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let tick=0,visible=false;
 function update(){
  tick=0;
  if(innerWidth<=900||reduced.matches){frame.style.removeProperty('width');frame.style.setProperty('--globe-expand','0');return;}
  const nav=document.querySelector('.report-nav')?.getBoundingClientRect().height||80;
  const height=Math.min(840,Math.max(360,innerHeight-nav-40)),baseHeight=Math.min(640,height*.82),pinTop=Math.max(nav+16,(innerHeight-height)/2);
  track.style.setProperty('--globe-card-height',height+'px');track.style.setProperty('--globe-base-height',baseHeight+'px');track.style.setProperty('--globe-pin-top',pinTop+'px');
  const box=track.getBoundingClientRect(),distance=Math.max(0,box.top-pinTop,pinTop+height-box.bottom);
  const t=Math.max(0,Math.min(1,1-distance/(innerHeight*.65))),p=t*t*(3-2*t);
  const max=frame.parentElement.clientWidth,base=Math.min(800,max);
  frame.style.width=(base+(max-base)*p).toFixed(2)+'px';
  frame.style.setProperty('--globe-expand',p.toFixed(4));
 }
 function queue(){if(!tick)tick=requestAnimationFrame(update);}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;queue();},{rootMargin:'200px 0px'});observer.observe(frame);
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});reduced.addEventListener('change',queue);queue();
})();
