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

/* ===== Reveal on scroll (elements) ===== */
(() => {
  const els = document.querySelectorAll('.reveal, .card, .contact-card');
  if (!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  },{threshold:0.15});
  els.forEach(el=>io.observe(el));
})();

/* ===== Reveal whole sections ===== */
(() => {
  const secs = document.querySelectorAll('section.lazy');
  if(!secs.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting) { e.target.classList.add('entered'); obs.unobserve(e.target); }
    });
  },{threshold:0.12});
  secs.forEach(s=>obs.observe(s));
})();

/* ===== Tilt + Glare (soft) ===== */
document.querySelectorAll('.tilt').forEach(el=>{
  const glare = el.querySelector('.glare-spot');
  const handle = (e)=>{
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - .5;
    const y = (e.clientY - r.top)/r.height - .5;
    el.style.transform = `rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg)`;
    if(glare){
      glare.style.left = (e.clientX - r.left) + 'px';
      glare.style.top  = (e.clientY - r.top)  + 'px';
      glare.style.opacity = .65;
    }
  };
  el.addEventListener('mousemove', handle);
  el.addEventListener('mouseleave', ()=>{ el.style.transform='rotateX(0) rotateY(0)'; if(glare) glare.style.opacity=0; });
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
      const y = ((e.clientY - r.top)  / r.height - .5) * strength;
      m.style.transform = `translate(${x}px, ${y}px)`;
    });
    m.addEventListener('mousemove', onMove);
    m.addEventListener('mouseleave', ()=>{ m.style.transform = 'translate(0,0)'; });
  });
})();

/* ===== Parallax blobs ===== */
if (isFinePointer) {
  document.addEventListener('mousemove', rafThrottle((e)=>{
    const x = (e.clientX / innerWidth - .5) * 8;
    const y = (e.clientY / innerHeight - .5) * 8;
    document.querySelectorAll('.bg-blob').forEach((b,i)=>{ b.style.transform = `translate(${x*(i+1)}px, ${y*(i+1)}px)`; });
  }));
}

/* ===== Cursor blob & dot ===== */
(() => {
  if(!isFinePointer) return;
  const blob = document.querySelector('.cursor-blob');
  const dot  = document.querySelector('.cursor-dot');
  if(!blob || !dot) return;
  let bx = innerWidth/2, by = innerHeight/2;
  let tx = bx, ty = by;
  window.addEventListener('mousemove', (e)=>{ tx=e.clientX; ty=e.clientY; dot.style.left=tx+'px'; dot.style.top=ty+'px'; });
  const tick = ()=>{ bx += (tx-bx)*0.12; by += (ty-by)*0.12; blob.style.left=bx+'px'; blob.style.top=by+'px'; requestAnimationFrame(tick); };
  tick();
})();

/* ===== Intro (auto close + typewriter caret) ===== */
(() => {
  const intro = document.getElementById('intro');
  if(!intro) return;
  document.body.classList.add('intro-lock');

  const el = intro.querySelector('.intro-title .line-2');
  if(el){
    const full = el.textContent.trim();
    el.textContent = '';
    let i = 0;
    const step = () => {
      el.textContent = full.slice(0, ++i);
      if(i < full.length) setTimeout(step, 70);
    };
    setTimeout(step, 260);
  }

  const closeIntro = ()=>{
    intro.classList.add('hide');
    setTimeout(()=>{ intro.remove(); document.body.classList.remove('intro-lock'); window.scrollTo({top:0,behavior:'auto'}); }, 650);
  };
  window.addEventListener('load', ()=> setTimeout(closeIntro, 2000));
})();

