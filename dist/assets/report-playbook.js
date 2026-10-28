(()=>{
 const section=document.querySelector('#playbook'),toggle=section?.querySelector('.playbook-toggle'),menu=section?.querySelector('.playbook-options');if(!toggle||!menu)return;
 const options=[...menu.querySelectorAll('[data-market]')],download=menu.querySelector('.playbook-download-selected'),note=menu.querySelector('.playbook-download-note');
 const mobile=matchMedia('(max-width:900px)'),picker=menu.parentElement,grid=menu.querySelector('.playbook-options-grid');
 const locale=(document.documentElement.lang||'en').split('-')[0];
 const copy={
  en:['Select your market','Select one market','Download PDF',"PDF downloads aren't available yet."],
  th:['เลือกตลาดของคุณ','เลือกหนึ่งตลาด','ดาวน์โหลด PDF','ยังไม่สามารถดาวน์โหลด PDF ได้ในขณะนี้'],
  es:['Selecciona tu mercado','Selecciona un mercado','Descargar PDF','Las descargas de PDF aún no están disponibles.'],
  it:['Seleziona il tuo mercato','Seleziona un mercato','Scarica il PDF','I download PDF non sono ancora disponibili.'],
  de:['Wählen Sie Ihren Markt','Wählen Sie einen Markt','PDF herunterladen','PDF-Downloads sind noch nicht verfügbar.'],
  fr:['Sélectionnez votre marché','Sélectionnez un marché','Télécharger le PDF','Les téléchargements PDF ne sont pas encore disponibles.'],
  pt:['Selecione o seu mercado','Selecione um mercado','Descarregar PDF','Os downloads de PDF ainda não estão disponíveis.']
 }[locale]||['Select your market','Select one market','Download PDF',"PDF downloads aren't available yet."];
 menu.querySelector(':scope>p').textContent=copy[1];download.textContent=copy[2];
 grid.setAttribute('role','radiogroup');grid.setAttribute('aria-label',copy[1]);
 options.forEach((button,i)=>{button.removeAttribute('aria-pressed');button.setAttribute('role','radio');button.setAttribute('aria-checked','false');button.tabIndex=i===0?0:-1;});

 const dialog=document.createElement('dialog');dialog.className='playbook-mobile-dialog';dialog.setAttribute('aria-label',copy[0]);
 const context=document.createElement('div');context.className='report-playbook playbook-modal-context';dialog.append(context);document.body.append(dialog);
 const heading=document.createElement('div');heading.className='playbook-modal-heading';heading.innerHTML='<strong>Select your market</strong><button type="button" aria-label="Close market selector"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>';heading.querySelector('strong').textContent=copy[0];menu.prepend(heading);
 const rail=document.createElement('div');rail.className='playbook-scroll-rail';rail.setAttribute('aria-hidden','true');rail.innerHTML='<i></i>';menu.append(rail);
 let oldOverflow='',locked=false;
 function updateRail(){if(!dialog.open)return;const height=grid.clientHeight,max=grid.scrollHeight-height;rail.hidden=max<=1;rail.style.top=grid.offsetTop+'px';rail.style.height=height+'px';const thumb=Math.max(28,height*height/grid.scrollHeight);rail.firstElementChild.style.height=thumb+'px';rail.firstElementChild.style.transform=`translateY(${max>0?(height-thumb)*grid.scrollTop/max:0}px)`;}
 function mountModal(){context.append(menu);dialog.showModal();oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';locked=true;requestAnimationFrame(updateRail);}
 function unmountModal(){if(dialog.open)dialog.close();picker.append(menu);if(locked){document.body.style.overflow=oldOverflow;locked=false;}}
 function open(value,focus=false){toggle.setAttribute('aria-expanded',String(value));menu.hidden=!value;if(value&&mobile.matches){if(!dialog.open)mountModal();}else unmountModal();if(focus)(value?options.find(b=>b.getAttribute('aria-checked')==='true')||options[0]:toggle).focus();}
 heading.querySelector('button').addEventListener('click',()=>open(false,true));
 dialog.addEventListener('cancel',e=>{e.preventDefault();open(false,true);});
 dialog.addEventListener('click',e=>{if(e.target===dialog)open(false,true);});
 grid.addEventListener('scroll',updateRail,{passive:true});new ResizeObserver(updateRail).observe(grid);
 mobile.addEventListener('change',()=>{if(!menu.hidden)open(true);});
 toggle.addEventListener('click',()=>open(menu.hidden));
 toggle.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();open(true,true);}});
 function select(button){
  options.forEach(option=>{const selected=option===button;option.setAttribute('aria-checked',String(selected));option.tabIndex=selected?0:-1;});
  toggle.querySelector('span').textContent=button.querySelector('span').textContent;
  download.disabled=false;download.textContent=copy[2];note.textContent='';
 }
 options.forEach(button=>button.addEventListener('click',()=>select(button)));
 download.addEventListener('click',()=>{note.textContent=copy[3];});
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){e.preventDefault();open(false,true);}const i=options.indexOf(e.target);if(i<0)return;const n=(e.key==='ArrowDown'||e.key==='ArrowRight')?(i+1)%options.length:(e.key==='ArrowUp'||e.key==='ArrowLeft')?(i+options.length-1)%options.length:e.key==='Home'?0:e.key==='End'?options.length-1:-1;if(n>=0){e.preventDefault();select(options[n]);options[n].focus();}});
 document.addEventListener('pointerdown',e=>{if(!dialog.open&&!picker.contains(e.target))open(false);});
 section.addEventListener('focusout',()=>setTimeout(()=>{if(!dialog.open&&!picker.contains(document.activeElement))open(false);},0));
 // These CTAs deliberately scroll through the report; selection opens only here.
 document.querySelectorAll('a[href="#playbook"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});history.replaceState(null,'','#playbook');},true));
})();
