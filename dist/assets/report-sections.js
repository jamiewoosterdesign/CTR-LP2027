(() => {
  const stories = [...document.querySelectorAll('.gh-story')];
  const links = [...document.querySelectorAll('.gh-story-nav a')];
  const signals = document.body.classList.contains('report-signals');
  document.querySelectorAll('.gh-delta').forEach(badge=>{
    const value=badge.textContent.match(/\d+/)?.[0];
    if(!value)return;
    badge.setAttribute('aria-label',`Increase of ${value} percentage points`);
    badge.innerHTML=`<span class="delta-plus" aria-hidden="true">+</span><strong>${value}</strong><span class="delta-percent" aria-hidden="true">%</span>`;
  });
  const help=document.querySelector('.globe-help');
  if(help){
    const button=help.querySelector('button');
    const show=value=>{help.classList.toggle('is-open',value);button.setAttribute('aria-expanded',String(value));};
    help.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show(true);});
    help.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&document.activeElement!==button)show(false);});
    button.addEventListener('focus',()=>show(true));button.addEventListener('blur',()=>show(false));
    button.addEventListener('click',()=>show(true));
    document.addEventListener('pointerdown',e=>{if(!help.contains(e.target))show(false);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')show(false);});
  }
  document.querySelector('.country-popover a.global-link')?.addEventListener('click',()=>document.querySelector('.popover-close').click());
  const reportNav=document.querySelector('.report-nav');
  // Navigate to visible content, not the section's large decorative top padding.
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const hash=link.getAttribute('href');
    if(!['#global-headlines','#traveller-profiles','#profile-overview'].includes(hash))return;
    const target=hash==='#global-headlines'?document.querySelector('.gh-section-intro'):document.querySelector('#profile-overview');
    if(!target)return;
    event.preventDefault();
    const rail=target.closest('.side-layout')?.querySelector('.side-nav-toggle');
    const railHeight=rail&&getComputedStyle(rail).display!=='none'?rail.offsetHeight:0;
    const top=target.getBoundingClientRect().top+scrollY-reportNav.offsetHeight-railHeight-18;
    window.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    history.replaceState(null,'',hash);
  });
  const storyNav=document.querySelector('.gh-story-nav');
  const storyFrame=document.querySelector('.gh-nav-frame');
  const storyLayout=document.querySelector('.gh-layout');
  const menuToggle=document.querySelector('.report-menu-toggle');
  function closeMenu(restoreFocus=false){reportNav.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open navigation');if(restoreFocus)menuToggle.focus();}
  menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';reportNav.classList.toggle('menu-open',open);menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  reportNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&reportNav.classList.contains('menu-open'))closeMenu(true);});
  document.addEventListener('pointerdown',e=>{if(!reportNav.contains(e.target))closeMenu();});
  window.matchMedia(document.querySelector('.report-language')?'(max-width:1100px)':'(max-width:900px)').addEventListener('change',()=>closeMenu());
  const sizeNav=()=>document.body.style.setProperty('--report-nav-height',reportNav.offsetHeight+'px');
  new ResizeObserver(sizeNav).observe(reportNav);sizeNav();
  if(signals){
    const hero=document.querySelector('.hero');
    const sizeHero=()=>document.querySelector('.signals-opening').style.setProperty('--signals-hero-height',hero.offsetHeight+'px');
    new ResizeObserver(sizeHero).observe(hero);sizeHero();
  }
  let navFrame=0, currentStory=-1;
  function select(index) {
    if(index===currentStory)return;
    currentStory=index;
    links.forEach((link,i)=>{
      link.classList.toggle('current',i===index);
      if(i===index)link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    if(signals && storyNav.scrollWidth>storyNav.clientWidth){
      const item=links[index].getBoundingClientRect(), rail=storyNav.getBoundingClientRect();
      if(item.left<rail.left)storyNav.scrollLeft-=rail.left-item.left+8;
      else if(item.right>rail.right)storyNav.scrollLeft+=item.right-rail.right+8;
    }
  }
  function updateNav(){
    navFrame=0;
    if(window.scrollY>90)reportNav.classList.add('is-compact');
    else if(window.scrollY<12)reportNav.classList.remove('is-compact');
    const h=reportNav.offsetHeight;
    let line=h+48;
    if(signals){
      const rect=storyFrame.getBoundingClientRect();
      const active=storyLayout.getBoundingClientRect().bottom>h+rect.height;
      storyFrame.classList.toggle('is-sticky',active&&rect.top<=h+1);
      line+=rect.height;
    }
    let index=0;
    stories.forEach((story,i)=>{if(story.getBoundingClientRect().top<=line)index=i;});
    select(index);
  }
  function queueNav(){if(!navFrame)navFrame=requestAnimationFrame(updateNav);}
  window.addEventListener('scroll',queueNav,{passive:true});
  window.addEventListener('resize',queueNav);
  new ResizeObserver(queueNav).observe(storyLayout);
  new ResizeObserver(queueNav).observe(reportNav);
  updateNav();
  const navLinks=[...document.querySelectorAll('.report-nav>nav a')];
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)navLinks.forEach(a=>{const on=a.hash==='#'+entry.target.id;a.classList.toggle('current',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});});},{rootMargin:'-110px 0px -55% 0px'});
  navLinks.forEach(a=>{const target=document.querySelector(a.hash);if(target)observer.observe(target);});
  const charts=[...document.querySelectorAll('.gh-chart')];
  charts.forEach(chart=>{
    chart.classList.add('bars-pending');
    chart.querySelectorAll('.gh-bar-track i').forEach((bar,index)=>bar.style.setProperty('--bar-index',index));
  });
  const chartObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('is-chart-visible');
    chartObserver.unobserve(entry.target);
  }),{threshold:.24,rootMargin:'0px 0px -8% 0px'});
  charts.forEach(chart=>chartObserver.observe(chart));
})();