/* ===== Stats counter ===== */
(() => {
  const counters = document.querySelectorAll('.stat-card[data-count] .num');
  if(!counters.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const numEl = e.target;
      const target = +numEl.parentElement.dataset.count || 0;
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
  if(!tabs.length) return;
  const panels = {
    projects: document.getElementById('panel-projects'),
    certs: document.getElementById('panel-certs'),
    stack: document.getElementById('panel-stack'),
  };
  const show = (key)=>{
    tabs.forEach(t=>{ const on = t.dataset.tab===key; t.classList.toggle('active',on); t.setAttribute('aria-selected', on?'true':'false'); });
    Object.entries(panels).forEach(([k,p])=>{ if(!p) return; if(k===key){ p.removeAttribute('hidden'); } else { p.setAttribute('hidden',''); }});
  };
  tabs.forEach(t=>t.addEventListener('click', ()=>show(t.dataset.tab)));
  document.addEventListener('keydown',(e)=>{
    if(!['ArrowLeft','ArrowRight'].includes(e.key)) return;
    const arr=[...tabs]; const i=arr.findIndex(t=>t.classList.contains('active'));
    const ni=e.key==='ArrowRight'?(i+1)%arr.length:(i-1+arr.length)%arr.length;
    arr[ni].focus(); arr[ni].click();
  });
})();

/* ===== ScrollSpy ===== */
(() => {
  const links = document.querySelectorAll('#navLinks a[href^="#"]');
  if(!links.length) return;
  const sections = [...links].map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = ()=>{ const y=window.scrollY+120; let active=links[0]; sections.forEach((sec,i)=>{ if(sec.offsetTop<=y) active=links[i]; }); links.forEach(a=>a.classList.toggle('active', a===active)); };
  spy(); window.addEventListener('scroll', spy, {passive:true});
})();

/* ===== Scroll progress bar ===== */
(() => {
  const bar = document.querySelector('.progress span');
  if(!bar) return;
  const onScroll = rafThrottle(()=>{
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    bar.style.width = (scrolled*100).toFixed(2) + '%';
  });
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

/* ===== Double-Track Marquee (seamless + auto speed) ===== */
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
    let halfWidth = 0;
    const gap = parseFloat(getComputedStyle(track).gap || '0') || 0;
    for(let i=0;i<half;i++){ halfWidth += track.children[i].getBoundingClientRect().width + gap; }
    const pxPerSec = 120;
    const duration = Math.max(14, halfWidth / pxPerSec);
    track.style.animationDuration = `${duration}s`;
  };
  setupTrack(document.getElementById('skillsTrack1'));
  setupTrack(document.getElementById('skillsTrack2'));
  window.addEventListener('load', ()=>{ setupTrack(document.getElementById('skillsTrack1')); setupTrack(document.getElementById('skillsTrack2')); });

  if (matchMedia('(pointer:fine)').matches) {
    const marquee = document.getElementById('skillsMarquee');
    marquee?.addEventListener('mouseenter', ()=> marquee.querySelectorAll('.track').forEach(t=>t.style.animationPlayState='paused'));
    marquee?.addEventListener('mouseleave', ()=> marquee.querySelectorAll('.track').forEach(t=>t.style.animationPlayState='running'));
  }
})();

/* ===== Dangling Badge — TikTok style (pendulum + mouse/drag/scroll/tilt) ===== */
(() => {
  const el = document.getElementById('hangBadge');
  if (!el) return;

  // พารามิเตอร์ลูกตุ้ม / สปริง
  let angle = 10;           // เริ่มเอียงนิด ๆ
  let vel   = 0;
  let acc   = 0;
  const origin = 10;        // มุมพัก
  const stiff  = 0.012;     // ความแข็งสปริง
  const damp   = 0.985;     // หน่วง
  const maxDeg = 24;        // จำกัดมุม

  // ผลจากเมาส์ (เหมือนลม)
  let lastMouseX = null;
  let mouseBoost = 0;
  window.addEventListener('mousemove', (e) => {
    if (lastMouseX == null) { lastMouseX = e.clientX; return; }
    const dx = e.clientX - lastMouseX;
    lastMouseX = e.clientX;
    const edge = (e.clientX / innerWidth - .5) * 2; // -1..1
    mouseBoost += dx * 0.0009 * (1 + Math.abs(edge));
  }, { passive: true });

  // สะบัดตอนสกรอลล์
  let lastY = scrollY;
  window.addEventListener('scroll', () => {
    const dy = scrollY - lastY; lastY = scrollY;
    vel += Math.max(-0.18, Math.min(0.18, dy * 0.0025));
  }, { passive: true });

  // ลากเพื่อแกว่ง
  let dragging = false;
  let pivot = { x: 0, y: 0 };
  const getPivot = () => {
    const r = el.getBoundingClientRect();
    pivot.x = r.left; 
    pivot.y = r.top - 40; // transform-origin y = -40px
  };
  const toDeg = (rad) => rad * 180 / Math.PI;

  el.addEventListener('mousedown', (e) => {
    dragging = true;
    getPivot();
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - pivot.x;
    const dy = e.clientY - pivot.y;
    const targetDeg = toDeg(Math.atan2(dy, dx)) - 90;
    const clamped = Math.max(-maxDeg, Math.min(maxDeg, targetDeg));
    vel = (clamped - angle) * 0.35;
    angle = clamped;
  });

  // ดับเบิลคลิก / ปุ่ม m -> ย่อ
  el.addEventListener('dblclick', (e) => { e.preventDefault(); el.classList.toggle('min'); });
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') el.classList.toggle('min');
  });

  // Tilt บนมือถือ
  if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', (ev) => {
      if (typeof ev.gamma === 'number') {
        mouseBoost += (ev.gamma / 90) * 0.02;
      }
    }, true);
  }

  // วงจรฟิสิกส์
  const tick = () => {
    const spring = -(angle - origin) * stiff;
    acc = spring + mouseBoost;
    mouseBoost *= 0.9;

    vel += acc;
    vel *= damp;
    angle += vel;

    if (angle > maxDeg) { angle = maxDeg; vel *= -0.25; }
    if (angle < -maxDeg){ angle = -maxDeg; vel *= -0.25; }

    el.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    requestAnimationFrame(tick);
  };
  tick();
})();
