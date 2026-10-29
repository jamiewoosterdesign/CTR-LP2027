(()=>{
 const section=document.querySelector('#generations');if(!section)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const desktop=matchMedia('(min-width:901px)');
 const stories=[...section.querySelectorAll('.gen-story')],links=[...section.querySelectorAll('.gen-tabs button, .sb-nav nav a')];
 let current=0,carousel,track;
 function select(index,updateHash=false){
  current=(index+stories.length)%stories.length;
  const image=stories[current].querySelector('.gen-portrait>img');if(image&&updateHash){image.fetchPriority='high';image.loading='eager';}
  links.forEach((link,i)=>{const on=i===current;link.classList.toggle('current',on);if(link.tagName==='BUTTON')link.setAttribute('aria-pressed',String(on));});
  if(!carousel)return;
  track.style.transform=`translateX(calc(-${current*100}% - ${current*24}px))`;
  stories.forEach((story,i)=>{story.inert=i!==current;story.setAttribute('aria-hidden',String(i!==current));});
  links.forEach((link,i)=>{link.classList.toggle('current',i===current);if(i===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  carousel.querySelector('.gen-prev').disabled=false;
  carousel.querySelector('.gen-next').disabled=false;
  carousel.querySelector('.gen-carousel-status').textContent=`${links[current].textContent.trim()}, ${current+1} of ${stories.length}`;
  section.dataset.carouselIndex=String(current);
  if(updateHash)history.replaceState(null,'','#'+stories[current].id);
 }
 function setupCarousel(){
  if(desktop.matches&&!carousel){
   carousel=document.createElement('div');carousel.className='gen-carousel';carousel.setAttribute('role','region');carousel.setAttribute('aria-roledescription','carousel');carousel.setAttribute('aria-label','Generational perspectives');
   carousel.innerHTML='<div class="gen-carousel-viewport"><div class="gen-carousel-track"></div></div><button class="gen-carousel-arrow gen-prev" aria-label="Previous generation"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg></button><button class="gen-carousel-arrow gen-next" aria-label="Next generation"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button><span class="gen-carousel-status" role="status" aria-live="polite"></span>';
   stories[0].before(carousel);track=carousel.querySelector('.gen-carousel-track');stories.forEach(story=>track.append(story));
   carousel.querySelector('.gen-prev').addEventListener('click',()=>select(current-1,true));carousel.querySelector('.gen-next').addEventListener('click',()=>select(current+1,true));
   let wheelSum=0,lastWheel=0;
   carousel.addEventListener('wheel',event=>{if(Math.abs(event.deltaX)<=Math.abs(event.deltaY)||Math.abs(event.deltaX)<2)return;event.preventDefault();const now=performance.now();if(now-lastWheel<650)return;wheelSum+=event.deltaX;if(Math.abs(wheelSum)>45){select(current+(wheelSum>0?1:-1),true);wheelSum=0;lastWheel=now;}},{passive:false});
   const hashIndex=stories.findIndex(story=>'#'+story.id===location.hash);select(hashIndex>=0?hashIndex:current);
  }else if(!desktop.matches&&carousel){
   stories.forEach(story=>{carousel.before(story);story.inert=false;story.removeAttribute('aria-hidden');});carousel.remove();carousel=null;delete section.dataset.carouselIndex;
  }
 }
 links.forEach((link,index)=>link.addEventListener('click',event=>{
  if(desktop.matches){event.preventDefault();event.stopImmediatePropagation();select(index,true);}
  else if(link.tagName==='BUTTON'){stories[index].scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});}
 }));
 const tabGroup=section.querySelector('.gen-tabs');
 tabGroup?.addEventListener('keydown',event=>{
  const index=links.indexOf(event.target);if(index<0)return;
  const next=event.key==='ArrowRight'?(index+1)%links.length:event.key==='ArrowLeft'?(index+links.length-1)%links.length:event.key==='Home'?0:event.key==='End'?links.length-1:-1;
  if(next<0)return;event.preventDefault();links[next].focus();links[next].click();
 });
 let scrollQueued=false;
 function syncMobile(){scrollQueued=false;if(desktop.matches)return;const line=(document.querySelector('.report-nav')?.offsetHeight||60)+(tabGroup?.offsetHeight||0)+36;let index=0;stories.forEach((story,i)=>{if(story.getBoundingClientRect().top<=line)index=i;});select(index);}
 addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(syncMobile);}},{passive:true});
 desktop.addEventListener('change',syncMobile);
 addEventListener('hashchange',()=>{if(!desktop.matches)return;const i=stories.findIndex(story=>'#'+story.id===location.hash);if(i>=0)select(i);});
 desktop.addEventListener('change',setupCarousel);setupCarousel();

 const visuals=[...section.querySelectorAll('.gen-visual')];
 const active=new Set();
 function animate(el,keyframes,options){const a=el.animate(keyframes,options);active.add(a);a.finished.catch(()=>{}).finally(()=>active.delete(a));}
 function reveal(visual){
  if(visual.dataset.revealed)return;visual.dataset.revealed='true';if(reduced.matches)return;
  const row=visual.closest('.gen-bottom');
  const index=row?[...row.children].indexOf(visual.closest('.gen-metric')):0;
  const delay=innerWidth>900?index*100:0;
  const stat=visual.querySelector('.gen-stat');
  if(stat&&stat.textContent.includes('%')){
   const final=stat.dataset.countFinal||stat.textContent,target=parseFloat(final.replace(',','.')),decimals=(final.match(/[.,](\d+)/)?.[1]||'').length,decimal=final.includes(',')?',':'.',start=performance.now()+delay;
   stat.setAttribute('aria-label',final);
   function step(now){if(reduced.matches){stat.textContent=final;return;}const t=Math.max(0,Math.min(1,(now-start)/750));stat.textContent=(target*(1-Math.pow(1-t,3))).toFixed(decimals).replace('.',decimal)+'%';if(t<1)requestAnimationFrame(step);else stat.textContent=final;}
   stat.textContent=(0).toFixed(decimals).replace('.',decimal)+'%';requestAnimationFrame(step);
  }
  visual.querySelectorAll('.gen-bar i').forEach(bar=>animate(bar,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:480,delay,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'}));
  visual.querySelectorAll('.gen-gauge-fill').forEach(arc=>{const end=arc.getAttribute('stroke-dasharray');animate(arc,[{strokeDasharray:'0 100'},{strokeDasharray:end}],{duration:480,delay,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'});});
  const dots=[...visual.querySelectorAll('.gen-dots i')];
  dots.map((dot,i)=>({dot,order:(9-Math.floor(i/10))*10+i%10})).filter(x=>x.dot.classList.contains('filled')).sort((a,b)=>a.order-b.order).forEach(({dot},i,filled)=>animate(dot,[{backgroundColor:'#213761',transform:'scale(.8)'},{backgroundColor:'#4380ff',transform:'scale(1)'}],{duration:140,delay:delay+i*(420/filled.length),easing:'ease-out',fill:'backwards'}));
  const stars=visual.querySelector('.gen-stars');if(stars)animate(stars,[{opacity:0},{opacity:1}],{duration:400,delay,fill:'backwards'});
 }
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){reveal(e.target);observer.unobserve(e.target);}}),{threshold:.15,rootMargin:`0px 0px -${Math.round(Math.min(100,innerHeight*.12))}px 0px`});
 visuals.forEach(v=>observer.observe(v));
 reduced.addEventListener('change',()=>{if(reduced.matches)active.forEach(a=>a.finish());});
})();
