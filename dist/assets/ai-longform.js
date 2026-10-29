(()=>{
 const section=document.querySelector('.ai-longform');if(!section)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const rows=[...section.querySelectorAll('.ai-row')];
 const parts=[...section.querySelectorAll('.ai-art,.ai-story-copy')];
 const stats=[...section.querySelectorAll('.ai-stat')];
 const active=new Set();let frame=0,revealObserver;
 const timeline=section.querySelector('.ai-timeline');
 const dots=[...section.querySelectorAll('.ai-timeline-dot')];
 const dot=dots.shift();dots.forEach(d=>d.remove());
 if(dot){dot.classList.add('ai-scroll-dot');dot.setAttribute('aria-hidden','true');timeline.append(dot);}
 let first=0,last=0;
 function measureDot(){
  if(!dot||!rows.length)return;
  const mobile=innerWidth<=700;
  first=rows[0].offsetTop+(mobile?23:rows[0].offsetHeight/2);
  const end=rows[rows.length-1];last=end.offsetTop+(mobile?23:end.offsetHeight/2);
  updateDot();
 }
 function updateDot(){
  if(!dot)return;
  const y=Math.max(first,Math.min(last,innerHeight*.5-timeline.getBoundingClientRect().top));
  dot.style.transform=`translate3d(-50%,${y}px,0) translateY(-50%)`;
 }
 new ResizeObserver(measureDot).observe(timeline);
 document.fonts.ready.then(measureDot);
 measureDot();
 function count(stat){
  if(stat.dataset.counted)return;stat.dataset.counted='true';
  const el=stat.querySelector('[data-count]');if(!el)return;
  const target=Number(el.dataset.count),decimals=el.dataset.count.includes('.')?1:0,start=performance.now();
  const format=value=>document.documentElement.lang==='de'?value.replace('.',','):value;
  function run(now){const t=reduced.matches?1:Math.min(1,(now-start)/750);el.textContent=format((target*(1-Math.pow(1-t,3))).toFixed(decimals));if(t<1)requestAnimationFrame(run);else el.textContent=format(el.dataset.count);}
  requestAnimationFrame(run);
 }
 function parallax(){frame=0;updateDot();if(reduced.matches||innerWidth<=700)return;active.forEach(row=>{const box=row.getBoundingClientRect();row.style.setProperty('--ai-parallax',Math.max(-10,Math.min(10,(innerHeight/2-box.top-box.height/2)*.025))+'px');});}
 function queue(){if(!frame)frame=requestAnimationFrame(parallax);}
 function observeReveals(){
  revealObserver?.disconnect();
  if(reduced.matches){section.classList.remove('ai-motion');parts.forEach(p=>p.classList.add('is-visible'));stats.forEach(count);return;}
  section.classList.add('ai-motion');
  // Pixel inset is based on viewport height, independent of row height or device width.
  const inset=Math.round(Math.min(100,innerHeight*.12));
  revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
   if(!e.isIntersecting)return;
   e.target.classList.add('is-visible');
   if(e.target.classList.contains('ai-stat'))count(e.target);
   revealObserver.unobserve(e.target);
  }),{threshold:0,rootMargin:`0px 0px -${inset}px 0px`});
  [...parts,...stats].filter(p=>!p.classList.contains('is-visible')).forEach(p=>revealObserver.observe(p));
 }
 const visibility=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)active.add(e.target);else active.delete(e.target);});queue();},{threshold:0});
 rows.forEach(row=>visibility.observe(row));observeReveals();
 addEventListener('scroll',queue,{passive:true});
 let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{observeReveals();measureDot();},120);queue();},{passive:true});
 reduced.addEventListener('change',()=>{rows.forEach(r=>r.style.removeProperty('--ai-parallax'));observeReveals();});
})();
