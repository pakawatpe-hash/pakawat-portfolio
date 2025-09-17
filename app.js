/* ===== Utils: RAF throttle ===== */
const rafThrottle = (fn) => {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { fn(...args); ticking = false; });
  };
};

const isFinePointer = matchMedia('(pointer: fine)').matches;

/* ===== Reveal on scroll ===== */
const revealEls = document.querySelectorAll('.reveal, .card, .contact-card');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
},{threshold:0.15});
revealEls.forEach(el=>io.observe(el));

/* ===== Section lazy ===== */
(() => {
  const secs = document.querySelectorAll('section.lazy');
  if(!secs.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if (e.isIntersecting) { e.target.classList.add('entered'); obs.unobserve(e.target); } });
  },{threshold:0.12});
  secs.forEach(s=>obs.observe(s));
})();

/* ===== Tilt + Glare ===== */
document.querySelectorAll('.tilt').forEach(el=>{
  const glare = el.querySelector('.glare-spot');
  const handle = (e)=>{
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - .5;
    const y = (e.clientY - r.top)/r.height - .5;
    el.style.transform = `rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg)`;
    if(glare){
      glare.style.left = `${e.clientX - r.left}px`;
      glare.style.top  = `${e.clientY - r.top}px`;
      glare.style.opacity = '.65';
    }
  };
  el.addEventListener('mousemove', handle, {passive:true});
  el.addEventListener('mouseleave', ()=>{ el.style.transform='rotateX(0) rotateY(0)'; if(glare) glare.style.opacity=0; }, {passive:true});
});

/* ===== Magnetic hover ===== */
(() => {
  if(!isFinePointer) return;
  const magnets = document.querySelectorAll('.magnetic');
  const strength = 12;
  magnets.forEach(m=>{
    const onMove = rafThrottle((e)=>{
      const r = m.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - .5) * strength;
      const y = ((e.clientY - r.top) / r.height - .5) * strength;
      m.style.transform = `translate(${x}px, ${y}px)`;
    });
    m.addEventListener('mousemove', onMove, {passive:true});
    m.addEventListener('mouseleave', ()=>{ m.style.transform = 'translate(0,0)'; }, {passive:true});
  });
})();

/* ===== Parallax blobs & thumbs ===== */
if (isFinePointer) {
  document.addEventListener('mousemove', rafThrottle((e)=>{
    const x = (e.clientX / innerWidth - .5) * 8;
    const y = (e.clientY / innerHeight - .5) * 8;
    document.querySelectorAll('.bg-blob').forEach((b,i)=>{ b.style.transform = `translate(${x*(i+1)}px, ${y*(i+1)}px)`; });
  }), {passive:true});
  document.addEventListener('mousemove', rafThrottle((e)=>{
    document.querySelectorAll('.parallax').forEach(el=>{
      const depth = parseFloat(el.dataset.depth||'0.1');
      const x = ((e.clientX / window.innerWidth) - .5) * depth * 40;
      const y = ((e.clientY / window.innerHeight) - .5) * depth * 40;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  }), {passive:true});
}

/* ===== Cursor blob & dot ===== */
(() => {
  if(!isFinePointer) return;
  const blob = document.querySelector('.cursor-blob');
  const dot = document.querySelector('.cursor-dot');
  if(!blob || !dot) return;
  let bx = innerWidth/2, by = innerHeight/2;
  let tx = bx, ty = by;
  window.addEventListener('mousemove', (e)=>{ tx=e.clientX; ty=e.clientY; dot.style.left=`${tx}px`; dot.style.top =`${ty}px`; }, {passive:true});
  const tick = ()=>{ bx += (tx-bx)*0.12; by += (ty-by)*0.12; blob.style.left=`${bx}px`; blob.style.top =`${by}px`; requestAnimationFrame(tick); };
  tick();
})();

/* ===== Intro ===== */
(() => {
  const intro = document.getElementById('intro');
  if(!intro) return;
  document.body.classList.add('intro-lock');
  const el = intro.querySelector('.intro-title .line-2');
  if(el){
    const full = el.textContent.trim(); el.textContent = '';
    let i = 0; const step = () => { el.textContent = full.slice(0, ++i); if(i < full.length) setTimeout(step, 70); };
    setTimeout(step, 260);
  }
  const closeIntro = ()=>{ intro.classList.add('hide'); setTimeout(()=>{ intro.remove(); document.body.classList.remove('intro-lock'); window.scrollTo({top:0,behavior:'auto'}); }, 650); };
  window.addEventListener('load', ()=> setTimeout(closeIntro, 2400), {once:true});
})();

/* ===== Stats counter ===== */
(() => {
  const counters = document.querySelectorAll('.stat-card[data-count] .num');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const numEl = e.target; const target = +numEl.parentElement.dataset.count || 0;
      let cur = 0; const step = Math.max(1, Math.floor(target/60));
      const inc = ()=>{ cur=Math.min(target, cur+step); numEl.textContent=cur; if(cur<target) requestAnimationFrame(inc); };
      inc(); obs.unobserve(numEl);
    });
  },{threshold:0.5});
  counters.forEach(n=>obs.observe(n));
})();

