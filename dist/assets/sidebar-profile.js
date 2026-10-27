(() => {
  const reportNav = document.querySelector('.report-nav');
  let frame = 0;
  const navs = [...document.querySelectorAll('.report-side-nav')];
  if (!navs.length) return;
  const headlineNav = document.querySelector('.headline-side-nav');
  const headlineLinks = [...(headlineNav?.querySelectorAll('nav a') || [])];
  const headlineTargets = headlineLinks.map(link => document.querySelector(link.hash));

  const navOffset = nav => reportNav.offsetHeight + (matchMedia('(max-width: 900px)').matches ? nav.querySelector('.side-nav-toggle').offsetHeight : 0) + 18;
  function selectHeadline(index) {
    headlineLinks.forEach((link, i) => {
      const active = i === index;
      link.classList.toggle('current', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (index >= 0) headlineNav.querySelector('.side-nav-toggle strong').textContent = headlineLinks[index].textContent.trim();
  }
  function update() {
    frame = 0;
    if (!headlineNav) return;
    const line = navOffset(headlineNav) + 4;
    let active = 0;
    headlineTargets.forEach((target, index) => {
      if (target && target.getBoundingClientRect().top <= line) active = index;
    });
    selectHeadline(active);
  }
  function queueUpdate() { if (!frame) frame = requestAnimationFrame(update); }

  navs.forEach(nav => {
    const toggle = nav.querySelector('.side-nav-toggle');
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      navs.forEach(item => item.classList.remove('is-open'));
      nav.classList.toggle('is-open', open);
      navs.forEach(item => item.querySelector('.side-nav-toggle').setAttribute('aria-expanded', String(item === nav && open)));
    });
    [...nav.querySelectorAll('nav a')].forEach(link => link.addEventListener('click', event => {
      const target = document.querySelector(link.hash);
      if (!target) return;
      event.preventDefault();
      if (nav === headlineNav) selectHeadline(headlineLinks.indexOf(link));
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      const top = target.getBoundingClientRect().top + scrollY - navOffset(nav) + 2;
      scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', link.hash);
    }));
  });
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.report-side-nav')) {
      navs.forEach(nav => {
        nav.classList.remove('is-open');
        nav.querySelector('.side-nav-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      navs.forEach(nav => {
        nav.classList.remove('is-open');
        nav.querySelector('.side-nav-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate);
  new ResizeObserver(queueUpdate).observe(reportNav);

  document.querySelectorAll('.report-signals-sidebar .gh-story').forEach(story => {
    const support = story.querySelector('.gh-support');
    if (!support || support.closest('details')) return;
    const details = document.createElement('details');
    details.className = 'story-details';
    const summary = document.createElement('summary');
    summary.innerHTML = 'Reveal supporting signals <i class="report-arrow chevron-down" aria-hidden="true"></i>';
    support.before(details);
    details.append(summary, support);
  });

  const journeyContent = {
    discover: {
      orbit: 'Search', kicker: 'Discovery behaviour',
      heading: 'Win the search result before the room comparison.',
      copy: 'Australian travellers show the highest search-engine usage globally. Clear page titles, current imagery and useful destination information make the first impression work harder.',
      actions: ['Use specific room and location language', 'Keep property details consistent across channels', 'Answer high-intent questions on the landing page']
    },
    compare: {
      orbit: 'Location', kicker: 'Comparison behaviour',
      heading: 'Translate the map pin into a confident choice.',
      copy: 'Location details are scrutinised closely. Help travellers understand not only where the property is, but what the location makes easier, faster or more enjoyable.',
      actions: ['Show realistic walking and transfer times', 'Describe the neighbourhood in plain language', 'Place local proof beside room information']
    },
    commit: {
      orbit: 'Room choice', kicker: 'Commitment behaviour',
      heading: 'Make the standard room feel anything but basic.',
      copy: 'Standard rooms lead Australian preferences at 40%, closely followed by superior rooms at 39%. Clear distinctions help travellers understand where an upgrade adds genuine value.',
      actions: ['Show the practical difference between room types', 'Make every inclusion visible before checkout', 'Explain why an upgrade is worth the price']
    }
  };
  const journeyTabs = [...document.querySelectorAll('.journey-tabs button')];
  const journeyPanel = document.querySelector('#journey-panel');
  // Small globes: cached geometry, depth-batched strokes, and visibility-owned scheduling.
  const miniGlobes = new Set();
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let miniGlobeFrame = 0, miniGlobeTimer = 0;
  const miniSegments = [];
  const spherePoint = (lon,lat) => [Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)];
  const addMiniLine = points => {for(let i=1;i<points.length;i++)miniSegments.push(...points[i-1],...points[i]);};
  for(let j=0;j<12;j++)addMiniLine(Array.from({length:49},(_,i)=>spherePoint(j*Math.PI/6,-Math.PI/2+i*Math.PI/48)));
  for(let j=0;j<5;j++)addMiniLine(Array.from({length:145},(_,i)=>spherePoint(i*Math.PI/72,-Math.PI/3+j*Math.PI/6)));
  const miniGeometry = new Float32Array(miniSegments);
  const miniLight = document.body.classList.contains('report-regions');
  const miniPitchCos=Math.cos(-.2), miniPitchSin=Math.sin(-.2);
  function drawMiniGlobe(item,now){
    const {canvas,context,width:w,height:h,dpr}=item;
    if(!w||!h)return;
    const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
    if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
    context.setTransform(dpr,0,0,dpr,0,0);
    context.clearRect(0,0,w,h);
    const radius=Math.min(w,h)*.37,cx=w*.43,cy=h*.5;
    const yaw=reduceMotion.matches?.55:now*.00016,sy=Math.sin(yaw),cosYaw=Math.cos(yaw);
    const paths=Array.from({length:5},()=>new Path2D());
    for(let i=0;i<miniGeometry.length;i+=6){
      const ax=miniGeometry[i]*cosYaw+miniGeometry[i+2]*sy,az=-miniGeometry[i]*sy+miniGeometry[i+2]*cosYaw;
      const ay=miniGeometry[i+1]*miniPitchCos-az*miniPitchSin,ad=miniGeometry[i+1]*miniPitchSin+az*miniPitchCos;
      const bx=miniGeometry[i+3]*cosYaw+miniGeometry[i+5]*sy,bz=-miniGeometry[i+3]*sy+miniGeometry[i+5]*cosYaw;
      const by=miniGeometry[i+4]*miniPitchCos-bz*miniPitchSin,bd=miniGeometry[i+4]*miniPitchSin+bz*miniPitchCos;
      const depth=Math.max(0,Math.min(4,Math.floor((ad+bd+2)*1.25)));
      paths[depth].moveTo(cx+ax*radius,cy-ay*radius);paths[depth].lineTo(cx+bx*radius,cy-by*radius);
    }
    context.strokeStyle=miniLight?'#0878a5':'#8cddff';
    for(let i=0;i<5;i++){context.globalAlpha=.12+(i+.5)/5*.62;context.lineWidth=.65+(i+.5)/5*.55;context.stroke(paths[i]);}
    context.globalAlpha=miniLight?.58:.72;context.lineWidth=1;context.beginPath();context.arc(cx,cy,radius,0,Math.PI*2);context.stroke();context.globalAlpha=1;
    item.dirty=false;
  }
  function miniNeedsFrame(){return !document.hidden&&[...miniGlobes].some(i=>i.visible&&i.canvas.isConnected&&i.width&&i.height&&(!reduceMotion.matches||i.dirty));}
  function wakeMiniGlobes(){if(!miniGlobeFrame&&!miniGlobeTimer&&miniNeedsFrame())miniGlobeFrame=requestAnimationFrame(runMiniGlobes);}
  function stopMiniGlobes(){cancelAnimationFrame(miniGlobeFrame);clearTimeout(miniGlobeTimer);miniGlobeFrame=miniGlobeTimer=0;}
  function disposeMiniGlobe(item){miniVisibility.unobserve(item.canvas);miniResize.unobserve(item.canvas);miniGlobes.delete(item);}
  function clearMiniGlobe(container){for(const item of miniGlobes)if(item.canvas.parentElement===container)disposeMiniGlobe(item);if(!miniNeedsFrame())stopMiniGlobes();}
  function runMiniGlobes(now){
    miniGlobeFrame=0;
    for(const item of miniGlobes){if(!item.canvas.isConnected){disposeMiniGlobe(item);continue;}if(item.visible&&!document.hidden&&(!reduceMotion.matches||item.dirty))drawMiniGlobe(item,now);}
    if(miniNeedsFrame())miniGlobeTimer=setTimeout(()=>{miniGlobeTimer=0;wakeMiniGlobes();},1000/30);
  }
  const miniVisibility=new IntersectionObserver(entries=>{
    for(const entry of entries)for(const item of miniGlobes)if(item.canvas===entry.target){item.visible=entry.isIntersecting;item.dirty=true;}
    if(!miniNeedsFrame())stopMiniGlobes();else wakeMiniGlobes();
  },{rootMargin:'0px'});
  const miniResize=new ResizeObserver(entries=>{
    for(const entry of entries)for(const item of miniGlobes)if(item.canvas===entry.target){item.width=entry.contentRect.width;item.height=entry.contentRect.height;item.dpr=Math.min(devicePixelRatio||1,1.5);item.dirty=true;}
    wakeMiniGlobes();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMiniGlobes();else{miniGlobes.forEach(i=>i.dirty=true);wakeMiniGlobes();}});
  reduceMotion.addEventListener('change',()=>{miniGlobes.forEach(i=>i.dirty=true);wakeMiniGlobes();});
  function mountMiniGlobe(container){
    clearMiniGlobe(container);
    container.innerHTML=`<canvas class="mini-globe-canvas" aria-hidden="true"></canvas><svg class="mini-globe-lens" viewBox="0 0 96 96" fill="none" aria-hidden="true"><circle class="lens-glass" cx="39" cy="39" r="25"/><circle cx="39" cy="39" r="20"/><path d="m56 56 25 25m-29-21 25 25"/><path class="lens-glint" d="M24 44Q39 58 54 44"/></svg>`;
    const canvas=container.querySelector('canvas');
    miniGlobes.add({canvas,context:canvas.getContext('2d'),width:0,height:0,dpr:1,visible:false,dirty:true});
    miniResize.observe(canvas);miniVisibility.observe(canvas);
  }
  const sceneCanvases = new Set();
  let sceneFrame = 0;
  const sceneResize=new ResizeObserver(entries=>{
    for(const entry of entries)for(const item of sceneCanvases)if(item.canvas===entry.target){item.bounds={width:entry.contentRect.width,height:entry.contentRect.height};item.dirty=true;}
  });
  const palette = () => document.body.classList.contains('report-regions') ? {
    line:'#0878a5', bright:'#086e98', fill:'rgba(219,240,248,.86)', fill2:'rgba(235,247,251,.92)', green:'#199f6a', glow:'rgba(18,139,184,.17)'
  } : {
    line:'#72cef4', bright:'#a1e7ff', fill:'rgba(7,50,86,.88)', fill2:'rgba(10,61,99,.9)', green:'#38db89', glow:'rgba(4,195,254,.3)'
  };
  function sceneProjector(width, height, now, type) {
    const scale = Math.min(width, height) * (type === 'experience' ? .24 : type === 'commit' ? .43 : .39);
    const yawBase = type === 'commit' ? -.26 : -.48;
    const yaw = yawBase + Math.sin(now * .00045) * .11;
    const pitch = type === 'experience' ? .42 : type === 'commit' ? -.08 : type === 'compare' ? .56 : -.48;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    return point => {
      const x1 = point[0] * cy + point[2] * sy;
      const z1 = -point[0] * sy + point[2] * cy;
      const y1 = point[1] * cp - z1 * sp;
      const z2 = point[1] * sp + z1 * cp;
      const perspective = 3.8 / (3.8 - z2);
      return [width * .48 + x1 * scale * perspective, height * .51 - y1 * scale * perspective, z2];
    };
  }
  function drawProjectedScene(item, now) {
    const { canvas, context, type, started } = item;
    if (!canvas.isConnected) {sceneResize.unobserve(canvas);return false;}
    if (!canvas.closest('.art-visible')) return true;
    // Layout dimensions remain stable while the CSS perspective transform animates.
    const bounds = item.bounds;
    if (!bounds?.width || !bounds?.height) return true;
    const choiceNow=canvas.closest('.headline-explorer')?.dataset.choice;
    if(type==='experience' && !item.dirty && choiceNow===item.lastChoice && now-item.lastDraw<1000/30)return true;
    item.lastDraw=now;item.lastChoice=choiceNow;item.dirty=false;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(bounds.width * dpr), pixelHeight = Math.round(bounds.height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);
    const colours = palette();
    const headlineScene=canvas.closest('.headline-explorer');
    const choice=Number(headlineScene?.dataset.choice||0);
    const project = sceneProjector(bounds.width, bounds.height, reduceMotion.matches ? 800 : now, type);
    const path = (points, stroke=colours.line, width=1.2, alpha=.8) => {
      const projected = points.map(project);
      context.beginPath();
      projected.forEach((point, index) => index ? context.lineTo(point[0], point[1]) : context.moveTo(point[0], point[1]));
      context.strokeStyle = stroke; context.lineWidth = width; context.globalAlpha = alpha; context.stroke();
    };
    const face = (points, fill=colours.fill, alpha=.9) => {
      const projected = points.map(project);
      context.beginPath();
      projected.forEach((point, index) => index ? context.lineTo(point[0], point[1]) : context.moveTo(point[0], point[1]));
      context.closePath(); context.fillStyle = fill; context.globalAlpha = alpha; context.fill();
      context.strokeStyle = colours.line; context.lineWidth = 1; context.globalAlpha = .65; context.stroke();
    };
    const dot = (point, radius=4, fill=colours.green) => {
      const p = project(point); context.beginPath(); context.arc(p[0],p[1],radius,0,Math.PI*2); context.fillStyle=fill; context.globalAlpha=1; context.fill();
    };
    context.save(); context.lineCap='round'; context.lineJoin='round'; context.shadowColor=colours.glow; context.shadowBlur=10;
    if (type === 'compare') {
      const folds = [-1.05,-.36,.36,1.05], heights=[.02,.18,-.06,.12];
      for (let index=0; index<3; index++) face([[folds[index],heights[index],-.7],[folds[index+1],heights[index+1],-.7],[folds[index+1],heights[index+1],.7],[folds[index],heights[index],.7]], index%2?colours.fill2:colours.fill, .9);
      folds.forEach((x,index)=>path([[x,heights[index],-.7],[x,heights[index],.7]],colours.bright,1,.62));
      [-.3,.2].forEach(z=>path(folds.map((x,index)=>[x,heights[index]+.015,z]),colours.line,.8,.42));
      const pinPoint=[.69+Math.sin(now*.0007)*.06,.14,-.23+Math.cos(now*.0007)*.08];
      const route=[[-.82,.08,.42],[-.28,.22,.08],[.12,.02,.22],pinPoint];
      path(route,colours.green,2.4,1); route.slice(0,-1).forEach(point=>dot(point,2.5));
      const pin=project(pinPoint);
      context.beginPath(); context.moveTo(pin[0],pin[1]); context.lineTo(pin[0],pin[1]-25); context.strokeStyle=colours.green; context.lineWidth=1.5; context.globalAlpha=.9; context.stroke();
      context.beginPath(); context.arc(pin[0],pin[1]-31,7,0,Math.PI*2); context.fillStyle=colours.fill2; context.globalAlpha=.95; context.fill(); context.strokeStyle=colours.green; context.stroke();
      context.beginPath(); context.arc(pin[0],pin[1]-31,2.4,0,Math.PI*2); context.fillStyle=colours.green; context.fill();
    } else if (type === 'experience') {
      const box = (x,y,z,w,h,d) => {
        face([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],colours.fill);
        face([[x+w,y,z],[x+w,y,z+d],[x+w,y+h,z+d],[x+w,y+h,z]],colours.fill);
        face([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]],colours.fill2);
      };
      // Open-front room, seen from above: walls behind the furnishings.
      face([[-1.1,-.58,-.9],[1.5,-.58,-.9],[1.5,-.58,1],[-1.1,-.58,1]],colours.fill2,.65);
      face([[-1.1,-.58,-.9],[1.5,-.58,-.9],[1.5,1.5,-.9],[-1.1,1.5,-.9]],colours.fill2,.32);
      path([[-1.1,1.5,-.9],[-1.1,-.58,-.9],[-1.1,-.58,1]],colours.line,1,.5);
      box(-.85,-.4,-.73,1.7,.95,.1);
      box(-.9,-.55,-.7,1.8,.13,1.5);
      box(-.8,-.4,-.65,1.6,.3,1.3);
      box(-.66,-.1,-.5,.56,.16,.4);box(.1,-.1,-.5,.56,.16,.4);
      path([[-.8,-.08,.16],[.8,-.08,.16]],headlineScene && choice!==1 ? colours.line : colours.green,headlineScene && choice!==1 ? 1.2 : 2.2,1);
      box(.98,-.55,-.5,.35,.38,.42);
      if(headlineScene){
        face([[-.65,.65,-.85],[.65,.65,-.85],[.65,1.4,-.85],[-.65,1.4,-.85]],colours.fill2,.7);
        path([[0,.65,-.84],[0,1.4,-.84]],colours.line,1,.7);
        path([[-.65,1.02,-.84],[.65,1.02,-.84]],colours.line,1,.7);
      }
      if(headlineScene && choice===1){
        path([[-.8,.06,-.05],[.8,.06,-.05],[.8,.06,.6],[-.8,.06,.6],[-.8,.06,-.05]],colours.green,2,1);
      }
      path([[1.15,-.15,-.3],[1.15,.4,-.3]],colours.bright,1.5,1);
      face([[.94,.3,-.3],[1.36,.3,-.3],[1.27,.53,-.3],[1.03,.53,-.3]],colours.fill2);
      if(headlineScene && choice===0){
        // Highlight the room's boundary, leaving its furnishings readable.
        path([[-1.1,1.5,-.9],[1.5,1.5,-.9],[1.5,-.58,-.9],[1.5,-.58,1],[-1.1,-.58,1],[-1.1,-.58,-.9],[-1.1,1.5,-.9]],colours.green,2,1);
        path([[-1.1,-.58,-.9],[1.5,-.58,-.9]],colours.green,2,1);
      }
      if(headlineScene && choice===2){
        // Detail focus: bedside table edges, lamp stem and shade.
        path([[.98,-.17,-.5],[1.33,-.17,-.5],[1.33,-.17,-.08],[.98,-.17,-.08],[.98,-.17,-.5]],colours.green,2.2,1);
        path([[.98,-.17,-.08],[.98,-.55,-.08],[1.33,-.55,-.08],[1.33,-.17,-.08]],colours.green,2.2,1);
        path([[1.33,-.55,-.08],[1.33,-.55,-.5],[1.33,-.17,-.5]],colours.green,2.2,1);
        path([[1.15,-.15,-.3],[1.15,.4,-.3]],colours.green,2.2,1);
        path([[.94,.3,-.3],[1.36,.3,-.3],[1.27,.53,-.3],[1.03,.53,-.3],[.94,.3,-.3]],colours.green,2.2,1);
      }

    } else if (type === 'commit') {
      face([[-.78,-.72,-.18],[.9,-.72,-.18],[.9,.72,-.18],[-.78,.72,-.18]],colours.fill,.5);
      face([[-.9,-.66,.05],[.78,-.66,.05],[.78,.78,.05],[-.9,.78,.05]],colours.fill2,.95);
      path([[-.9,.39,.06],[.78,.39,.06]],colours.bright,1.5,.82);
      [[-.58,.16,.07],[-.2,.16,.07],[.18,.16,.07],[-.58,-.08,.07],[-.2,-.08,.07],[-.58,-.32,.07]].forEach(point=>path([point,[point[0]+.18,point[1],point[2]]],colours.line,1.4,.64));
      path([[-.57,.68,.07],[-.57,.89,.07]],colours.bright,2,1); path([[.45,.68,.07],[.45,.89,.07]],colours.bright,2,1);
      if(headlineScene){const x=-.58+choice*.38;path([[x-.07,.28,.08],[x+.24,.28,.08],[x+.24,-.01,.08],[x-.07,-.01,.08],[x-.07,.28,.08]],colours.green,2,1);}
      const centre=project([.58,-.43,.1]);
      context.beginPath(); context.arc(centre[0],centre[1],20,0,Math.PI*2); context.fillStyle=colours.fill2; context.globalAlpha=.98; context.fill(); context.strokeStyle=colours.green; context.lineWidth=1.5; context.stroke();
      const progress = reduceMotion.matches ? 1 : Math.min(1, Math.max(0, (now-started-130)/420));
      const tick=[[centre[0]-8,centre[1]],[centre[0]-1,centre[1]+7],[centre[0]+11,centre[1]-8]];
      context.beginPath(); context.moveTo(tick[0][0],tick[0][1]);
      if(progress<.45){const t=progress/.45;context.lineTo(tick[0][0]+(tick[1][0]-tick[0][0])*t,tick[0][1]+(tick[1][1]-tick[0][1])*t);}else{context.lineTo(tick[1][0],tick[1][1]);const t=(progress-.45)/.55;context.lineTo(tick[1][0]+(tick[2][0]-tick[1][0])*t,tick[1][1]+(tick[2][1]-tick[1][1])*t);}
      context.strokeStyle=colours.green;context.lineWidth=3;context.globalAlpha=1;context.stroke();
    } else {
      const front=[[-.95,-.48,.16],[.35,-.48,.16],[.92,0,.16],[.35,.48,.16],[-.95,.48,.16]];
      const back=front.map(point=>[point[0],point[1],-.12]);
      face(back,colours.fill,.54);
      for(let index=0;index<front.length;index++){
        const next=(index+1)%front.length;
        face([back[index],back[next],front[next],front[index]],colours.fill,.72);
      }
      face(front,colours.fill2,.96);
      const hole=project([.46,0,.18]);
      context.beginPath();context.arc(hole[0],hole[1],5.5,0,Math.PI*2);context.fillStyle=document.body.classList.contains('report-regions')?'#f5fafc':'#062b56';context.globalAlpha=1;context.fill();context.strokeStyle=colours.line;context.stroke();
      const money=project([-.42,.02,.19]);
      context.fillStyle=colours.green;context.font=`600 ${Math.max(16,bounds.width*.16)}px Spline Sans, sans-serif`;context.textAlign='center';context.textBaseline='middle';context.globalAlpha=.96;context.fillText('$',money[0],money[1]);
      path([[-.72,-.28,.19],[-.18,-.28,.19],[.02,-.15,.19],[.02,.04,.19]],colours.green,2,1);
      path([[-.08,-.02,.19],[.02,.08,.19],[.12,-.02,.19]],colours.green,2,1);
      if(headlineScene && choice>0){
        for(let k=0;k<choice+1;k++){const x=-.65+k*.42;path([[x,-.67,.2],[x+.07,-.74,.2],[x+.2,-.56,.2]],colours.green,2.5,1);}
      }
    }
    context.restore(); context.globalAlpha=1;
    return true;
  }
  function runScenes(now) {
    sceneCanvases.forEach(item => { if (!drawProjectedScene(item,now)) sceneCanvases.delete(item); });
    sceneFrame = sceneCanvases.size ? requestAnimationFrame(runScenes) : 0;
  }
  function mount3DScene(container,type) {
    clearMiniGlobe(container);
    container.innerHTML='<canvas class="scene-3d-canvas" aria-hidden="true"></canvas>';
    const canvas=container.querySelector('canvas');
    sceneCanvases.add({canvas,context:canvas.getContext('2d'),type,started:performance.now(),bounds:null,lastDraw:-Infinity,dirty:true});
    sceneResize.observe(canvas);
    if(!sceneFrame) sceneFrame=requestAnimationFrame(runScenes);
  }
  const journeyArt = journeyPanel.querySelector('.journey-orbit');
  journeyArt.className = 'journey-art';
  [['.signal-search','discover'],['.signal-location','compare'],['.signal-comfort','value']].forEach(([selector, type]) => {
    const card = document.querySelector(selector);
    card.querySelector('.signal-icon')?.remove();
    const artwork = document.createElement('div');
    artwork.className = 'signal-art';
    if (type === 'discover') mountMiniGlobe(artwork);
    else mount3DScene(artwork,type);
    card.append(artwork);
  });
  function showJourney(stage) {
    const content = journeyContent[stage];
    journeyTabs.forEach(button => button.setAttribute('aria-selected', String(button.dataset.stage === stage)));
    if (stage === 'discover') mountMiniGlobe(journeyArt);
    else mount3DScene(journeyArt,stage);
    journeyArt.dataset.scene = stage;
    document.querySelector('#journey-kicker').textContent = content.kicker;
    document.querySelector('#journey-heading').textContent = content.heading;
    document.querySelector('#journey-copy').textContent = content.copy;
    document.querySelector('#journey-actions').innerHTML = content.actions.map(action => `<li>${action}</li>`).join('');
  }
  journeyTabs.forEach(button => button.addEventListener('click', () => showJourney(button.dataset.stage)));
  showJourney('discover');
  // Pause offscreen artwork and honour reduced-motion preferences in CSS.
  const artObserver = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('art-visible',entry.isIntersecting)), {rootMargin:'40px'});
  if (document.body.classList.contains('report-globe-light') || document.body.classList.contains('report-headline-explorers')) {
    document.addEventListener('ctr-mount-scene', event => {
      const {container,type}=event.detail;
      if(type==='discover') mountMiniGlobe(container); else mount3DScene(container,type);
      artObserver.observe(container);
    });
  }
  document.querySelectorAll('.signal-art,.journey-art').forEach(art => artObserver.observe(art));
  const gauge = document.querySelector('.activity-gauge');
  const priorityItems = [...document.querySelectorAll('.priority-item')];
  const gaugeStates = [
    {value:65,label:'Location details',meta:'Booking priority',detail:'65% prioritise location details when booking.'},
    {value:45,label:'Pillow & bedding',meta:'Essential room feature',detail:'45% select pillow and bedding, ahead of room quietness at 39%.'},
    {value:32,label:'Flexible arrival',meta:'Willing to pay extra',detail:'32% will pay extra for early check-in or late check-out.'}
  ];
  gauge.setAttribute('role','group');
  gauge.setAttribute('aria-label','Published Australian 2026 findings: 65% prioritise location details; 45% select pillow and bedding; 32% will pay extra for flexible check-in or check-out.');
  gauge.innerHTML='<svg class="gauge-svg" viewBox="0 0 280 280" aria-label="Select a ring to inspect its finding"><circle class="gauge-track" cx="140" cy="140" r="118" pathLength="100"/><circle class="gauge-value ring-one" data-index="0" tabindex="0" role="button" aria-label="Location details, 65 percent" cx="140" cy="140" r="118" pathLength="100"/><circle class="gauge-track" cx="140" cy="140" r="91" pathLength="100"/><circle class="gauge-value ring-two" data-index="1" tabindex="0" role="button" aria-label="Pillow and bedding, 45 percent" cx="140" cy="140" r="91" pathLength="100"/><circle class="gauge-track" cx="140" cy="140" r="64" pathLength="100"/><circle class="gauge-value ring-three" data-index="2" tabindex="0" role="button" aria-label="Flexible arrival, 32 percent" cx="140" cy="140" r="64" pathLength="100"/></svg><div class="gauge-centre" aria-live="polite"><small>Booking priority</small><strong>65%</strong><em>Location details</em></div>';
  let activePriority=0;
  function updateGauge(index,animate=false){
    const state=gaugeStates[index];
    const rings=[...gauge.querySelectorAll('.gauge-value')];
    gauge.querySelector('small').textContent=state.meta;
    gauge.querySelector('strong').textContent=`${state.value}%`;
    gauge.querySelector('em').textContent=state.label;
    rings.forEach((ring,ringIndex)=>{
      ring.classList.toggle('is-focus',ringIndex===index);
      ring.style.transitionDelay=`${ringIndex*90}ms`;
      if(animate) ring.style.strokeDasharray='0 100';
    });
    if(animate) requestAnimationFrame(()=>requestAnimationFrame(()=>rings.forEach((ring,ringIndex)=>ring.style.strokeDasharray=`${gaugeStates[ringIndex].value} 100`)));
  }
  function selectPriority(index){
    activePriority=index;
    priorityItems.forEach(item => {
      item.classList.remove('is-open');
      item.setAttribute('aria-expanded', 'false');
    });
    const button=priorityItems[index];
    button.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    updateGauge(index);
  }
  priorityItems.forEach((button,index) => button.addEventListener('click', () => selectPriority(index)));
  [...gauge.querySelectorAll('.gauge-value')].forEach((ring,index)=>{
    ring.addEventListener('pointerenter',()=>updateGauge(index));
    ring.addEventListener('pointerleave',()=>updateGauge(activePriority));
    ring.addEventListener('focus',()=>updateGauge(index));
    ring.addEventListener('blur',()=>updateGauge(activePriority));
    ring.addEventListener('click',()=>selectPriority(index));
    ring.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPriority(index);}});
  });
  let gaugeStarted=false;
  const gaugeObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting&&!gaugeStarted){
      gaugeStarted=true;
      updateGauge(Math.max(0,priorityItems.findIndex(item=>item.classList.contains('is-open'))),true);
      gaugeObserver.disconnect();
    }
  }),{rootMargin:'0px 0px -12%'});
  gaugeObserver.observe(gauge);

  update();
})();
