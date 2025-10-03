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
if (revealEls.length) {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  },{threshold:0.15});
  revealEls.forEach(el=>io.observe(el));
}

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
  if(!counters.length) return;
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
  if(!tabs.length) return;
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
  if(!links.length) return;
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

/* ===== Marquee (2 แถวสวนทาง: เข้า-ข้าม-ออก แล้วกลับทิศวนซ้ำ) ===== */
(function () {
  const ROOT = document.documentElement;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cssVar = (name) => {
    const v = getComputedStyle(ROOT).getPropertyValue(name);
    return parseFloat(v) || 0;
  };

  const BASE_SPEED = Math.max(20, cssVar('--mk-speed') || 120); // px/sec
  const SPEED = prefersReduced ? 0 : BASE_SPEED;

  const belt = document.getElementById('skillsBelt');
  if (!belt) return;

  const rowA = belt.querySelector('.mk-row.mk-a');
  const rowB = belt.querySelector('.mk-row.mk-b');

  const aTrack = rowA?.querySelector('.mk-track') || null;
  const bTrack = rowB?.querySelector('.mk-track') || null;
  if (!aTrack || !bTrack) return;

  // เติมเนื้อหาให้ยาวพอ (อย่างน้อย 2 ชุดเพื่อไม่โล่ง)
  function fillTrack(trackEl, minFactor = 2) {
    const row = trackEl.closest('.mk-row');
    if (!row) return;
    const sets = [...trackEl.querySelectorAll('.mk-set')];
    if (!sets.length) return;
    const base = sets[0];
    sets.slice(1).forEach(s => s.remove());
    while (trackEl.scrollWidth < row.clientWidth * minFactor) {
      trackEl.appendChild(base.cloneNode(true));
    }
  }

  function metrics(trackEl) {
    const row = trackEl.closest('.mk-row');
    return {
      rowW: row?.clientWidth || 0,
      contentW: trackEl.scrollWidth
    };
  }

  // สถานะแต่ละแทร็ก
  const tracks = [
    { el: aTrack, dir: -1, offset: 0, rowW: 0, contentW: 0 }, // เริ่มจากขวาไปซ้าย
    { el: bTrack, dir: +1, offset: 0, rowW: 0, contentW: 0 }  // เริ่มจากซ้ายไปขวา
  ];

  // ตั้งค่าเริ่มเฟส: เข้า-ข้าม-ออก (เราเริ่มที่ "เข้า" โดย offset = start)
  function setStartForDirection(t) {
    // ถ้าทิศทางปัจจุบันเป็น -1 (ไปซ้าย) ให้เริ่มนอกจอขวา
    // ระยะต้องวิ่งทั้งหมด = rowW + contentW
    if (t.dir === -1) {
      t.start = +t.rowW;         // เริ่มขอบขวา (นอกจอ)
      t.end   = -t.contentW;     // ไปจนพ้นซ้าย
    } else {
      t.start = -t.rowW;         // เริ่มขอบซ้าย (นอกจอ)
      t.end   = +t.contentW;     // ไปจนพ้นขวา
    }
    t.offset = t.start;
  }

  function init(keepPhase = false) {
    tracks.forEach(t => {
      fillTrack(t.el, 2);
      const m = metrics(t.el);
      t.rowW = m.rowW;
      t.contentW = Math.max(m.contentW, 1);

      if (!keepPhase) {
        setStartForDirection(t);
      } else {
        // ถ้า resize ระหว่างวิ่ง ให้ map สัดส่วนระยะทางเดิม
        const total = t.rowW + t.contentW;
        const p = (t.offset - t.start) / (t.end - t.start || 1);
        setStartForDirection(t);
        t.offset = t.start + p * (t.end - t.start);
      }

      t.el.style.willChange = 'transform';
      t.el.style.animation = 'none';
      t.el.style.transform = `translateX(${(-t.offset).toFixed(2)}px)`;
    });
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (SPEED > 0) {
      tracks.forEach(t => {
        t.offset += t.dir * SPEED * dt;

        // เงื่อนไข “วิ่งจนหมด”:
        // ไปซ้าย: offset <= end(-contentW)
        // ไปขวา : offset >= end(+contentW)
        const reachedEnd = t.dir === -1 ? (t.offset <= t.end) : (t.offset >= t.end);
        if (reachedEnd) {
          // สลับทิศ แล้วเริ่มใหม่จากอีกขอบ (reverse & restart)
          t.dir *= -1;
          setStartForDirection(t);
        }

        t.el.style.transform = `translateX(${(-t.offset).toFixed(2)}px)`;
      });
    }
    requestAnimationFrame(frame);
  }

  init(false);
  window.addEventListener('resize', ()=>init(true), { passive: true });
  requestAnimationFrame((t0)=>{ last = t0; frame(t0); });
})();
