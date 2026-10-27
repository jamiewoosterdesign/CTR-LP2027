// Append fixed mobile open-menu artboards, using the current report's navigation content.
module.exports=function addMobileNavigation(page,live){
 const header=live.match(/<header class="report-nav"[\s\S]*?<\/header>/)?.[0];
 const stories=live.match(/<aside class="sb-nav"[\s\S]*?<\/aside>/)?.[0];
 const countries=live.match(/<aside class="report-side-nav profile-country-nav"[\s\S]*?<\/aside>/)?.[0];
 if(!header||!stories||!countries)throw Error('Missing source navigation');
 function links(markup){return [...markup.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m,i)=>m[0].replace(/ class="[^"]*"/g,'').replace(/ aria-current="[^"]*"/g,'').replace('<a ',`<a${i===0?' class="current" aria-current="page"':''} `).replace(/loading="lazy"/g,'loading="eager"').replace(/(\/assets\/flag-[a-z]+)\.png/g,'$1.svg')).join('');}
 const mainLinks=links(header.match(/<nav\b[\s\S]*?<\/nav>/)[0]);
 const storyLinks=links(stories.match(/<nav\b[\s\S]*?<\/nav>/)[0]);
 const countryLinks=links(countries.match(/<nav\b[\s\S]*?<\/nav>/)[0]);
 const chevron='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>';
 const html=`<!-- static-mobile-navigation:start --><section id="static-mobile-navigation" aria-label="Mobile navigation open states">
 <h2>Mobile navigation · open states</h2>
 <section class="smn-example"><h3>Main navigation</h3><div class="smn-artboard"><header class="smn-header"><img src="/assets/siteminder-mark-dark.svg" width="24" height="24" alt="SiteMinder"><span>Changing Traveller<br>Report 2027</span><span class="smn-cta">Hotelier’s Playbook</span><button type="button" aria-label="Close navigation" aria-expanded="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></button></header><nav class="smn-main" aria-label="Static mobile main navigation">${mainLinks}</nav></div></section>
 <section class="smn-example"><h3>Global Signals navigation</h3><div class="smn-artboard"><div class="smn-section-toggle"><strong>Global Signals</strong>${chevron}</div><nav class="smn-list" aria-label="Static mobile Global Signals navigation">${storyLinks}</nav></div></section>
 <section class="smn-example"><h3>Traveller Profiles navigation</h3><div class="smn-artboard"><div class="smn-section-toggle smn-country-toggle"><span>TRAVELLER PROFILES</span><strong>Australia</strong>${chevron}</div><nav class="smn-list smn-countries" aria-label="Static mobile traveller market navigation"><p>Select a market</p>${countryLinks}</nav></div></section>
 </section><!-- static-mobile-navigation:end -->`;
 page=page.replace(/<!-- static-mobile-navigation:start -->[\s\S]*?<!-- static-mobile-navigation:end -->/,'');
 return page.replace('</main>',html+'</main>');
};
