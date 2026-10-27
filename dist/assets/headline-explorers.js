(() => {
  const stories=[
    ['discovery','discover','Every search is a new doorway.', ['OTAs','Search','Recommendations'], ['Discovery begins on an OTA. Keep your listing complete, current and easy to compare.','Search connects inspiration with intent. Help travellers find the answers on your own website.','Recommendations build confidence. Make the experience worth sharing.']],
    ['experience','experience','Show the stay. Not just the room.', ['The view','The comfort','The experience'], ['A distinctive view gives guests a reason to choose this room. Show what makes it different.','Better sleep makes an upgrade tangible. Bring bedding, space and comfort into focus.','Local experiences turn accommodation into part of the trip, not just somewhere to sleep.']],
    ['flexibility','commit','Plans change. Confidence stays.', ['Before booking','Before arrival','At the stay'], ['Make cancellation terms clear before the guest commits. Flexibility starts with confidence.','When plans shift, make changing dates simple. Keep the guest, even when the itinerary changes.','Early arrival or a later departure can turn a practical need into a better stay.']],
    ['value','value','The rate is only part of the value.', ['Room only','Useful extras','The whole stay'], ['A room-only rate is easy to compare. It does not tell the whole story of a stay.','Bring useful inclusions into view. Help guests understand what they actually receive.','Connect the inclusions to the experience. Value is what the guest gets, not simply what they pay.']]
  ];
  stories.forEach(([id,type,title,labels,captions])=>{
    const story=document.getElementById('story-'+id); if(!story)return;
    story.classList.add('has-explorer');
    const card=story.querySelector('.gh-change');
    const panel=document.createElement('section');panel.className='headline-explorer';panel.setAttribute('aria-label',title);
    panel.innerHTML=`<div class="hx-top"><span class="hx-label">Explore the shift</span></div><h4>${title}</h4><div class="hx-stage"><div class="hx-orbit"></div><div class="hx-art" aria-hidden="true"></div></div><div class="hx-options" role="group" aria-label="Explore ${id}">${labels.map((label,i)=>`<button type="button" aria-pressed="${i===0}" data-option="${i}">${label}</button>`).join('')}</div><p class="hx-caption" aria-live="polite">${captions[0]}</p>`;
    // Preserve the report's exact figures and disclaimer in a compact comparison strip.
    card.prepend(panel);
    const stat=document.createElement('div');stat.className='hx-stat';
    [...card.children].filter(child=>child!==panel).forEach(child=>stat.append(child));
    const intro=document.createElement('div');intro.className='hx-stat-intro';
    intro.append(stat.querySelector('.gh-eyebrow'),stat.querySelector('.gh-metric'));
    stat.prepend(intro);
    card.closest('.gh-evidence').after(stat);
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
