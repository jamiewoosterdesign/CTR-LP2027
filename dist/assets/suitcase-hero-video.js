(()=>{
 const video=document.querySelector('#report-top .suitcase-video');
 if(!video)return;
 const mobile=matchMedia('(max-width:900px)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let visible=true,ready=false,source='',failed=false;
 const fallbackTest=new URLSearchParams(location.search).get('hero')==='fallback';
 const sync=()=>{
  if(!ready||reduced.matches||document.hidden||!visible){video.pause();return;}
  const useFallback=fallbackTest||failed;
  const next=useFallback?(mobile.matches?video.dataset.fallbackMobile:video.dataset.fallbackDesktop):(mobile.matches?video.dataset.mobile:video.dataset.desktop);
  if(source!==next){source=next;video.classList.remove('is-playing');video.src=next;video.load();}
  video.play().catch(()=>{});
 };
 video.muted=true;
 video.addEventListener('playing',()=>video.classList.add('is-playing'));
 video.addEventListener('error',()=>{video.classList.remove('is-playing');if(!failed&&!fallbackTest){failed=true;sync();}});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(video.closest('section'));
 mobile.addEventListener('change',sync);
 reduced.addEventListener('change',()=>{if(reduced.matches)video.classList.remove('is-playing');sync();});
 document.addEventListener('visibilitychange',sync);
 const start=()=>{ready=true;sync();};
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
