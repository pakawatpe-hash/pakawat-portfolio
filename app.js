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
  const revealEls = document.querySelectorAll('.reveal, .card, .contact-card');
  if (!revealEls.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },{threshold:0.15});
  revealEls.forEach(el=>io.observe(el));
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
(() => {
  const tilts = document.querySelectorAll('.tilt');
  if(!tilts.length) return;
  tilts.forEach(el=>{
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
    el.addEventListener('mouseleave', ()=>{
      el.style.transform='rotateX(0) rotateY(0)';
      if(glare) glare.style.opacity=0;
    });
  });
})();

/* ===== Magnetic hover ===== */
(() => {
  if(!isFinePointer) return;
  const magnets = document.querySelectorAll('.magnetic');
  if(!magnets.length) return;
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

/* ===== Parallax blobs & thumbs ===== */
(() => {
  if (!isFinePointer) return;
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
})();

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

  // typewriter
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
  window.addEventListener('load', ()=> setTimeout(closeIntro, 2400));
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
    tabs.forEach(t=>{
      const on = t.dataset.tab===key;
      t.classList.toggle('active',on);
      t.setAttribute('aria-selected', on?'true':'false');
    });
    Object.entries(panels).forEach(([k,p])=>{
      if(!p) return;
      if(k===key){ p.removeAttribute('hidden'); }
      else { p.setAttribute('hidden',''); }
    });
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
  const spy = ()=>{
    const y=window.scrollY+120; let active=links[0];
    sections.forEach((sec,i)=>{ if(sec && sec.offsetTop<=y) active=links[i]; });
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

    // duplicate once to make seamless (mark duplicates)
    const original = Array.from(track.children);
    if (!original.some(n => n.hasAttribute && n.hasAttribute('data-dup'))) {
      const frag = document.createDocumentFragment();
      original.forEach(n => { const c=n.cloneNode(true); c.setAttribute('data-dup',''); frag.appendChild(c); });
      track.appendChild(frag);
    }

    // compute width of half set to set speed (px/sec)
    const half = Math.floor(track.children.length/2);
    let halfWidth = 0;
    const gap = parseFloat(getComputedStyle(track).gap || '0') || 0;
    for(let i=0;i<half;i++){
      halfWidth += track.children[i].getBoundingClientRect().width + gap;
    }
    const pxPerSec = 120;
    const duration = Math.max(14, halfWidth / pxPerSec);
    track.style.animationDuration = `${duration}s`;
  };

  setupTrack(document.getElementById('skillsTrack1'));
  setupTrack(document.getElementById('skillsTrack2'));
  window.addEventListener('load', ()=>{
    setupTrack(document.getElementById('skillsTrack1'));
    setupTrack(document.getElementById('skillsTrack2'));
  });

  // pause on hover (desktop)
  if (matchMedia('(pointer:fine)').matches) {
    const marquee = document.getElementById('skillsMarquee');
    marquee?.addEventListener('mouseenter', ()=> marquee.querySelectorAll('.track').forEach(t=>t.style.animationPlayState='paused'));
    marquee?.addEventListener('mouseleave', ()=> marquee.querySelectorAll('.track').forEach(t=>t.style.animationPlayState='running'));
  }
})();

/* ===== Dangling Badge physics (spring + mouse sway) ===== */
(() => {
  const el = document.getElementById('hangBadge');
  if(!el) return;

  // พารามิเตอร์สปริง
  let angle = 0;       // องศาปัจจุบัน
  let vel = 0;         // ความเร็ว
  const origin = 6;    // องศาพัก
  const k = 0.015;     // สปริง
  const damp = 0.985;  // หน่วง

  // สวิงตามเมาส์
  const sway = (e) => {
    const x = (e.clientX / innerWidth - .5) * 2; // -1..1
    angle += x * 0.6;
  };
  window.addEventListener('mousemove', sway, {passive:true});

  // สั่นเบา ๆ ตอนสกรอลล์
  let lastY = scrollY;
  window.addEventListener('scroll', () => {
    const dy = scrollY - lastY; lastY = scrollY;
    vel += Math.max(-6, Math.min(6, dy * 0.02));
  }, {passive:true});

  // ดับเบิลคลิก -> ย่อ/ขยาย
  el.addEventListener('dblclick', (e)=>{ e.preventDefault(); el.classList.toggle('min'); });

  // กด m เพื่อซ่อน/โชว์แบบย่อ
  document.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase()==='m') el.classList.toggle('min');
  });

  // ลากด้วยเมาส์เล็กน้อย (เพิ่มแรง)
  let dragging = false, startX = 0;
  el.addEventListener('mousedown', (e)=>{ dragging=true; startX=e.clientX; e.preventDefault(); });
  window.addEventListener('mouseup', ()=> dragging=false);
  window.addEventListener('mousemove', (e)=>{
    if(!dragging) return;
    const dx = e.clientX - startX; startX = e.clientX;
    vel += dx * 0.02;
  });

  // วงจรฟิสิกส์
  const tick = () => {
    const target = origin;
    const force = -(angle - target) * k;
    vel += force;
    vel *= damp;
    angle += vel;

    angle = Math.max(-22, Math.min(22, angle));
    el.style.transform = `rotate(${angle.toFixed(2)}deg)`;

    requestAnimationFrame(tick);
  };
  tick();
})();
