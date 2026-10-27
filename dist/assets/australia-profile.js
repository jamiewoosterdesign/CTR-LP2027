(()=>{document.querySelectorAll('.au-profile').forEach(root=>{const tabs=[...root.querySelectorAll('[data-journey]')],panels=[...root.querySelectorAll('.au-journey')];const pagination=document.createElement('div');
pagination.className='au-journey-pagination';
pagination.setAttribute('role','group');
pagination.setAttribute('aria-label','Traveller journey pagination');
const pageButtons=tabs.map((tab,i)=>{
 const button=document.createElement('button');
 button.type='button';
 button.setAttribute('aria-label',tab.textContent.trim());
 button.setAttribute('aria-controls',panels[i].id);
 button.setAttribute('aria-pressed',tab.getAttribute('aria-selected'));
 button.addEventListener('click',()=>selectTab(i));
 pagination.append(button);
 return button;
});
panels[0].parentElement.append(pagination);
function selectTab(i){pageButtons.forEach((button,k)=>button.setAttribute('aria-pressed',String(k===i)));tabs.forEach((t,k)=>{t.setAttribute('aria-selected',String(k===i));t.tabIndex=k===i?0:-1;panels[k].hidden=k!==i;});revealChart(panels[i].querySelector('.au-chart'),true);}tabs.forEach((t,i)=>{t.addEventListener('click',()=>selectTab(i));t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%3;if(e.key==='ArrowLeft')n=(i+2)%3;if(e.key==='Home')n=0;if(e.key==='End')n=2;if(n!==undefined){e.preventDefault();selectTab(n);tabs[n].focus();}});});const cards=[...root.querySelectorAll('.au-recommend')],rings=[...root.querySelectorAll('.au-rings g')],values=rings.map(r=>r.dataset.value||r.querySelector('.au-ring-value').getAttribute('stroke-dasharray').split(' ')[0]);function select(i){cards.forEach((c,k)=>{c.classList.toggle('is-active',i===k);c.querySelector('button').setAttribute('aria-expanded',String(i===k));c.querySelector('.au-recommend-body').hidden=i!==k;rings[k].classList.toggle('is-active',i===k);rings[k].setAttribute('aria-pressed',String(i===k));});root.querySelector('.au-ring-number strong').textContent=values[i];}cards.forEach((c,i)=>{c.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')select(i);});c.querySelector('button').addEventListener('click',()=>select(i));c.querySelector('button').addEventListener('focus',()=>select(i));});rings.forEach((r,i)=>{r.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')select(i);});r.addEventListener('click',()=>select(i));r.addEventListener('focus',()=>select(i));r.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(i);}});});select(0);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const animations=new WeakMap();
function draw(el,delay=0){animations.get(el)?.cancel();if(reduced.matches)return;const a=el.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:480,delay,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'});animations.set(el,a);}
function revealChart(chart,replay=false){if(!chart||(!replay&&chart.dataset.revealed))return;chart.dataset.revealed='true';chart.classList.remove('au-chart-pending');chart.querySelectorAll('.au-track i').forEach((bar,i)=>{draw(bar,i*65);const marker=bar.nextElementSibling;animations.get(marker)?.cancel();if(!reduced.matches)animations.set(marker,marker.animate([{opacity:0},{opacity:1}],{duration:200,delay:200+i*65,fill:'backwards'}));});}
function revealRings(chart){
 if(chart.dataset.revealed)return;chart.dataset.revealed='true';if(reduced.matches)return;
 const arcs=[...chart.querySelectorAll('.au-ring-value')].reverse();
 arcs.forEach((arc,i)=>{const end=arc.getAttribute('stroke-dasharray');const a=arc.animate([{strokeDasharray:'0 100'},{strokeDasharray:end}],{duration:480,delay:i*65,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'});animations.set(arc,a);});
}
function count(el){if(el.dataset.counted)return;el.dataset.counted='true';const text=el.firstChild;const target=parseFloat(text.textContent),final=target.toFixed(1),start=performance.now();if(reduced.matches)return;function step(now){const t=Math.min(1,(now-start)/750);text.textContent=(target*(1-Math.pow(1-t,3))).toFixed(1);if(t<1)requestAnimationFrame(step);else text.textContent=final;}requestAnimationFrame(step);}
const inset=Math.round(Math.min(100,innerHeight*.12));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;if(el.matches('.au-rings'))revealRings(el);else if(el.matches('.au-figure-value'))count(el);else if(el.matches('.au-comparison')){el.classList.remove('au-chart-pending');el.querySelectorAll('i').forEach((bar,i)=>draw(bar,i*70));}else revealChart(el);observer.unobserve(el);}),{threshold:0,rootMargin:`0px 0px -${inset}px 0px`});
root.querySelectorAll('.au-figure-value,.au-comparison,.au-chart,.au-rings').forEach(el=>{if(!reduced.matches&&!el.matches('.au-figure-value,.au-rings'))el.classList.add('au-chart-pending');observer.observe(el);});
reduced.addEventListener('change',()=>{if(reduced.matches){root.querySelectorAll('.au-chart-pending').forEach(e=>e.classList.remove('au-chart-pending'));root.querySelectorAll('.au-track i,.au-track em,.au-comparison i,.au-ring-value').forEach(e=>animations.get(e)?.cancel());}});
});})();