/* ===== Tabs ===== */
(() => {
  const tabs = document.querySelectorAll('.tab');
  const panels = { projects: document.getElementById('panel-projects'), certs: document.getElementById('panel-certs'), stack: document.getElementById('panel-stack') };
  const show = (key)=>{
    tabs.forEach(t=>{ const on = t.dataset.tab===key; t.classList.toggle('active',on); t.setAttribute('aria-selected', on?'true':'false'); if(on) t.focus(); });
    Object.entries(panels).forEach(([k,p])=>{ if(!p) return; if(k===key){ p.removeAttribute('hidden'); } else { p.setAttribute('hidden',''); }});
  };
  tabs.forEach(t=>t.addEventListener('click', ()=>show(t.dataset.tab), {passive:true}));
  document.addEventListener('keydown',(e)=>{ if(!['ArrowLeft','ArrowRight'].includes(e.key)) return;
    const arr=[...tabs]; const i=arr.findIndex(t=>t.classList.contains('active'));
    const ni=e.key==='ArrowRight'?(i+1)%arr.length:(i-1+arr.length)%arr.length; arr[ni].click(); });
})();

/* ===== ScrollSpy ===== */
(() => {
  const links = document.querySelectorAll('#navLinks a[href^="#"]');
  const sections = [...links].map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = ()=>{ const y=window.scrollY+120; let active=links[0]; sections.forEach((sec,i)=>{ if(sec.offsetTop<=y) active=links[i]; }); links.forEach(a=>a.classList.toggle('active', a===active)); };
  spy(); window.addEventListener('scroll', rafThrottle(spy), {passive:true});
})();

/* ===== Scroll progress ===== */
(() => {
  const bar = document.querySelector('.progress span'); if(!bar) return;
  const onScroll = rafThrottle(()=>{ const h = document.documentElement; const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight); bar.style.width = `${(scrolled*100).toFixed(2)}%`; });
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
})();

/* ===== Marquee ===== */
(() => {
  const setupTrack = (track) => {
    if(!track) return;
    const original = Array.from(track.children);
    if (!original.some(n => n.hasAttribute && n.hasAttribute('data-dup'))) {
      const frag = document.createDocumentFragment();
      original.forEach(n => { const c=n.cloneNode(true); c.setAttribute('data-dup',''); frag.appendChild(c); });
      track.appendChild(frag);
    }
    const half = Math.floor(track.children.length/2);
    let halfWidth = 0; const gap = parseFloat(getComputedStyle(track).gap || '0') || 0;
    for(let i=0;i<half;i++){ halfWidth += track.children[i].getBoundingClientRect().width + gap; }
    const pxPerSec = 120; const duration = Math.max(14, halfWidth / pxPerSec);
    track.style.animationDuration = `${duration}s`;
  };
  const t1 = document.getElementById('skillsTrack1'); const t2 = document.getElementById('skillsTrack2');
  setupTrack(t1); setupTrack(t2);
  window.addEventListener('load', ()=>{ setupTrack(t1); setupTrack(t2); }, {once:true});
  if (matchMedia('(pointer:fine)').matches) {
    const marquee = document.getElementById('skillsMarquee');
    marquee?.addEventListener('mouseenter', ()=> marquee.querySelectorAll('.track').forEach(t=>t.style.animationPlayState='paused'));
    marquee?.addEventListener('mouseleave', ()=> marquee.querySelectorAll('.track').forEach(t=>t.style.animationPlayState='running'));
  }
})();

