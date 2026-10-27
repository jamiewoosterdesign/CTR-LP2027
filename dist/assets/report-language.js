(()=>{
 const header=document.querySelector('.report-nav'),picker=header?.querySelector('.report-language'),nav=header?.querySelector('#report-menu'),cta=nav?.querySelector('.report-mobile-playbook');if(!picker||!nav||!cta)return;
 const toggle=picker.querySelector('.report-language-toggle'),menu=picker.querySelector('.report-language-menu'),options=[...menu.querySelectorAll('[data-language]')],mobile=matchMedia('(max-width:1100px)');
 const actions=document.createElement('div');actions.className='report-language-actions';nav.append(actions);actions.append(cta);
 const dialog=document.createElement('dialog');dialog.className='report-language-dialog';dialog.setAttribute('aria-label','Select language');
 const context=document.createElement('div');context.className='report-language';
 const heading=document.createElement('div');heading.className='report-language-heading';heading.innerHTML='<strong>Select language</strong><button type="button" aria-label="Close language selector"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>';
 context.append(heading);dialog.append(context);document.body.append(dialog);let previousOverflow='',locked=false;
 function open(value,focus=false){
  menu.hidden=!value;toggle.setAttribute('aria-expanded',String(value));
  if(value&&mobile.matches){context.append(menu);if(!dialog.open){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';locked=true;dialog.showModal();}}
  else {if(dialog.open)dialog.close();picker.append(menu);if(locked){document.body.style.overflow=previousOverflow;locked=false;}}
  if(focus)(value?options.find(b=>b.getAttribute('aria-selected')==='true')||options[0]:toggle).focus();
 }
 heading.querySelector('button').addEventListener('click',()=>open(false,true));
 dialog.addEventListener('pointerdown',e=>e.stopPropagation());
 dialog.addEventListener('cancel',e=>{e.preventDefault();open(false,true);});
 dialog.addEventListener('click',e=>{if(e.target===dialog)open(false,true);});
 function mount(){open(false);toggle.setAttribute('aria-haspopup',mobile.matches?'dialog':'listbox');if(mobile.matches)actions.append(picker);else header.insertBefore(picker,header.querySelector(':scope>.report-cta'));}
 mobile.addEventListener('change',mount);mount();toggle.addEventListener('click',()=>open(menu.hidden));
 toggle.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();open(true,true);}});
 options.forEach(button=>button.addEventListener('click',()=>{options.forEach(b=>b.setAttribute('aria-selected',String(b===button)));toggle.querySelector('img').src=button.querySelector('img').src;toggle.querySelector('span').textContent=button.dataset.language.toUpperCase();toggle.setAttribute('aria-label','Select language, '+button.textContent.trim());open(false,true);}));
 function handleKeys(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();open(false,true);}const i=options.indexOf(e.target);if(i<0)return;const n=e.key==='ArrowDown'?(i+1)%options.length:e.key==='ArrowUp'?(i+options.length-1)%options.length:e.key==='Home'?0:e.key==='End'?options.length-1:-1;if(n>=0){e.preventDefault();options[n].focus();}}
 picker.addEventListener('keydown',handleKeys);dialog.addEventListener('keydown',handleKeys);
 document.addEventListener('pointerdown',e=>{if(!dialog.open&&!picker.contains(e.target))open(false);});
 new MutationObserver(()=>{if(!header.classList.contains('menu-open')&&mobile.matches)open(false);}).observe(header,{attributes:true,attributeFilter:['class']});
})();
