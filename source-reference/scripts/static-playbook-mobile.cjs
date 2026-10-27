// Reuse the export's existing region selector in a mobile-sized, permanently open modal.
module.exports=function addMobilePlaybook(page){
 if(page.includes('id="static-playbook-mobile"'))return page;
 const match=page.match(/<section class="static-playbook-menu[^>]*>([\s\S]*?)<\/section>/);
 if(!match)throw Error('Missing static playbook selector');
 let menu=match[1].replace(/id="([^"]+)"/g,'id="$1-mobile"');
 menu=menu.replace(/(<div class="playbook-options"[^>]*>)/,'$1<div class="playbook-modal-heading"><strong>Select your markets</strong><button type="button" aria-label="Close market selector"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>');
 menu=menu.replace('<div class="playbook-options-grid">','<div class="static-mobile-list"><div class="playbook-options-grid">').replace('<div class="playbook-download-footer">','<div class="playbook-scroll-rail" aria-hidden="true"><i></i></div></div><div class="playbook-download-footer">');
 const example='<section id="static-playbook-mobile" aria-label="Mobile Hotelier’s Playbook modal"><p class="static-mobile-caption">Mobile market selector</p><div class="static-mobile-backdrop"><div class="playbook-mobile-dialog"><div class="report-playbook playbook-modal-context">'+menu+'</div></div></div></section>';
 return page.replace(match[0],match[0]+example);
};
