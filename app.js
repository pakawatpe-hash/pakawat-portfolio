/* =======================
   Pakawat Portfolio - app.js
   (Marquee: offscreen-in/offscreen-out, 2 directions, seamless)
======================= */

/* ===== Utils ===== */
const rafThrottle = (fn) => {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { fn(...args); ticking = false; });
  };
};

const isFinePointer = matchMedia("(pointer: fine)").matches;
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Reveal elements ===== */
(() => {
  const targets = document.querySelectorAll(".reveal, .card, .contact-card");
  if (!targets.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(!e.isIntersecting) return; e.target.classList.add("in"); io.unobserve(e.target); });
  },{threshold:0.15});
  targets.forEach(el=>io.observe(el));
})();

/* ===== Section lazy ===== */
(() => {
  const secs = document.querySelectorAll("section.lazy");
  if (!secs.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(!e.isIntersecting) return; e.target.classList.add("entered"); obs.unobserve(e.target); });
  },{threshold:0.12});
  secs.forEach(s=>obs.observe(s));
})();

/* ===== Tilt + Glare ===== */
(() => {
  const tilts = document.querySelectorAll(".tilt");
  if (!tilts.length) return;
  tilts.forEach((el)=>{
    const glare = el.querySelector(".glare-spot");
    const onMove = (e)=>{
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - .5;
      const y = (e.clientY - r.top)/r.height - .5;
      el.style.transform = `rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg)`;
      if(glare){
        glare.style.left = `${e.clientX - r.left}px`;
        glare.style.top  = `${e.clientY - r.top}px`;
        glare.style.opacity = 0.65;
      }
    };
    el.addEventListener("mousemove", onMove, {passive:true});
    el.addEventListener("mouseleave", ()=>{ el.style.transform="rotateX(0) rotateY(0)"; if(glare) glare.style.opacity=0; }, {passive:true});
  });
})();

/* ===== Magnetic hover ===== */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;
  const magnets = document.querySelectorAll(".magnetic");
  const strength = 12;
  magnets.forEach((m)=>{
    const onMove = rafThrottle((e)=>{
      const r = m.getBoundingClientRect();
      const x = ((e.clientX - r.left)/r.width - .5) * strength;
      const y = ((e.clientY - r.top)/r.height - .5) * strength;
      m.style.transform = `translate(${x}px, ${y}px)`;
    });
    m.addEventListener("mousemove", onMove, {passive:true});
    m.addEventListener("mouseleave", ()=>{ m.style.transform = "translate(0,0)"; }, {passive:true});
  });
})();

/* ===== Parallax blobs & thumbs ===== */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;
  const blobs = document.querySelectorAll(".bg-blob");
  const parallaxes = document.querySelectorAll(".parallax");
  if (!blobs.length && !parallaxes.length) return;

  const onMouseMove = rafThrottle((e)=>{
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    blobs.forEach((b,i)=>{ const mul=i+1; b.style.transform = `translate(${nx*8*mul}px, ${ny*8*mul}px)`; });
    parallaxes.forEach((el)=>{ const d=parseFloat(el.dataset.depth||"0.1"); el.style.transform = `translate(${nx*d*40}px, ${ny*d*40}px)`; });
  });
  document.addEventListener("mousemove", onMouseMove, {passive:true});
})();

/* ===== Cursor blob & dot ===== */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;
  const blob = document.querySelector(".cursor-blob");
  const dot  = document.querySelector(".cursor-dot");
  if (!blob || !dot) return;
  let bx=innerWidth/2, by=innerHeight/2, tx=bx, ty=by;
  window.addEventListener("mousemove",(e)=>{ tx=e.clientX; ty=e.clientY; dot.style.left=`${tx}px`; dot.style.top=`${ty}px`; },{passive:true});
  const tick=()=>{ bx+=(tx-bx)*0.12; by+=(ty-by)*0.12; blob.style.left=`${bx}px`; blob.style.top=`${by}px`; requestAnimationFrame(tick); };
  tick();
})();

