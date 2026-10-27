(() => {
'use strict';
// Geographic outlines: Natural Earth, via https://github.com/topojson/world-atlas (land-110m).
const countries=[{"name":"Australia","image":"/assets/country-australia.webp","description":"See the priorities, booking habits and stay expectations shaping Australian travellers.","link":"View Australia insights","coords":[134,-25]},{"name":"Canada","image":"/assets/country-canada.webp","description":"Explore what Canadian guests value as they research, book and experience a stay.","link":"View Canada insights","coords":[-106,57]},{"name":"China","image":"/assets/country-china.webp","description":"Discover the choices and digital behaviours defining China’s accommodation market.","link":"View China insights","coords":[104,35]},{"name":"France","image":"/assets/country-france.webp","description":"Understand what French travellers expect from discovery through to the hotel stay.","link":"View France insights","coords":[2,47]},{"name":"Germany","image":"/assets/country-germany.webp","description":"See the booking preferences and hotel expectations influencing German guests.","link":"View Germany insights","coords":[10,51]},{"name":"India","image":"/assets/country-india.webp","description":"Explore the technology, value and experience signals shaping Indian travellers.","link":"View India insights","coords":[79,22]},{"name":"Indonesia","image":"/assets/country-indonesia.webp","description":"Follow how Indonesian travellers discover accommodation and decide where to book.","link":"View Indonesia insights","coords":[118,-3]},{"name":"Italy","image":"/assets/country-italy.webp","description":"See what matters to Italian guests before, during and after their hotel stay.","link":"View Italy insights","coords":[12.5,42]},{"name":"Mexico","image":"/assets/country-mexico.webp","description":"Explore the booking signals and experience priorities emerging across Mexico.","link":"View Mexico insights","coords":[-102,24]},{"name":"Singapore","image":"/assets/country-singapore.webp","description":"Understand the digital and service expectations shaping Singaporean travellers.","link":"View Singapore insights","coords":[103.8,1.35]},{"name":"Spain","image":"/assets/country-spain.webp","description":"See how service, value and experience influence Spain’s accommodation choices.","link":"View Spain insights","coords":[-4,40]},{"name":"Thailand","image":"/assets/country-thailand.webp","description":"Discover the behaviours and priorities defining Thailand’s next traveller.","link":"View Thailand insights","coords":[101,15]},{"name":"United Kingdom","image":"/assets/country-uk-fixed.webp","description":"Explore how UK travellers balance price, trust, convenience and experience.","link":"View UK insights","coords":[-2,55]},{"name":"United States","image":"/assets/country-united-states.webp","description":"See the discovery, loyalty and direct-booking signals shaping American guests.","link":"View US insights","coords":[-98,39]}];
const canvas=document.querySelector('#globe'),ctx=canvas.getContext('2d'),stage=document.querySelector('.globe-stage'),hero=canvas.closest('.profile-globe'),layer=document.querySelector('#globe-markers'),panel=document.querySelector('#country-popover');
const lightGlobe=document.body.classList.contains('report-globe-light');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.body.append(panel);
const flags=['au','ca','cn','fr','de','in','id','it','mx','sg','es','th','gb','us'];
let size=600,radius=228,arcs=[],yaw=-2.2,pitch=-.3,tilt=0,targetTilt=0,steer=0,targetSteer=0,velocity=0,drag=null,selected=null,pinned=false,closeTimer,last=0,visible=false;
let hoverStarted=0,countryShapes={};
const TAU=Math.PI*2,rad=Math.PI/180;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function vector(lon,lat){const a=lon*rad,b=lat*rad;return [Math.cos(b)*Math.sin(a),Math.sin(b),Math.cos(b)*Math.cos(a)]}
function project(v){
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch+tilt),sp=Math.sin(pitch+tilt);
 const x=v[0]*cy+v[2]*sy,z=-v[0]*sy+v[2]*cy;
 const y=v[1]*cp-z*sp,depth=v[1]*sp+z*cp;
 return {x:size/2+x*radius,y:size/2-y*radius,z:depth};
}
const grid=[];
for(let lat=-60;lat<=60;lat+=30){const line=[];for(let lon=-180;lon<=180;lon+=3)line.push(vector(lon,lat));grid.push(line)}
for(let lon=-180;lon<180;lon+=30){const line=[];for(let lat=-90;lat<=90;lat+=3)line.push(vector(lon,lat));grid.push(line)}
function stroke(lines,color,width,back=false){
 ctx.beginPath();
 for(const line of lines){
  let prev=null;
  for(const v of line){
   const p=project(v),front=back?p.z<0:p.z>=0;
   if(prev){
    const was=back?prev.z<0:prev.z>=0;
    if(was&&front){ctx.lineTo(p.x,p.y)}
    else if(was!==front){const t=prev.z/(prev.z-p.z),x=prev.x+(p.x-prev.x)*t,y=prev.y+(p.y-prev.y)*t;ctx.moveTo(was?prev.x:x,was?prev.y:y);ctx.lineTo(was?x:p.x,was?y:p.y)}
   }else if(front){ctx.moveTo(p.x,p.y)}
   prev=p;
  }
 }
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function close(){clearTimeout(closeTimer);panel.hidden=true;selected=null;pinned=false;countries.forEach(c=>{c.button.classList.remove('selected');c.button.removeAttribute('aria-expanded')})}
function scheduleClose(){if(pinned)return;clearTimeout(closeTimer);closeTimer=setTimeout(close,280)}
function positionPanel(){
 if(!selected||panel.hidden)return;
 const b=selected.button.getBoundingClientRect(),p=panel.getBoundingClientRect(),v=window.visualViewport;
 const left=v?v.offsetLeft:0,top=v?v.offsetTop:0,w=v?v.width:innerWidth,h=v?v.height:innerHeight;
 let x=b.right+12;
 if(x+p.width>left+w-12)x=b.left-p.width-12;
 let y=b.top-24;
 if(x<left+12){x=b.left+b.width/2-p.width/2;y=b.top-p.height-14;if(y<top+12)y=b.bottom+14}
 panel.style.left=clamp(x,left+12,Math.max(left+12,left+w-p.width-12))+'px';
 panel.style.top=clamp(y,top+12,Math.max(top+12,top+h-p.height-12))+'px';
}
function show(c){
 clearTimeout(closeTimer);if(selected!==c)hoverStarted=performance.now();selected=c;velocity=0;
 countries.forEach(x=>x.button.classList.toggle('selected',x===c));
}
countries.forEach((c,i)=>{
 c.v=vector(...c.coords);
 const localizedLink=[...document.querySelectorAll('.profile-country-nav nav a')].find(a=>a.dataset.country===c.name);
 const hoverLabel=localizedLink?.dataset.globeLabel||('Travellers from '+(c.name.startsWith('United ')?'the ':'')+c.name);
 const button=document.createElement('a');button.className='geo-marker';button.setAttribute('aria-label',hoverLabel);const profileLink=[...document.querySelectorAll('.profile-country-nav nav a')].find(a=>a.dataset.country===c.name);button.href=profileLink.hash;
 const flag=document.createElement('img');flag.className='country-marker-flag';flag.src='/assets/flag-'+flags[i]+'.svg';flag.alt='';flag.draggable=false;button.append(flag);
 const label=document.createElement('span');label.className='country-flight-tooltip';
 const mini=flag.cloneNode();mini.className='country-tooltip-flag';label.append(mini);
 const text=document.createElement('span');text.className='country-tooltip-copy';text.textContent=hoverLabel;label.append(text);
 const cue=document.createElementNS('http://www.w3.org/2000/svg','svg');cue.setAttribute('viewBox','0 0 24 24');cue.setAttribute('aria-hidden','true');cue.classList.add('country-tooltip-chevron');const cuePath=document.createElementNS('http://www.w3.org/2000/svg','path');cuePath.setAttribute('d','M12 4v16m-6-6 6 6 6-6');cue.append(cuePath);label.append(cue);button.append(label);
 button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show(c)});
 button.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')scheduleClose()});
 button.addEventListener('focus',()=>{if(matchMedia('(hover:hover) and (pointer:fine)').matches)show(c)});
 button.addEventListener('click',close);
 button.addEventListener('blur',()=>{setTimeout(()=>{if(!panel.contains(document.activeElement)&&!layer.contains(document.activeElement))scheduleClose()},0)});
 layer.append(button);c.button=button;
});
panel.addEventListener('pointerenter',()=>clearTimeout(closeTimer));
panel.addEventListener('pointerleave',scheduleClose);
panel.addEventListener('focusin',()=>clearTimeout(closeTimer));
panel.addEventListener('focusout',()=>setTimeout(()=>{if(!panel.contains(document.activeElement))scheduleClose()},0));
document.querySelector('.popover-close').addEventListener('click',()=>{close();canvas.focus()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
document.addEventListener('pointerdown',e=>{if(!panel.contains(e.target)&&!e.target.closest('.geo-marker'))close()});
function resize(){
 const nextSize=stage.clientWidth;if(!nextSize)return;
 const dpr=Math.min(devicePixelRatio||1,2),pixels=Math.round(nextSize*dpr);
 if(size===nextSize&&canvas.width===pixels&&canvas.height===pixels)return;
 size=nextSize;radius=size*.375;
 if(canvas.width!==pixels||canvas.height!==pixels){canvas.width=pixels;canvas.height=pixels;}
 ctx.setTransform(dpr,0,0,dpr,0,0);
 // Resizing clears a canvas; repaint immediately rather than expose an empty frame.
 draw();
}
new ResizeObserver(resize).observe(stage);resize();
window.addEventListener('resize',positionPanel);
window.addEventListener('scroll',positionPanel,{passive:true});
window.visualViewport?.addEventListener('resize',positionPanel);
fetch('/assets/land-110m.json').then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json()}).then(topology=>{
 const {scale,translate}=topology.transform;
 arcs=topology.arcs.map(arc=>{let x=0,y=0;return arc.map(p=>{x+=p[0];y+=p[1];return vector(x*scale[0]+translate[0],y*scale[1]+translate[1])})});
}).catch(()=>{canvas.setAttribute('aria-label','Interactive country globe. Coastline map could not load. Drag to rotate.')});
hero.addEventListener('pointermove',e=>{
 if(e.pointerType!=='mouse'||drag)return;
 const b=canvas.getBoundingClientRect();
 targetSteer=clamp((e.clientX-b.left-b.width/2)/(b.width/2),-1,1);
 targetTilt=clamp((e.clientY-b.top-b.height/2)/(b.height/2),-1,1)*.13;
});
hero.addEventListener('pointerleave',()=>{targetSteer=0;targetTilt=0});
canvas.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 close();velocity=0;drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false,type:e.pointerType};canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;
 if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5)drag.moved=true;
 if(drag.moved){yaw+=dx/radius*1.15;pitch=clamp(pitch+dy/radius*.75,-1.1,1.1);velocity=clamp(dx/radius*.7,-.05,.05);canvas.classList.add('dragging')}
 drag.lastX=e.clientX;drag.lastY=e.clientY;
});
function release(e){if(!drag||drag.id!==e.pointerId)return;drag=null;canvas.classList.remove('dragging');if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId)}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',e=>{velocity=0;release(e)});
let animationFrame=0;
function syncAnimation(){last=0;if(visible&&!document.hidden){if(!animationFrame)animationFrame=requestAnimationFrame(tick);}else{cancelAnimationFrame(animationFrame);animationFrame=0;}}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncAnimation()},{threshold:0,rootMargin:'0px 0px 80px 0px'}).observe(stage);
document.addEventListener('visibilitychange',syncAnimation);
function draw(){
 ctx.clearRect(0,0,size,size);const c=size/2;
 const halo=ctx.createRadialGradient(c,c,radius*.91,c,c,radius*1.23);
 if(lightGlobe){halo.addColorStop(0,'#54d9ff00');halo.addColorStop(.28,'#59d5ff28');halo.addColorStop(.55,'#278ee612');halo.addColorStop(1,'#1689ff00')}
 else{halo.addColorStop(0,'#54d9ff00');halo.addColorStop(.35,'#59d5ff38');halo.addColorStop(.6,'#278ee615');halo.addColorStop(1,'#1689ff00')}
 ctx.fillStyle=halo;ctx.fillRect(0,0,size,size);
 // Elevated routes remain visible behind the horizon until the globe itself occludes them.
 drawFlights(true);
 const ocean=lightGlobe
  ?ctx.createRadialGradient(c,c,radius*.03,c,c,radius)
  :ctx.createRadialGradient(c-radius*.38,c-radius*.45,radius*.05,c,c,radius);
 if(lightGlobe){ocean.addColorStop(0,'#50b9ef');ocean.addColorStop(.42,'#3d9cda');ocean.addColorStop(.76,'#246db9');ocean.addColorStop(1,'#164f98')}
 else{ocean.addColorStop(0,'rgba(37,139,175,.25)');ocean.addColorStop(.55,'rgba(11,78,127,.35)');ocean.addColorStop(.88,'rgba(7,54,105,.52)');ocean.addColorStop(1,'rgba(24,129,178,.4)')}
 ctx.beginPath();ctx.arc(c,c,radius,0,TAU);ctx.fillStyle=ocean;ctx.fill();
 drawCountryFill();
 stroke(grid,lightGlobe?'rgba(126,214,246,.09)':'rgba(99,196,230,.055)',lightGlobe?.72:.65,true);
 ctx.setLineDash([3,3]);
 stroke(arcs,lightGlobe?'rgba(143,226,244,.11)':'rgba(95,204,227,.05)',lightGlobe?.9:.8,true);
 ctx.setLineDash([]);
 stroke(grid,lightGlobe?'rgba(135,220,249,.2)':'rgba(108,212,242,.13)',lightGlobe?.82:.7);
 ctx.setLineDash([3,3]);
 stroke(arcs,lightGlobe?'rgba(174,240,251,.76)':'rgba(157,234,245,.53)',lightGlobe?1.08:1);
 ctx.setLineDash([]);
 ctx.beginPath();ctx.arc(c,c,radius,0,TAU);ctx.strokeStyle=lightGlobe?'rgba(174,238,255,.82)':'rgba(157,230,255,.66)';ctx.lineWidth=lightGlobe ? .8 : 1.2;ctx.shadowColor='#57ceff';ctx.shadowBlur=lightGlobe?8:18;ctx.stroke();ctx.shadowBlur=0;
 drawFlights();
 const points=countries.map(c=>({...project(c.v),country:c})).filter(p=>p.z>.12);
 // Separate nearby flag markers; fine leader lines retain the precise geography.
 const diameter=innerWidth<=700?46:54,spacing=diameter+16;
 points.forEach(p=>{p.px=p.x;p.py=p.y});
 for(let n=0;n<28;n++)for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
  const a=points[i],b=points[j],dx=b.px-a.px,dy=b.py-a.py,d=Math.hypot(dx,dy);
  if(d<spacing){const force=(spacing-d)/2,ux=d?dx/d:1,uy=d?dy/d:0;a.px-=ux*force;a.py-=uy*force;b.px+=ux*force;b.py+=uy*force}
 }
 const frontCountries=new Set(points.map(p=>p.country));
 countries.forEach(c=>{const on=frontCountries.has(c);if(c.markerVisible!==on){c.markerVisible=on;c.button.style.visibility=on?'visible':'hidden';c.button.tabIndex=on?0:-1;}});
 points.forEach(p=>{
  const b=p.country.button,scale=.9+p.z*.1;
  if(Math.hypot(p.px-p.x,p.py-p.y)>7){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.px,p.py);ctx.strokeStyle='#8ee8ff60';ctx.lineWidth=.8;ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,2,0,TAU);ctx.fillStyle='#a3efff';ctx.fill()}
  b.style.opacity=clamp((p.z-.12)*5,0,1);
  b.style.transform='translate('+(p.px-diameter/2)+'px,'+(p.py-diameter/2)+'px) scale('+scale+')';
  b.style.zIndex=Math.round(p.z*20)+1;
 });
}
// Natural Earth country boundaries; only the 14 supported profile countries.
const shapesObserver=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;shapesObserver.disconnect();fetch('/assets/profile-country-shapes.json').then(r=>r.json()).then(data=>{for(const [name,rings] of Object.entries(data))countryShapes[name]=rings.map(r=>r.map(p=>vector(...p)));}).catch(()=>{});},{rootMargin:'500px'});shapesObserver.observe(stage);
// Illustrative journeys, not measured destination pairs. Domestic-led markets
// retain one short local arc; longer arcs demonstrate travel around the globe.
// No endpoint, line weight or count represents a measured route or volume.
const journeyEnds={
 Australia:[[151,-34],[139,36],[-118,34],[-2,52]],
 Canada:[[-123,49],[-2,52],[139,36],[151,-34]],
 China:[[121,31],[2,47],[-122,38],[151,-34]],
 France:[[5,44],[139,36],[-74,41],[151,-34]],
 Germany:[[11,48],[104,1],[-118,34],[151,-34]],
 India:[[73,19],[-2,52],[151,-34],[-74,41]],
 Indonesia:[[115,-8],[139,36],[2,47],[-118,34]],
 Italy:[[14,41],[139,36],[-74,41],[151,-34]],
 Mexico:[[-87,21],[-2,52],[139,36],[-58,-35]],
 Singapore:[[139,36],[151,-34],[-2,52],[-122,38]],
 Spain:[[2,41],[139,36],[-74,41],[-58,-35]],
 Thailand:[[98,8],[151,-34],[-2,52],[-118,34]],
 'United Kingdom':[[-3,57],[139,36],[-74,41],[151,-34]],
 'United States':[[-118,34],[-2,52],[139,36],[151,-34]]
};
const flightPaths={};
for(const c of countries)flightPaths[c.name]=journeyEnds[c.name].map(end=>{
 const a=c.v,b=vector(...end),angle=Math.acos(clamp(a.reduce((n,v,i)=>n+v*b[i],0),-1,1)),sin=Math.sin(angle),lift=Math.min(.32,.06+angle*.13);
 return Array.from({length:49},(_,i)=>{const t=i/48,aa=Math.sin((1-t)*angle)/sin,bb=Math.sin(t*angle)/sin,h=1+Math.sin(Math.PI*t)*lift;return a.map((v,j)=>(v*aa+b[j]*bb)*h)});
});
function drawCountryFill(){
 if(!selected)return;
 ctx.save();ctx.beginPath();
 for(const ring of countryShapes[selected.name]||[]){
  const pts=ring.map(project),clipped=[];
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if(a.z>=0)clipped.push(a);if((a.z>=0)!==(b.z>=0)){const t=a.z/(a.z-b.z);clipped.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})}}
  if(clipped.length<3)continue;ctx.moveTo(clipped[0].x,clipped[0].y);for(const p of clipped.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();
 }
 ctx.fillStyle='rgba(255,255,255,.3)';ctx.fill('evenodd');ctx.restore();
}
function drawFlights(back=false){
 if(!selected)return;
 const elapsed=performance.now()-hoverStarted;
 for(const [i,path] of flightPaths[selected.name].entries()){
  const progress=reduced.matches?1:clamp((elapsed-180-i*520)/1300,0,1);if(!progress)continue;
  const n=progress*(path.length-1),count=Math.floor(n),part=path.slice(0,count+1);
  if(count<path.length-1){const a=path[count],b=path[count+1],t=n-count;part.push(a.map((v,j)=>v+(b[j]-v)*t))}
  ctx.save();ctx.lineCap='round';stroke([part],'rgba(219,247,255,.82)',1.35,back);
  const tip=project(part[part.length-1]);if(back?tip.z<0:tip.z>=0){ctx.beginPath();ctx.arc(tip.x,tip.y,progress<1?2.1:1.4,0,TAU);ctx.fillStyle='#e6fbff';ctx.fill()}ctx.restore();
 }
}
function tick(now){
 animationFrame=0;
 const dt=last?Math.min((now-last)/16.667,3):1;last=now;
 if(visible&&!document.hidden){
  if(!selected&&!drag){
   if(!reduced.matches){steer+=(targetSteer-steer)*.035*dt;tilt+=(targetTilt-tilt)*.035*dt;yaw+=(.0015525+steer*.002+velocity)*dt;velocity*=Math.pow(.94,dt)}
   else{velocity=0;tilt=0}
  }
  draw();
 }
 if(visible&&!document.hidden)animationFrame=requestAnimationFrame(tick);
}
syncAnimation();
})();
