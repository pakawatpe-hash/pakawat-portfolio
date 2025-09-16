/* ===== Reveal on scroll ===== */
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

/* ===== Tilt hover ===== */
document.querySelectorAll('.tilt').forEach(el=>{
  el.addEventListener('mousemove',(e)=>{
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - .5;
    const y = (e.clientY - r.top)/r.height - .5;
    el.style.transform = `rotateX(${(-y*8).toFixed(2)}deg) rotateY(${(x*10).toFixed(2)}deg)`;
  });
  el.addEventListener('mouseleave',()=>{ el.style.transform = 'rotateX(0) rotateY(0)'; });
});

/* ===== Parallax for blobs ===== */
document.addEventListener('mousemove',(e)=>{
  const x = (e.clientX / innerWidth - .5) * 8;
  const y = (e.clientY / innerHeight - .5) * 8;
  document.querySelectorAll('.bg-blob').forEach((b,i)=>{
    b.style.transform = `translate(${x*(i+1)}px, ${y*(i+1)}px)`;
  });
});

/* ===== Intro / Splash (auto close) ===== */
(function(){
  const intro = document.getElementById('intro');
  if(!intro) return;

  document.body.classList.add('intro-lock');
  const closeIntro = ()=>{
    intro.classList.add('hide');
    setTimeout(()=>{
      intro.remove();
      document.body.classList.remove('intro-lock');
    }, 700);
  };
  // auto close after ~1.8s
  window.addEventListener('load', ()=> setTimeout(closeIntro, 1800));
})();

/* ===== Typewriter for Intro subtitle ===== */
(function(){
  const el = document.querySelector('.intro-sub .type');
  if(!el) return;

  let words = ['Portfolio Website'];
  try { if (el.dataset.words) words = JSON.parse(el.dataset.words); } catch(_){}
  let wi = 0, ci = 0, deleting = false;

  const tick = () => {
    const w = words[wi];
    el.textContent = deleting ? w.slice(0, --ci) : w.slice(0, ++ci);
    let d = deleting ? 45 : 80;
    if(!deleting && ci === w.length){ d = 1200; deleting = true; }
    else if(deleting && ci === 0){ deleting = false; wi = (wi+1)%words.length; d = 300; }
    setTimeout(tick, d);
  };
  setTimeout(tick, 300);
})();

/* ===== Stats counter (About) ===== */
(function(){
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
(function(){
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
})();

/* ===== ScrollSpy (active nav link) ===== */
(function(){
  const links = document.querySelectorAll('#navLinks a[href^="#"]');
  const sections = Array.from(links).map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = ()=>{
    const y = window.scrollY + 120;
    let active = links[0];
    sections.forEach((sec,i)=>{ if(sec.offsetTop <= y) active = links[i]; });
    links.forEach(a=>a.classList.toggle('active', a===active));
  };
  spy(); window.addEventListener('scroll', spy);
})();