/* ===== Intro ===== */
(() => {
  const intro = document.getElementById("intro");
  if (!intro) return;
  document.body.classList.add("intro-lock");

  const el = intro.querySelector(".intro-title .line-2");
  if(el){
    const full = el.textContent.trim(); el.textContent="";
    let i=0; const step=()=>{ el.textContent = full.slice(0, ++i); if(i<full.length) setTimeout(step,70); };
    setTimeout(step,260);
  }

  const closeIntro = ()=>{ intro.classList.add("hide"); setTimeout(()=>{ intro.remove(); document.body.classList.remove("intro-lock"); window.scrollTo({top:0,behavior:"auto"}); },650); };
  window.addEventListener("load", ()=> setTimeout(closeIntro, 2400), {once:true});
})();

/* ===== Stats counter ===== */
(() => {
  const counters = document.querySelectorAll(".stat-card[data-count] .num");
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const n = e.target; const target = +n.parentElement.dataset.count || 0;
      let cur=0; const step=Math.max(1, Math.floor(target/60));
      const inc=()=>{ cur=Math.min(target, cur+step); n.textContent=cur; if(cur<target) requestAnimationFrame(inc); };
      inc(); obs.unobserve(n);
    });
  },{threshold:0.5});
  counters.forEach(n=>obs.observe(n));
})();

/* ===== Tabs ===== */
(() => {
  const tabs = document.querySelectorAll(".tab");
  if (!tabs.length) return;
  const panels = {
    projects: document.getElementById("panel-projects"),
    certs: document.getElementById("panel-certs"),
    stack: document.getElementById("panel-stack"),
  };
  const show=(key)=>{
    tabs.forEach(t=>{ const on=t.dataset.tab===key; t.classList.toggle("active",on); t.setAttribute("aria-selected", on?"true":"false"); });
    Object.entries(panels).forEach(([k,p])=>{ if(!p) return; if(k===key) p.removeAttribute("hidden"); else p.setAttribute("hidden",""); });
  };
  tabs.forEach(t=>t.addEventListener("click", ()=>show(t.dataset.tab)));
  document.addEventListener("keydown",(e)=>{ if(!["ArrowLeft","ArrowRight"].includes(e.key)) return;
    const arr=[...tabs]; const i=arr.findIndex(t=>t.classList.contains("active"));
    const ni=e.key==="ArrowRight"?(i+1)%arr.length:(i-1+arr.length)%arr.length; arr[ni].focus(); arr[ni].click(); });
})();

