(()=>{
 const profiles=[...document.querySelectorAll('.profile-content>.au-profile')],nav=document.querySelector('.profile-country-nav');
 if(!profiles.length||!nav)return;
 const links=[...nav.querySelectorAll('nav a')],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const host=profiles[0].parentElement;host.classList.add('profile-carousel');nav.dataset.carousel='true';
 let current=0;
 const arrow=(direction)=>`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${direction==='left'?'M19 12H5m7-7-7 7 7 7':'M5 12h14m-7-7 7 7-7 7'}"/></svg>`;
 const pagination=document.createElement('nav');pagination.className='profile-pagination';pagination.setAttribute('aria-label','Traveller profile pages');
 pagination.innerHTML=`<button class="profile-page-prev" aria-label="Previous traveller profile">${arrow('left')}<span>Previous</span></button><div class="profile-page-numbers"></div><span class="profile-page-counter" aria-hidden="true"></span><button class="profile-page-next" aria-label="Next traveller profile"><span>Next</span>${arrow('right')}</button><span class="profile-page-status" role="status" aria-live="polite"></span>`;
 host.append(pagination);
 const numbers=pagination.querySelector('.profile-page-numbers');
 function renderPages(){
  numbers.replaceChildren();const visible=new Set([0,1,2,profiles.length-3,profiles.length-2,profiles.length-1,current-1,current,current+1]);let previous=-1;
  [...visible].filter(i=>i>=0&&i<profiles.length).sort((a,b)=>a-b).forEach(i=>{
   if(previous>=0&&i-previous>1){const dots=document.createElement('span');dots.textContent='…';dots.setAttribute('aria-hidden','true');numbers.append(dots);}
   const button=document.createElement('button');button.textContent=i+1;button.setAttribute('aria-label',`${i+1}: ${links[i].dataset.country} traveller profile`);if(i===current)button.setAttribute('aria-current','page');button.addEventListener('click',()=>select(i,true,true));numbers.append(button);previous=i;
  });
 }
 function indexForHash(hash){const target=document.getElementById(hash.replace(/^#/,''));return target?profiles.findIndex(p=>p===target||p.contains(target)):-1;}
 function select(index,navigate=false,focus=false){
  current=(index+profiles.length)%profiles.length;
  const image=profiles[current].querySelector('.au-hero>img');if(image&&navigate){image.fetchPriority='high';image.loading='eager';}
  profiles.forEach((p,i)=>{p.hidden=i!==current;p.inert=i!==current;});
  links.forEach((a,i)=>{a.classList.toggle('current',i===current);if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  nav.dataset.active=String(current);nav.querySelector('.side-nav-toggle strong').textContent=links[current].dataset.localizedCountry||links[current].dataset.country;
  nav.classList.remove('is-open');nav.querySelector('.side-nav-toggle').setAttribute('aria-expanded','false');
  renderPages();pagination.querySelector('.profile-page-counter').textContent=`Profile ${current+1} of ${profiles.length}`;pagination.querySelector('.profile-page-status').textContent=`${links[current].dataset.country}, profile ${current+1} of ${profiles.length}`;
  if(navigate){
   history.pushState(null,'',links[current].hash);
   const hero=profiles[current].querySelector('.au-hero');
   const offset=(document.querySelector('.report-nav')?.offsetHeight||60)+(innerWidth<=900?nav.querySelector('.side-nav-toggle').offsetHeight:18);
   if(focus){hero.tabIndex=-1;hero.focus({preventScroll:true});}
   scrollTo({top:hero.getBoundingClientRect().top+scrollY-offset-12,behavior:'instant'});
   if(!reduced.matches)profiles[current].animate([{opacity:.4},{opacity:1}],{duration:220,easing:'ease-out'});
  }
 }
 pagination.querySelector('.profile-page-prev').addEventListener('click',()=>select(current-1,true,true));
 pagination.querySelector('.profile-page-next').addEventListener('click',()=>select(current+1,true,true));
 // Capture profile links before the report's general anchor scrolling handlers.
 document.addEventListener('click',event=>{
  const a=event.target.closest('a[href^="#"]');if(!a||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const index=indexForHash(a.hash);if(index<0)return;
  event.preventDefault();event.stopImmediatePropagation();select(index,true,false);
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));
 },true);
 addEventListener('hashchange',()=>{const i=indexForHash(location.hash);if(i>=0)select(i);});
 const initial=indexForHash(location.hash);select(initial>=0?initial:0);
 // Warm hidden carousel heroes only after the initial page load. Use the actual
 // image elements so the browser can reuse both downloaded and decoded images.
 const pending=[...document.querySelectorAll('.au-hero>img, .gen-portrait>img')];
 let active=0,started=false;
 const limit=navigator.connection?.saveData?1:2;
 function warm(image){return new Promise(resolve=>{
  const finish=()=>{image.removeEventListener('load',finish);image.removeEventListener('error',finish);resolve();};
  image.addEventListener('load',finish,{once:true});image.addEventListener('error',finish,{once:true});
  if(image.loading!=='eager')image.fetchPriority='low';image.loading='eager';
  if(image.complete)finish();
 }).then(()=>image.naturalWidth?image.decode().catch(()=>{}):undefined);}
 function pump(){if(!started||document.hidden)return;while(active<limit&&pending.length){const image=pending.shift();active++;warm(image).finally(()=>{active--;pump();});}}
 function start(){const run=()=>{started=true;pump();};if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:1200});else setTimeout(run,200);}
 document.addEventListener('visibilitychange',pump);
 if(document.readyState==='complete')start();else addEventListener('load',start,{once:true});
})();
