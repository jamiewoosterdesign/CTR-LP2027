const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/tmp/ctr-qa/node_modules/playwright');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME_BINARY||'/tmp/ctr-qa/chrome',args:['--no-sandbox','--disable-gpu','--disable-software-rasterizer','--disable-dev-shm-usage'],headless:true,env:{...process.env,LD_LIBRARY_PATH:'/tmp/al2023/lib:/tmp',FONTCONFIG_PATH:'/tmp/fonts'}});
 const p=await b.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'});
 let errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript({content:fs.readFileSync(path.join(__dirname,'static-globe-recorder.js'),'utf8')});
 await p.route('**/*',async r=>{
  const u=new URL(r.request().url());if(u.hostname!=='ctr.test')return r.abort();
  let f=path.join(dist,u.pathname);if(u.pathname.endsWith('/'))f+='index.html';
  if(!fs.existsSync(f))return r.abort();
  if(u.pathname.endsWith('/profile-world-signals.js')){
   let s=fs.readFileSync(f,'utf8').replace("ctx=canvas.getContext('2d')","ctx=canvas.getContext('2d')");
   // The live implementation binds ctx with const; make this declaration mutable only in this export process.
   s=s.replace('const canvas=document.querySelector','let canvas=document.querySelector');
   const at=s.lastIndexOf('})();');
   s=s.slice(0,at)+`
window.captureStaticGlobe=()=>{
 yaw=-2.3;pitch=.22;tilt=0;selected=countries[0];hoverStarted=0;
 const old=ctx;ctx=new window.StaticGlobeRecorder();draw();const output=ctx.svg(size);ctx=old;
 return {svg:output,size,markers:countries.filter(c=>c.markerVisible).map(c=>({name:c.name,flag:c.button.querySelector('img').src.split('/').pop(),transform:c.button.style.transform,opacity:c.button.style.opacity,selected:c===selected}))};
};
`+s.slice(at);
   return r.fulfill({body:s,contentType:'text/javascript'});
  } await r.fulfill({path:f});
 });
 await p.goto('http://ctr.test/concept-traveller-stories-interactive/');
 await p.locator('.profile-globe').scrollIntoViewIfNeeded();await p.waitForTimeout(1400);
 const globe=await p.evaluate(()=>window.captureStaticGlobe());
 const flags={};for(const m of globe.markers)flags[m.flag]='data:image/svg+xml;base64,'+fs.readFileSync(path.join(dist,'assets',m.flag)).toString('base64');
 let extra='';
 for(const m of [...globe.markers].sort((a,b)=>Number(a.selected)-Number(b.selected))){
  const match=m.transform.match(/translate\(([-.\d]+)px,\s*([-.\d]+)px\) scale\(([-.\d]+)\)/);if(!match)continue;
  const [,x,y,scale]=match;
  extra+='<g transform="translate('+x+' '+y+') scale('+scale+')" opacity="'+m.opacity+'"><rect x="1" y="8" width="52" height="38" rx="7" fill="white"/><image href="'+flags[m.flag]+'" x="2" y="9" width="50" height="36"/>';
  if(m.selected)extra+='<g transform="translate(20 -48)"><rect width="275" height="43" rx="12" fill="#091d3a" fill-opacity=".95" stroke="#c4eaff" stroke-opacity=".22"/><image href="'+flags[m.flag]+'" x="14" y="12" width="26" height="19"/><text x="50" y="27" fill="#f4f9ff" font-size="14" font-family="Source Sans 3, sans-serif">Travellers from Australia</text><path d="M251 12v18m-6-6 6 6 6-6" fill="none" stroke="#91d7ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>';
  extra+='</g>';
 }
 const svg=globe.svg.replace('</svg>',extra+'</svg>');
 fs.writeFileSync(path.join(dist,'assets','static-profile-globe.svg'),svg);
 await p.mouse.move(0,0);
 await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(400);
 const html=await p.evaluate(()=>{
  const doc=new DOMParser().parseFromString(document.documentElement.outerHTML,'text/html');
  doc.title='Changing Traveller Report 2027 - Static design export';
  doc.body.classList.add('static-export');doc.body.classList.remove('ai-motion');
  doc.querySelectorAll('script,link[rel="preload"]').forEach(e=>e.remove());
  doc.querySelectorAll('[inert]').forEach(e=>e.removeAttribute('inert'));
  doc.querySelectorAll('[data-count-final]').forEach(e=>e.textContent=e.dataset.countFinal);
  doc.querySelectorAll('.ai-art,.ai-story-copy').forEach(e=>e.classList.add('is-visible'));
  doc.querySelectorAll('.au-chart-pending').forEach(e=>e.classList.remove('au-chart-pending'));
  doc.querySelectorAll('.report-nav').forEach(e=>e.classList.remove('is-scrolled','scrolled','is-compact'));
  doc.querySelectorAll('.ib-row').forEach(e=>e.classList.remove('has-open'));
  doc.querySelectorAll('#global-headlines .ib-card').forEach(e=>e.classList.remove('is-expanded'));
  const unique=(el,suffix)=>{
   const ids=new Map();el.querySelectorAll('[id]').forEach(n=>{ids.set(n.id,n.id+suffix);n.id+=suffix;});if(el.id){ids.set(el.id,el.id+suffix);el.id+=suffix;}
   el.querySelectorAll('*').forEach(n=>[...n.attributes].forEach(a=>{
    let v=a.value;for(const [old,neu]of ids){v=v.replaceAll('url(#'+old+')','url(#'+neu+')');if(['aria-controls','aria-labelledby','aria-describedby'].includes(a.name))v=v.split(' ').map(x=>x===old?neu:x).join(' ');}
    if(v!==a.value)n.setAttribute(a.name,v);
   }));
  };
  doc.querySelectorAll('.au-profile').forEach((profile,pi)=>{
   profile.hidden=false;profile.removeAttribute('aria-hidden');
   const journey=profile.querySelector('.au-panel:not(.au-recommendations)'),rec=profile.querySelector('.au-recommendations');
   const states=doc.createElement('div');states.className='static-profile-states';
   for(let i=1;i<3;i++){
    const c=journey.cloneNode(true);c.querySelectorAll('.au-journey').forEach((panel,k)=>{if(k!==i)panel.remove();else panel.hidden=false;});
    c.querySelectorAll('[data-journey]').forEach((t,k)=>{t.setAttribute('aria-selected',String(k===i));t.tabIndex=0;});
    unique(c,'-static-'+i);states.append(c);
   }
   // Default profile displays Research and recommendation 1.
   journey.querySelectorAll('.au-journey').forEach((panel,k)=>{if(k)panel.remove();else panel.hidden=false;});
   for(let i=1;i<3;i++){
    const c=rec.cloneNode(true);c.querySelectorAll('.au-recommend').forEach((card,k)=>{card.classList.toggle('is-active',k===i);card.querySelector('button').setAttribute('aria-expanded',String(k===i));card.querySelector('.au-recommend-body').hidden=k!==i;});
    const rings=[...c.querySelectorAll('.au-rings g')];rings.forEach((ring,k)=>{ring.classList.toggle('is-active',k===i);ring.setAttribute('aria-pressed',String(k===i));});
    c.querySelector('.au-ring-number strong').textContent=rings[i].dataset.value||rings[i].querySelector('.au-ring-value').getAttribute('stroke-dasharray').split(' ')[0];
    unique(c,'-static-'+i);states.append(c);
   }
   profile.append(states);
  });
  const track=doc.querySelector('.gen-carousel-track');
  if(track){const carousel=track.closest('.gen-carousel');[...track.children].forEach(e=>{e.removeAttribute('aria-hidden');carousel.before(e);});carousel.remove();}
  doc.querySelectorAll('.profile-pagination,.profile-carousel-pagination').forEach(e=>e.remove());
  const canvas=doc.querySelector('#globe'),img=doc.createElement('img');img.src='/assets/static-profile-globe.svg';img.className='static-globe-svg';img.width=590;img.height=590;img.alt='Static globe with Australia traveller tooltip and flight paths';canvas.replaceWith(img);
  doc.querySelector('#globe-markers')?.remove();doc.querySelector('#country-popover')?.remove();
  const menu=doc.querySelector('#playbook-options'),wrapper=doc.createElement('section');wrapper.className='static-playbook-menu report-playbook-menu';wrapper.setAttribute('aria-label','Hotelier’s Playbook region selection');
  const copy=menu.cloneNode(true);copy.querySelectorAll('.playbook-modal-heading,.playbook-scroll-rail').forEach(e=>e.remove());copy.hidden=false;unique(copy,'-static');wrapper.append(copy);doc.querySelector('#playbook').after(wrapper);
  // Keep a visible selected example so the selection/download treatment is available.
  copy.querySelectorAll('[data-market]').forEach((e,i)=>e.setAttribute('aria-pressed',String(i<3)));
  const download=copy.querySelector('.playbook-download-selected');download.disabled=false;download.textContent='Download 3 PDFs';
  const css=doc.createElement('link');css.rel='stylesheet';css.href='/assets/static-report-export.css';doc.head.append(css);
  doc.querySelectorAll('img').forEach(e=>{e.loading='eager';e.removeAttribute('decoding');});
  // Remove transient animation and scrolling styles; preserve chart values and layout sizing.
  doc.querySelectorAll('[style]').forEach(e=>{e.style.removeProperty('scroll-behavior');});
  return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
 });
 const out=path.join(dist,'concept-static-export');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),require('./static-mobile-navigation.cjs')(require('./static-playbook-mobile.cjs')(html),fs.readFileSync(path.join(dist,'concept-traveller-stories-interactive/index.html'),'utf8')));
 console.log(JSON.stringify({profiles:(html.match(/class="au-profile"/g)||[]).length,svgBytes:svg.length,htmlBytes:html.length,errors}));
 await b.close();
})();
