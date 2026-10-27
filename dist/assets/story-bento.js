(() => {
  const topNav=document.querySelector('.report-nav');
  if(topNav){const measure=()=>document.documentElement.style.setProperty('--sb-top-nav-height',`${topNav.getBoundingClientRect().height}px`);measure();new ResizeObserver(measure).observe(topNav);}
  document.querySelectorAll('.sb-nav').forEach(nav=>{
  const toggle=nav.querySelector('.sb-nav-toggle');
  const isGlobal=!!nav.closest('#global-headlines');
  let shiftLabel;
  if(isGlobal){
    toggle.firstChild.textContent='';
    const sectionLabel=document.createElement('span');sectionLabel.className='sb-nav-section';sectionLabel.textContent='Global Signals';
    shiftLabel=document.createElement('strong');shiftLabel.className='sb-nav-current';shiftLabel.textContent='SHIFT 01';
    toggle.prepend(sectionLabel,shiftLabel);
  }
  toggle.addEventListener('click',()=>{const on=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(on));});
  const links=[...nav.querySelectorAll('a')];
  links.forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}));
  const sections=links.map(a=>document.querySelector(a.hash));let queued=false;
  function updateSection(){
    queued=false;if(innerWidth>900&&nav.closest('#generations')?.dataset.carouselIndex!==undefined)return;const line=(topNav?.getBoundingClientRect().height||0)+(innerWidth<=900?toggle.offsetHeight:24)+18;let active=0;
    sections.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<=line)active=i;});
    links.forEach((a,i)=>{a.classList.toggle('current',i===active);if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    if(shiftLabel){shiftLabel.textContent='SHIFT '+String(active+1).padStart(2,'0');toggle.setAttribute('aria-label','Global Signals, '+shiftLabel.textContent+': '+links[active].textContent.trim());}
    const label=toggle.querySelector('.gen-nav-current');if(label&&links[active])label.textContent=links[active].textContent.trim();
  }
  function queueSection(){if(!queued){queued=true;requestAnimationFrame(updateSection);}}
  addEventListener('scroll',queueSection,{passive:true});addEventListener('resize',queueSection);updateSection();
  document.addEventListener('pointerdown',e=>{if(!nav.contains(e.target)){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}});
  });
  const menu=document.querySelector('.report-menu-toggle');
  function closeMenu(){topNav.classList.remove('menu-open');document.querySelector('#report-menu')?.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open navigation');}
  menu?.addEventListener('click',()=>{const on=menu.getAttribute('aria-expanded')!=='true';topNav.classList.toggle('menu-open',on);menu.setAttribute('aria-expanded',String(on));menu.setAttribute('aria-label',on?'Close navigation':'Open navigation');});
  topNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  document.addEventListener('pointerdown',e=>{if(topNav&&!topNav.contains(e.target))closeMenu();});
  matchMedia('(max-width:900px)').addEventListener('change',closeMenu);
  const primaryLinks=[...document.querySelectorAll('.report-nav>nav a:not(.report-mobile-playbook)')];
  const targets=primaryLinks.map(link=>({link,section:document.querySelector(link.hash)})).filter(x=>x.section);
  let queued=false;
  let scrollAnchor=Math.max(0,scrollY);
  function updateHeader(){
    queued=false;if(!topNav)return;
    if(matchMedia('(max-width:900px)').matches||topNav.classList.contains('desktop-persistent'))topNav.classList.remove('is-compact');
    else if(scrollY>90)topNav.classList.add('is-compact');else if(scrollY<12)topNav.classList.remove('is-compact');
    const height=topNav.getBoundingClientRect().height;
    const mobile=matchMedia('(max-width:900px)').matches&&!document.body.classList.contains('static-export');
    const y=Math.max(0,Math.min(scrollY,document.documentElement.scrollHeight-innerHeight));
    if(!mobile||y<=height||topNav.classList.contains('menu-open')||topNav.querySelector(':focus-visible')){
      topNav.classList.remove('is-scroll-hidden');scrollAnchor=y;
    }else if(Math.abs(y-scrollAnchor)>=8){
      topNav.classList.toggle('is-scroll-hidden',y>scrollAnchor);scrollAnchor=y;
    }
    document.body.style.setProperty('--mobile-nav-visible-height',topNav.classList.contains('is-scroll-hidden')?'0px':height+'px');
    document.body.style.setProperty('--report-nav-height',height+'px');
    const line=height+Math.min(160,innerHeight*.2);
    let active=null;
    if(scrollY>12)targets.forEach(item=>{if(item.section.getBoundingClientRect().top<=line)active=item.link;});
    primaryLinks.forEach(link=>{const on=link===active;link.classList.toggle('current',on);if(on)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
  function queueHeader(){if(!queued){queued=true;requestAnimationFrame(updateHeader);}}
  addEventListener('scroll',queueHeader,{passive:true});addEventListener('resize',queueHeader);
  topNav?.addEventListener('focusin',queueHeader);
  menu?.addEventListener('click',queueHeader);
  if(topNav)new ResizeObserver(queueHeader).observe(topNav);
  updateHeader();
})();
