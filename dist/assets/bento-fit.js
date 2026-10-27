(()=>{
 const grids=[...document.querySelectorAll('.ib-grid')],desktop=matchMedia('(min-width:901px)');let timer;
 function fit(){
  grids.forEach(grid=>{
   const rows=[...grid.querySelectorAll('.ib-row:not([data-bento-static])')];rows.forEach(r=>r.style.removeProperty('--bento-row-height'));
   if(!desktop.matches)return;
   const clone=grid.cloneNode(true);clone.classList.add('bento-measure');clone.style.cssText=`position:fixed;left:0;top:0;width:${grid.clientWidth}px;visibility:hidden;pointer-events:none;z-index:-100;`;
   clone.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));clone.setAttribute('aria-hidden','true');clone.inert=true;grid.parentElement.append(clone);
   [...clone.querySelectorAll('.ib-row:not([data-bento-static])')].forEach((row,index)=>{
    const cards=[...row.querySelectorAll('.ib-card')];let needed=rows[index].getBoundingClientRect().height;
    row.classList.add('has-open');
    cards.forEach(card=>{
     cards.forEach(c=>c.classList.toggle('is-expanded',c===card));
     const panel=card.querySelector('.ib-full'),heading=card.querySelector('.ib-heading');
     const cs=getComputedStyle(card);
     needed=Math.max(needed,heading.getBoundingClientRect().height+panel.getBoundingClientRect().height+parseFloat(cs.rowGap)+parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom)+4);
    });
    rows[index].style.setProperty('--bento-row-height',Math.ceil(needed)+'px');
   });clone.remove();
  });
 }
 function queue(){clearTimeout(timer);timer=setTimeout(fit,100);}
 addEventListener('resize',queue,{passive:true});desktop.addEventListener('change',queue);
 document.fonts.ready.then(fit);
})();
