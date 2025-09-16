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
const revealEls = document.querySelectorAll('.reveal, .card, .contact-card');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
},{threshold:0.15});
revealEls.forEach(el=>io.observe(el));

/* ===== Reveal whole sections (.section.lazy) ===== */
(() => {
  const secs = document.querySelectorAll('section.lazy');
  if(!secs.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting) {
        e.target.classList.add('entered');
        obs.unobserve(e.target);
      }
    });
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
    el.style.transform = `rotateX(${(-y*10).toFixed(2)}deg) rotateY(${(x*12).toFixed(2)}deg)`;
    if(glare){
      glare.style.left = (e.clientX - r.left) + 'px';
      glare.style.top  = (e.clientY - r.top)  + 'px';
      glare.style.opacity = .7;
    }
  };
  el.addEventListener('mousemove', handle);
  el.addEventListener('mouseleave', ()=>{
    el.style.transform = 'rotateX(0) rotateY(0)';
    if(glare) glare.style.opacity = 0;
  });
});

/* ===== Magnetic hover (buttons/links with .magnetic) ===== */
(() => {
  if(!isFinePointer) return; // ปิดบนจอสัมผัส
  const magnets = document.querySelectorAll('.magnetic');
  const strength = 18;
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

/* ===== Parallax for blobs & card thumbnails ===== */
if (isFinePointer) {
  document.addEventListener('mousemove', rafThrottle((e)=>{
    const x = (e.clientX / innerWidth - .5) * 8;
    const y = (e.clientY / innerHeight - .5) * 8;
    document.querySelectorAll('.bg-blob').forEach((b,i)=>{
      b.style.transform = `translate(${x*(i+1)}px, ${y*(i+1)}px)`;
    });
  }));
  document.addEventListener('mousemove', rafThrottle((e)=>{
    document.querySelectorAll('.parallax').forEach(el=>{
      const depth = parseFloat(el.dataset.depth||'0.1');
      const x = ((e.clientX / window.innerWidth) - .5) * depth * 40;
      const y = ((e.clientY / window.innerHeight) - .5) * depth * 40;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
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
  const move = (e)=>{ tx = e.clientX; ty = e.clientY; dot.style.left = tx+'px'; dot.style.top = ty+'px'; };
  window.addEventListener('mousemove', move);
  const tick = ()=>{
    bx += (tx - bx) * 0.12;
    by += (ty - by) * 0.12;
    blob.style.left = bx + 'px';
    blob.style.top  = by + 'px';
    requestAnimationFrame(tick);
  };
  tick();
})();

/* ===== Intro (auto close, no button) ===== */
(() => {
  const intro = document.getElementById('intro');
  if(!intro) return;
  document.body.classList.add('intro-lock');

  const clearToHome = ()=>{
    if (location.hash) history.replaceState(null,'', location.pathname + location.search);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const closeIntro = ()=>{
    intro.classList.add('hide');
    setTimeout(()=>{
      intro.remove();
      document.body.classList.remove('intro-lock');
      clearToHome();
    }, 650);
  };

  // ปิดอัตโนมัติ (ประมาณ 2.2 วิ หลังจาก load)
  window.addEventListener('load', ()=> setTimeout(closeIntro, 2200));
})();


/* ===== Stats counter ===== */
(() => {
  const counters = document.querySelectorAll('.stat-card[data-count] .num');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const numEl = e.target;
      const target = +numEl.parentElement.dataset.count || 0;
      let cur = 0;
      const step = Math.max(1, Math.floor(target/60));
      const inc = ()=>{ cur = Math.min(target, cur + step); numEl.textContent = cur; if(cur<target) requestAnimationFrame(inc); };
      inc();
      obs.unobserve(numEl);
    });
  },{threshold:0.5});
  counters.forEach(n=>obs.observe(n));
})();

/* ===== Tabs (Projects / Certificates / Tech Stack) ===== */
(() => {
  const tabs = document.querySelectorAll('.tab');
  const panels = {
    projects: document.getElementById('panel-projects'),
    certs: document.getElementById('panel-certs'),
    stack: document.getElementById('panel-stack'),
  };
  const show = (key)=>{
    tabs.forEach(t=>{
      t.classList.toggle('active', t.dataset.tab===key);
      t.setAttribute('aria-selected', t.dataset.tab===key ? 'true':'false');
    });
    Object.entries(panels).forEach(([k,p])=>{
      if(!p) return;
      if(k===key){ p.removeAttribute('hidden'); p.classList.add('show'); }
      else { p.setAttribute('hidden',''); p.classList.remove('show'); }
    });
  };
  tabs.forEach(t=>t.addEventListener('click', ()=>show(t.dataset.tab)));

  // keyboard support
  document.addEventListener('keydown', (e)=>{
    if(!['ArrowLeft','ArrowRight'].includes(e.key)) return;
    const arr = Array.from(tabs);
    const i = arr.findIndex(t=>t.classList.contains('active'));
    const ni = e.key==='ArrowRight' ? (i+1)%arr.length : (i-1+arr.length)%arr.length;
    arr[ni].focus(); arr[ni].click();
  });
})();

/* ===== ScrollSpy (active nav link) ===== */
(() => {
  const links = document.querySelectorAll('#navLinks a[href^="#"]');
  const sections = Array.from(links).map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = ()=>{
    const y = window.scrollY + 120;
    let active = links[0];
    sections.forEach((sec,i)=>{ if(sec.offsetTop <= y) active = links[i]; });
    links.forEach(a=>a.classList.toggle('active', a===active));
  };
  spy(); window.addEventListener('scroll', spy, {passive:true});
})();

/* ===== Scroll progress bar ===== */
(() => {
  const bar = document.querySelector('.progress span');
  if(!bar) return;
  const onScroll = rafThrottle(()=>{
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    bar.style.width = (scrolled*100).toFixed(2) + '%';
  });
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

/* ===== Marquee safety (ถ้าเผลอไม่ duplicate) ===== */
(() => {
  document.querySelectorAll('.marquee .track').forEach(track=>{
    const children = [...track.children];
    if(children.length && children.length < 12){
      track.innerHTML += track.innerHTML;
    }
  });
})();
