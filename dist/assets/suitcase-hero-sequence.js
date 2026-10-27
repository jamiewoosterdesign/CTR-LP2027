(()=>{
 const base=document.querySelector('#report-top .suitcase-video');
 if(!base)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const fallbackTest=new URLSearchParams(location.search).get('hero')==='fallback';
 const names=['backpack-pink','pink-orange','orange-duffel','duffel-leather','leather-silver'];
 let visible=true,started=false,failed=false,loaded=false,loading=false,switching=false;
 let active=base,index=-1,clips=[],urls=[],lastTime=0;
 const allowed=()=>started&&visible&&!document.hidden&&!reduced.matches;
 const sync=()=>{if(allowed())active.play().catch(()=>{});else active.pause();};
 base.muted=true;
 base.loop=true;
 // The short, already approved loop is always the first request.
 const start=()=>{
  if(started||reduced.matches)return;
  started=true;
  base.src=fallbackTest?base.dataset.fallbackDesktop:base.dataset.desktop;
  base.load();sync();
 };
 const failSequence=()=>{
  failed=true;loaded=false;switching=false;
  const old=active;active=base;index=-1;
  base.currentTime=0;
  if(allowed())base.play().then(()=>{base.classList.add('is-playing');if(old!==base){old.pause();old.classList.remove('is-playing');}}).catch(()=>{});
 };
 const show=async(next,nextIndex)=>{
  if(switching||!allowed())return;
  switching=true;
  const old=active;
  try{
   next.currentTime=0;
   await next.play();
   // Keep the old frame visible until the next decoder presents a frame.
   if(next.requestVideoFrameCallback)await new Promise(resolve=>next.requestVideoFrameCallback(resolve));
   if(!allowed()){next.pause();switching=false;return;}
   next.classList.add('is-playing');
   old.classList.remove('is-playing');old.pause();
   active=next;index=nextIndex;lastTime=next.currentTime;switching=false;
  }catch{failSequence();}
 };
 const preload=async()=>{
  if(loading||loaded||failed||fallbackTest||reduced.matches)return;
  loading=true;
  try{
   // Fetch entire files, not just metadata, before permitting the longer loop.
   for(const name of names){
    const response=await fetch('/assets/hero-'+name+'.mp4');
    if(!response.ok)throw Error('Clip unavailable');
    const url=URL.createObjectURL(await response.blob());urls.push(url);
    const v=document.createElement('video');
    v.className='suitcase-image suitcase-video';v.muted=true;v.playsInline=true;v.preload='auto';
    v.setAttribute('aria-hidden','true');v.tabIndex=-1;
    // A square mobile viewport crops the bag on the right of the wide frames.
    v.style.objectPosition='75% center';v.style.transition='none';
    base.after(v);clips.push(v);
    await new Promise((resolve,reject)=>{v.addEventListener('loadeddata',resolve,{once:true});v.addEventListener('error',reject,{once:true});v.src=url;v.load();});
    const i=clips.length-1;
    v.addEventListener('ended',()=>{if(active===v)show(clips[i+1]||base,i+1<clips.length?i+1:-1);});
    v.addEventListener('error',failSequence);
   }
   loaded=true;
  }catch{failed=true;for(const v of clips)v.remove();clips=[];for(const url of urls)URL.revokeObjectURL(url);urls=[];}
  loading=false;
 };
 base.style.transition='none';
 base.style.objectPosition='75% center';
 base.addEventListener('playing',()=>{if(active===base)base.classList.add('is-playing');preload();});
 base.addEventListener('error',()=>{
  if(base.src.endsWith(base.dataset.fallbackDesktop)){base.classList.remove('is-playing');return;}
  failed=true;base.src=base.dataset.fallbackDesktop;base.load();sync();
 });
 const frame=()=>{
  if(active===base&&!switching){
   const time=base.currentTime;
   if(loaded&&!failed&&lastTime<6&&time>=6&&time<6.4&&allowed())show(clips[0],0);
   lastTime=time;
  }
  requestAnimationFrame(frame);
 };
 requestAnimationFrame(frame);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(base.closest('section'));
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{if(!started)start();sync();if(!reduced.matches&&started)preload();});
 // Resume an ended clip if the tab was hidden exactly at a handoff.
 document.addEventListener('visibilitychange',()=>{if(allowed()&&active.ended&&index>=0)show(clips[index+1]||base,index+1<clips.length?index+1:-1);});
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
