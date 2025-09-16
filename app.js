/* app.js v22 */
'use strict';
console.log('app.js v22 loaded');

const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/* =========================================
   1) INTRO: สร้างเลเยอร์สีสัน + พิมพ์วิ่ง + ปิดอัตโนมัติ
========================================= */
(function initIntro(){
  const intro = $('#intro');
  if(!intro) return;

  // ล็อกสกรอลล์ช่วง Intro
  document.body.classList.add('intro-lock');

  // --- ใส่เลเยอร์ให้ Intro มีสีสัน (Aurora / Rings / Particles / Vignette) ---
  const add = (html) => intro.insertAdjacentHTML('afterbegin', html);

  add(`<div class="intro-bg"></div>`);
  add(`<div class="aurora"><span></span><span></span><span></span></div>`);
  add(`<div class="rings"></div>`);
  add(`<div class="particles"></div>`);
  add(`<div class="vignette"></div>`);

  // สร้างอนุภาคระยิบ
  const particles = $('.particles', intro);
  if (particles) {
    const N = 64;
    let html = '';
    for (let i=0;i<N;i++){
      const left = Math.random()*100;
      const top = Math.random()*100;
      const dur = 4 + Math.random()*6;  // 4-10s
      const delay = Math.random()*4;
      html += `<span style="left:${left}%;top:${top}%;animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
    }
    particles.innerHTML = html;
  }

  // --- Typewriter ---
  const typeEl  = $('.type', intro);
  const caretEl = $('.caret', intro);
  const words = (()=> {
    try {
      return JSON.parse(typeEl?.dataset.words || '["Portfolio Website"]');
    } catch { return ["Portfolio Website"]; }
  })();

  let wIndex=0, cIndex=0;
  const speed = 65;     // ความเร็วพิมพ์
  const pause  = 650;   // หน่วงหลังพิมพ์จบ

  function typeWord() {
    if (!typeEl) return finishIntroSoon();
    const word = words[wIndex] || "";
    if (cIndex <= word.length) {
      typeEl.textContent = word.slice(0, cIndex++);
      setTimeout(typeWord, speed);
    } else {
      // พิมพ์จบคำแรกแล้ว ปิด Intro
      setTimeout(finishIntroSoon, pause);
    }
  }

  // เริ่มพิมพ์เมื่อ DOM พร้อม (กันบางเครื่องที่โหลดไฟล์ช้า)
  window.addEventListener('load', () => {
    // กันกรณีหลุด typeEl
    if (typeEl) typeWord();
    // Fallback: ถ้าพิมพ์ไม่ทำงานให้ปิดใน 2.4s
    setTimeout(finishIntroSoon, 2400);
  });

  function clearHashToHome(){
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function closeIntro(){
    intro.classList.add('hide');
    setTimeout(()=>{
      intro.remove();
      document.body.classList.remove('intro-lock');
      clearHashToHome();
    }, 700);
  }

  let done = false;
  function finishIntroSoon(){
    if (done) return;
    done = true;
    closeIntro();
  }
})();

/* =========================================
   2) Reveal-on-Scroll (การ์ด/คอนเทนต์ค่อยๆ โผล่)
========================================= */
(function revealScroll(){
  // องค์ประกอบเล็ก (การ์ด ฯลฯ)
  const revealEls = $$('.reveal, .card, .contact-card');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },{threshold:0.15});
  revealEls.forEach(el=>io.observe(el));

  // ซ่อนทั้ง section (ใช้กับ .section.lazy)
  const secs = $$('section.lazy');
  const io2 = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('entered');
        io2.unobserve(e.target);
      }
    });
  },{threshold:0.12});
  secs.forEach(s=>io2.observe(s));
})();

/* =========================================
   3) Tilt (เอียงการ์ดนิดๆ)
========================================= */
(function tilt(){
  // ปิดบนอุปกรณ์ touch เพื่อความลื่น
  const coarse = matchMedia('(any-pointer:coarse)').matches;
  if (coarse) return;

  $$('.tilt').forEach(el=>{
    let raf = null;
    function handle(e){
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const rx = clamp(-y*10, -10, 10);
      const ry = clamp( x*12, -12, 12);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=> {
        el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      });
    }
    el.addEventListener('mousemove', handle);
    el.addEventListener('mouseleave', ()=> {
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = 'rotateX(0) rotateY(0)';
    });
  });
})();

/* =========================================
   4) Parallax ของฉากหลัง blob
========================================= */
(function parallax(){
  const blobs = $$('.bg-blob');
  if (!blobs.length) return;

  let raf = null, lx=0, ly=0;
  window.addEventListener('mousemove', (e)=>{
    const x = (e.clientX / window.innerWidth  - .5) * 10;
    const y = (e.clientY / window.innerHeight - .5) * 10;
    lx = x; ly = y;
    if (raf) return;
    raf = requestAnimationFrame(()=>{
      blobs.forEach((b,i)=>{
        b.style.transform = `translate(${lx*(i+1)}px, ${ly*(i+1)}px)`;
      });
      raf = null;
    });
  });
})();

/* =========================================
   5) เนวิเกชันไฮไลท์ลิงก์ตาม section ที่เห็น
========================================= */
(function activeNavOnScroll(){
  const links = $$('#navLinks a[href^="#"]');
  if (!links.length) return;
  const map = links.map(a=>({a, id: a.getAttribute('href').slice(1), sec: $(a.getAttribute('href'))}))
                   .filter(o=>o.sec);

  function update(){
    const y = window.scrollY + 120; // offset เผื่อ header
    let cur = map[0]?.a;
    for (let i=0;i<map.length;i++){
      const top = map[i].sec.offsetTop;
      const nextTop = map[i+1]?.sec?.offsetTop ?? (top+999999);
      if (y >= top && y < nextTop){ cur = map[i].a; break; }
    }
    links.forEach(a=>a.classList.toggle('active', a===cur));
  }
  update();
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
})();

/* =========================================
   6) Tabs (ถ้ามีใน About)
========================================= */
(function tabs(){
  const group = $('.tabs');
  if(!group) return;
  const tabs = $$('.tab', group);
  const panels = $$('.panel');
  function show(name){
    panels.forEach(p => p.hidden = p.dataset.panel !== name);
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  }
  tabs.forEach(t => t.addEventListener('click', ()=> show(t.dataset.tab)));
  // ค่าเริ่มต้น
  show(tabs[0]?.dataset.tab || panels[0]?.dataset.panel);
})();