/* ===== ScrollSpy ===== */
(() => {
  const links = document.querySelectorAll('#navLinks a[href^="#"]');
  if (!links.length) return;
  const sections = [...links].map(a=>document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spy=()=>{ const y=scrollY+120; let active=links[0]; sections.forEach((s,i)=>{ if(s.offsetTop<=y) active=links[i]; }); links.forEach(a=>a.classList.toggle("active", a===active)); };
  spy(); window.addEventListener("scroll", rafThrottle(spy), {passive:true});
})();

/* ===== Scroll progress ===== */
(() => {
  const bar = document.querySelector(".progress span"); if(!bar) return;
  const onScroll=rafThrottle(()=>{ const h=document.documentElement; const scrolled=h.scrollTop/(h.scrollHeight - h.clientHeight); bar.style.width=`${(scrolled*100).toFixed(2)}%`; });
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();
})();

/* ===== MARQUEE — Offscreen In/Out Conveyor (2 rows opposite) ===== */
(() => {
  const root = document.getElementById("skillsMarquee");
  if (!root) return;

  // สร้าง "สายพาน" ต่อแถว: มี 2 ขบวน (A/B) สลับกันเข้า-ออกจอ
  const buildRow = (rowEl, direction /* 'left' | 'right' */) => {
    const template = rowEl.querySelector(".track"); // ใช้รายการเดิมใน HTML
    if (!template) return;

    // วัดความสูงก่อน
    const tmp = template.cloneNode(true);
    tmp.style.visibility = "hidden";
    rowEl.appendChild(tmp);
    const rowHeight = tmp.getBoundingClientRect().height || 44;
    tmp.remove();

    // สร้าง unit A/B จาก template (หนึ่ง unit = 1 ขบวน)
    const makeUnit = () => {
      const u = document.createElement("div");
      u.className = "unit";
      Array.from(template.children).forEach(ch => u.appendChild(ch.cloneNode(true)));
      rowEl.appendChild(u);
      return u;
    };
    const unitA = makeUnit();
    const unitB = makeUnit();

    // ลบ template เดิมออก (ป้องกันซ้ำ)
    template.remove();

    // คำนวณความกว้างขบวนจาก unitA (กว้างสุดในสองตัว)
    const measureWidth = () => {
      const aW = unitA.getBoundingClientRect().width;
      const bW = unitB.getBoundingClientRect().width;
      return Math.max(aW, bW);
    };

    // สถานะ
    const state = {
      dir: direction === "left" ? -1 : 1,  // -1 = เคลื่อนซ้าย, 1 = ขวา
      speed: 120,                           // px/sec
      width: 0,
      ax: 0,
      bx: 0,
    };

    // เริ่มต้นให้อยู่นอกจอ แล้วค่อยๆ ไหลเข้ามา
    const setupPositions = () => {
      rowEl.style.height = `${rowHeight}px`;
      state.width = measureWidth();

      const vw = rowEl.clientWidth || window.innerWidth;
      const gap = 48; // ระยะเว้นระหว่างขบวน (จะไม่เห็นซ้อนกัน)

      if (state.dir < 0) {
        // วิ่งไปทางซ้าย: ให้เริ่มจากขอบขวา (นอกจอ) แล้วไหลเข้า
        state.ax = vw;                      // เริ่มนอกจอขวา
        state.bx = state.ax + state.width + gap; // B ต่อท้าย A
      } else {
        // วิ่งไปทางขวา: ให้เริ่มจากขอบซ้าย (นอกจอ) แล้วไหลเข้า
        state.ax = -state.width - vw;       // เริ่มนอกจอซ้าย
        state.bx = state.ax - state.width - gap; // B อยู่ซ้ายกว่า A
      }

      apply();
    };

    const apply = () => {
      unitA.style.transform = `translateX(${state.ax.toFixed(2)}px)`;
      unitB.style.transform = `translateX(${state.bx.toFixed(2)}px)`;
    };

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      const v = state.speed * state.dir;
      state.ax += v * dt;
      state.bx += v * dt;

      const vw = rowEl.clientWidth || window.innerWidth;
      const w = state.width;
      const gap = 48;

      if (state.dir < 0) {
        // ไปซ้าย: ถ้าขบวนใด "ออกซ้ายจนหมด" (x + w <= 0) ให้ย้ายไปต่อท้ายอีกขบวน "นอกขวา"
        if (state.ax + w <= 0) state.ax = Math.max(state.ax, state.bx) + w + gap;
        if (state.bx + w <= 0) state.bx = Math.max(state.ax, state.bx) + w + gap;
      } else {
        // ไปขวา: ถ้าขบวนใด "ออกขวาจนหมด" (x >= vw) ให้ย้ายไปต่อหน้าอีกขบวน "นอกซ้าย"
        if (state.ax >= vw) state.ax = Math.min(state.ax, state.bx) - w - gap;
        if (state.bx >= vw) state.bx = Math.min(state.ax, state.bx) - w - gap;
      }

      apply();
      requestAnimationFrame(tick);
    };

    setupPositions();
    requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => { setupPositions(); });
    ro.observe(rowEl);
  };

  const rowLeft  = root.querySelector(".row.left");
  const rowRight = root.querySelector(".row.right");
  if (rowLeft)  buildRow(rowLeft,  "left");
  if (rowRight) buildRow(rowRight, "right");
})();
