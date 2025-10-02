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
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Reveal on scroll ===== */
(() => {
  const els = document.querySelectorAll('.reveal, .card, .contact-card');
  if(!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
  },{threshold:0.15});
  els.forEach(el=>io.observe(el));
})();

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
(() => {
  const tilts = document.querySelectorAll('.tilt');
  tilts.forEach(el=>{
    const glare = el.querySelector('.glare-spot');
    const onMove = (e)=>{
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
    el.addEventListener('mousemove', onMove, {passive:true});
    el.addEventListener('mouseleave', ()=>{ el.style.transform='rotateX(0) rotateY(0)'; if(glare) glare.style.opacity=0; }, {passive:true});
  });
})();

/* ===== Magnetic hover ===== */
(() => {
  if(!isFinePointer || prefersReduced) return;
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
(() => {
  if(!isFinePointer || prefersReduced) return;
  document.addEventListener('mousemove', rafThrottle((e)=>{
    const nx = (e.clientX / innerWidth) - .5;
    const ny = (e.clientY / innerHeight) - .5;
    document.querySelectorAll('.bg-blob').forEach((b,i)=>{ b.style.transform = `translate(${nx*8*(i+1)}px, ${ny*8*(i+1)}px)`; });
    document.querySelectorAll('.parallax').forEach(el=>{
      const d = parseFloat(el.dataset.depth||'0.1');
      el.style.transform = `translate(${nx*d*40}px, ${ny*d*40}px)`;
    });
  }), {passive:true});
})();

/* ===== Cursor blob & dot ===== */
(() => {
  if(!isFinePointer || prefersReduced) return;
  const blob = document.querySelector('.cursor-blob');
  const dot = document.querySelector('.cursor-dot');
  if(!blob || !dot) return;
  let bx = innerWidth/2, by = innerHeight/2, tx = bx, ty = by;
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
  const nums = document.querySelectorAll('.stat-card[data-count] .num');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const numEl = e.target; const target = +numEl.parentElement.dataset.count || 0;
      let cur = 0; const step = Math.max(1, Math.floor(target/60));
      const inc = ()=>{ cur=Math.min(target, cur+step); numEl.textContent=cur; if(cur<target) requestAnimationFrame(inc); };
      inc(); obs.unobserve(numEl);
    });
  },{threshold:0.5});
  nums.forEach(n=>obs.observe(n));
})();

/* ===== Tabs ===== */
(() => {
  const tabs = document.querySelectorAll('.tab');
  const panels = { projects: document.getElementById('panel-projects'), certs: document.getElementById('panel-certs'), stack: document.getElementById('panel-stack') };
  const show = (key)=>{
    tabs.forEach(t=>{ const on = t.dataset.tab===key; t.classList.toggle('active',on); t.setAttribute('aria-selected', on?'true':'false'); });
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