/* ===== Dangling Badge — TikTok-style (gusty wind + scroll impulse + hover wobble + click bounce) ===== */
(() => {
  const root = document.getElementById('hangBadge');
  if (!root) return;

  // Tunables (คล้ายคลิป)
  const L = 120;          // rope length (px)
  const g = 1200;         // gravity
  const damping = 0.995;  // air drag
  const maxDeg = 34;      // clip angle
  const mouseTorque = 0.0025;
  const windStrength = 1.4;  // stronger
  const parallax = 7;        // card tilt
  const stringStretch = 0.05;

  // State
  let angle = 0.3;         // rad (เริ่มเอียงให้เห็นชัด)
  let vel = 0;
  let lastT = performance.now();
  let mouseXNorm = 0;

  const card = root.querySelector('.hb-card');
  const string = root.querySelector('.hb-string');
  const shadow = root.querySelector('.hb-shadow');

  // Wind (gusts)
  let windPhase = Math.random()*1000;
  let gust = 0, gustTimer = 0;
  const noise1D = (t) => { const i=Math.floor(t), f=t-i, s=f*f*(3-2*f); const r1=(Math.sin(i*127.1)*43758.5453)%1, r2=(Math.sin((i+1)*127.1)*43758.5453)%1; return (r1*(1-s)+r2*s)*2-1; };

  // Mouse torque
  window.addEventListener('mousemove', (e)=>{ mouseXNorm = ((e.clientX/innerWidth)-0.5)*2; }, {passive:true});

  // Scroll impulse (เขย่านิดๆ เหมือนคลิป)
  let lastY = window.scrollY;
  window.addEventListener('scroll', rafThrottle(()=>{
    const dy = window.scrollY - lastY; lastY = window.scrollY;
    vel += Math.max(-0.6, Math.min(0.6, dy * 0.004)); // impulse
  }), {passive:true});

  // Hover wobble
  root.addEventListener('mouseenter', ()=>{ vel += 0.5 * (Math.random()>.5?1:-1); }, {passive:true});

  // Click bounce
  root.addEventListener('click', (e)=>{ e.preventDefault(); vel += 1.2 * (Math.random()>.5?1:-1); }, {passive:false});

  // Min toggle
  root.addEventListener('dblclick', (e)=>{ e.preventDefault(); root.classList.toggle('min'); });

  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

  function tick(now){
    const dt = Math.min(0.032, (now-lastT)/1000); lastT = now;

    // wind base + gusts
    windPhase += dt * 0.35;
    if (gustTimer <= 0 && Math.random() < 0.008) { gust = (Math.random()*2-1)*1.8; gustTimer = 0.6 + Math.random()*0.8; }
    else { gust *= 0.98; gustTimer -= dt; }
    const wind = (noise1D(windPhase) * windStrength + gust);
    const windTorque = wind * 0.06;

    // equation
    const acc = -(g/L) * Math.sin(angle) + mouseXNorm * mouseTorque + windTorque;
    vel += acc * dt;
    vel *= damping;
    angle += vel * dt;

    // clamp
    const maxRad = maxDeg * Math.PI / 180;
    if (angle > maxRad) { angle = maxRad; vel = -Math.abs(vel)*0.7; }
    if (angle < -maxRad){ angle = -maxRad; vel =  Math.abs(vel)*0.7; }

    // Apply
    const deg = angle * 180 / Math.PI;
    root.style.transform = `rotate(${deg.toFixed(2)}deg)`;

    const stretch = 1 + Math.min(0.14, Math.abs(vel) * stringStretch);
    string.style.transform = `translateX(-50%) scaleY(${stretch.toFixed(3)})`;

    const rx = clamp(-deg * 0.18, -parallax, parallax);
    const ry = clamp(deg * 0.28, -parallax*1.5, parallax*1.5);
    card.style.transform = `translateZ(0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

    const sway = Math.sin(angle);
    const shadowOffset = 14 + Math.abs(vel)*3.6;
    const shadowScale = clamp(1 + Math.abs(deg)*0.012, 1, 1.55);
    shadow.style.transform = `translate(calc(-50% + ${sway*16}px), ${shadowOffset}px) scale(${shadowScale.toFixed(3)}, 1)`;
    shadow.style.opacity = String(0.55 + Math.min(0.3, Math.abs(vel)*0.12));

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
