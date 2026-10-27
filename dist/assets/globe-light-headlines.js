(() => {
  const stories=[["discovery", "discover", "Every search is a new doorway.", ["OTAs", "Search", "Recommendations"], ["Keep OTA listings complete and current. They are a research doorway as well as a booking channel.", "Answer practical questions on your website so a search can become an informed room choice.", "Make the stay worth sharing, and help prospective guests find credible reviews."]], ["experience", "experience", "Make the upgrade worth it.", ["The room", "The comfort", "The details"], ["Show the actual room guests can choose, with an honest sense of its space and layout.", "Bring bedding, restful sleep and everyday comfort into focus.", "Show the thoughtful details: bedside lighting, useful surfaces and the small comforts within reach."]], ["events", "commit", "An occasion becomes a journey.", ["The occasion", "The journey", "The stay"], ["An event puts a date on the calendar. Make relevant local occasions easy to discover.", "Show how to reach venues and what to expect on busy dates.", "Help guests plan arrival and departure around the occasion with clear service information."]], ["purpose", "value", "A higher price needs a clear purpose.", ["The purpose", "The conditions", "The impact"], ["Explain the destination issue a contribution is intended to address.", "Make the terms and any guarantees visible before the guest commits.", "Show how a contribution benefits the destination and its communities."]]];
  stories.forEach(([id,type,title,labels,captions])=>{
    const story=document.getElementById('story-'+id); if(!story)return;
    story.classList.add('has-explorer');
    const card=story.querySelector('.gh-change');
    const badge=story.querySelector('.gh-delta');
    const delta=badge.textContent.match(/\d+/)?.[0];
    if(delta) badge.innerHTML=`<span class="delta-plus" aria-hidden="true">+</span><strong>${delta}</strong><span class="delta-percent" aria-hidden="true">%</span>`;

    const panel=document.createElement('section');panel.className='headline-explorer';panel.setAttribute('aria-label',title);panel.dataset.scene=type;panel.dataset.choice='0';
    panel.innerHTML=`<div class="hx-top"><span class="hx-label">Explore the hotel opportunity</span></div><h4>${title}</h4><div class="hx-stage"><div class="hx-orbit"></div><div class="hx-art" aria-hidden="true"></div></div><div class="hx-options" role="group" aria-label="Explore ${id}">${labels.map((label,i)=>`<button type="button" aria-pressed="${i===0}" data-option="${i}">${label}</button>`).join('')}</div><p class="hx-caption" aria-live="polite">${captions[0]}</p>`;
    // Preserve the report's exact figures and disclaimer in a compact comparison strip.
    card.prepend(panel);
    const stat=document.createElement('div');stat.className='hx-stat';
    [...card.children].filter(child=>child!==panel).forEach(child=>stat.append(child));
    const intro=document.createElement('div');intro.className='hx-stat-intro';
    intro.append(stat.querySelector('.gh-eyebrow'),stat.querySelector('.gh-metric'));
    stat.prepend(intro);
    card.closest('.gh-evidence').before(stat);
    document.dispatchEvent(new CustomEvent('ctr-mount-scene',{detail:{container:panel.querySelector('.hx-art'),type}}));
    const buttons=[...panel.querySelectorAll('button')];
    buttons.forEach((button,i)=>button.addEventListener('click',()=>{
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      panel.querySelector('.hx-caption').textContent=captions[i];
      panel.dataset.choice=String(i);
      panel.style.setProperty('--scene-turn',`${(i-1)*9}deg`);
      panel.style.setProperty('--scene-lift',`${i===1?-8:0}px`);
    }));
  });
})();

// Keep keyboard- and touch-selected mobile tabs inside their own scroll strip.
(() => {
  const reveal = event => {
    if (!matchMedia('(max-width:900px)').matches) return;
    const button=event.target.closest('.journey-tabs button');
    if(!button)return;
    const strip=button.parentElement, b=button.getBoundingClientRect(), s=strip.getBoundingClientRect();
    const delta=b.left<s.left+4?b.left-s.left-4:b.right>s.right-4?b.right-s.right+4:0;
    if(delta)strip.scrollBy({left:delta,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  };
  document.addEventListener('click',reveal);
  document.addEventListener('focusin',reveal);
})();
