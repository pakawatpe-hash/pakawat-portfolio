/* ===== RAF throttle ===== */
const rafThrottle = (fn) => { let t=false; return (...a)=>{ if(t) return; t=true; requestAnimationFrame(()=>{ fn(...a); t=false; }); }; };
const isFinePointer = matchMedia('(pointer: fine)').matches;

/* ===== Reveal elements ===== */
const revealEls = document.querySelectorAll('.reveal, .card, .contact-card');
const io = new IntersectionObserver((ents)=>{ ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); },{threshold:0.15});
revealEls.forEach(el=>io.observe(el));

/* ===== Minor UI (tilt, marquee, cursor, etc.) — unchanged fromก่อนหน้า (ตัดทอนสำหรับความสั้น) ===== */
// ...คุณสามารถคงของเดิมไว้ได้ (ไม่แตะ)

/* ===== Dangling Badge — DRAGGABLE PENDULUM ===== */
(() => {
  const root = document.getElementById('hangBadge');
  if (!root) return;

  /* ---- Parameters ---- */
  let L = 160;                        // เริ่มเชือกยาว (px) — คล้ายคลิป
  const L_MIN = 90, L_MAX = 260;      // ขอบเขตยืด/หดตอนลาก
  const g = 1400;                     // แรงโน้มถ่วง (px/s^2)
  const damping = 0.995;              // หน่วงอากาศ
  const maxDeg = 55;                  // จำกัดมุม (กว้างเพื่อเขวี้ยงได้จุใจ)
  const parallax = 8;                 // การ์ดเอียง 3D
  const stringStretch = 0.055;        // เชือกยืดตามความเร็ว
  const windStrength = 0.9;           // ลมเบาๆ พื้นหลัง
  const mouseTorque = 0.0;            // ตอนนี้ปิด torque เมาส์ (เพราะเรา "ลากจริง")

  /* ---- State ---- */
  let angle = 0.25;                   // rad
  let vel = 0;                        // rad/s
  let lastT = performance.now();

  // apply rope length to CSS + pivot
  const applyRope = () => {
    root.style.setProperty('--rope', `${L}px`);
    root.style.transformOrigin = `50% -${L}px`;
  };
  applyRope();

  const card   = root.querySelector('.hb-card');
  const string = root.querySelector('.hb-string');
  const shadow = root.querySelector('.hb-shadow');

  /* ---- Wind (value noise + gust) ---- */
  let windPhase = Math.random() * 1000, gust = 0, gustTimer = 0;
  const noise1D = (t)=>{ const i=Math.floor(t), f=t-i, s=f*f*(3-2*f); const r1=(Math.sin(i*127.1)*43758.5453)%1, r2=(Math.sin((i+1)*127.1)*43758.5453)%1; return (r1*(1-s)+r2*s)*2-1; };

  /* ---- Helpers ---- */
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const deg = r => r*180/Math.PI;

  /* ---- Pointer drag (mouse + touch) ---- */
  let dragging = false;
  let lastAngleForVel = angle; // ใช้คำนวณความเร็วตอนลาก
  const getPivot = () => {
    const r = root.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top - L }; // จุดหมุนอยู่เหนือ element L px
  };
  const startDrag = (x,y) => {
    dragging = true;
    // ไม่มีอะไรพิเศษ แค่ตั้งค่าเริ่ม
    lastAngleForVel = angle;
  };
  const moveDrag = (x,y, dt) => {
    const p = getPivot();
    const dx = x - p.x;
    const dy = y - p.y;
    // มุมวัดจากแกนตั้ง (ลงล่าง = 0) → atan2(dx, dy)
    let a = Math.atan2(dx, dy);
    // ความยาวจาก pivot ถึง pointer = ปรับ L แบบ realtime
    const r = Math.sqrt(dx*dx + dy*dy);
    L = clamp(r, L_MIN, L_MAX);
    applyRope();

    // ตั้งค่า angle + velocity จากความต่างในเฟรมนี้ เพื่อให้ "ฟีลเขวี้ยง"
    const prev = angle;
    angle = clamp(a, -maxDeg*Math.PI/180, maxDeg*Math.PI/180);
    vel = (angle - prev) / Math.max(1e-3, dt); // rad/s
  };
  const endDrag = () => {
    dragging = false;
    // ปล่อยแล้วให้วิ่งต่อด้วย vel ที่สะสมอยู่
  };

  const getXY = (ev) => {
    if (ev.touches && ev.touches[0]) return {x:ev.touches[0].clientX, y:ev.touches[0].clientY};
    return {x:ev.clientX, y:ev.clientY};
  };

  root.addEventListener('pointerdown', (e)=>{
    e.preventDefault();
    const {x,y} = getXY(e);
    startDrag(x,y);
  });
  window.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const now = performance.now();
    const dt = Math.min(0.032, (now-lastT)/1000); // ใช้ dt เดียวกับฟิสิกส์
    const {x,y} = getXY(e);
    moveDrag(x,y, dt);
  }, {passive:false});
  window.addEventListener('pointerup', ()=> dragging && endDrag());

  /* ---- Scroll impulse (เขย่าเพิ่ม) ---- */
  let lastY = window.scrollY;
  window.addEventListener('scroll', rafThrottle(()=>{
    const dy = window.scrollY - lastY; lastY = window.scrollY;
    vel += clamp(dy * 0.004, -0.8, 0.8);
  }), {passive:true});

  /* ---- Core physics loop ---- */
  function tick(now){
    const dt = Math.min(0.032, (now - lastT) / 1000);
    lastT = now;

    // ถ้าไม่ได้ลาก → อัปเดตด้วยสมการลูกตุ้ม
    if(!dragging){
      // ลม + กัสต์
      windPhase += dt * 0.35;
      if (gustTimer <= 0 && Math.random() < 0.01) { gust = (Math.random()*2-1)*1.5; gustTimer = 0.5 + Math.random()*0.7; }
      else { gust *= 0.98; gustTimer -= dt; }
      const wind = (noise1D(windPhase) * windStrength + gust);
      const windTorque = wind * 0.06;

      const acc = -(g / L) * Math.sin(angle) + mouseTorque + windTorque;
      vel += acc * dt;
      vel *= damping;
      angle += vel * dt;

      // ป้องกันเลยมุม
      const maxRad = maxDeg * Math.PI / 180;
      if (angle > maxRad) { angle = maxRad; vel = -Math.abs(vel)*0.75; }
      if (angle < -maxRad){ angle = -maxRad; vel =  Math.abs(vel)*0.75; }
    }

    // แสดงผล
    const aDeg = deg(angle);
    root.style.transform = `rotate(${aDeg.toFixed(2)}deg)`;

    // เชือกยืดตามความเร็ว
    const stretch = 1 + Math.min(0.18, Math.abs(vel) * stringStretch);
    string.style.transform = `translateX(-50%) scaleY(${stretch.toFixed(3)})`;

    // การ์ดเอียง 3D ตามมุม
    const rx = clamp(-aDeg * 0.18, -parallax, parallax);
    const ry = clamp( aDeg * 0.28, -parallax*1.5, parallax*1.5);
    card.style.transform = `translateZ(0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

    // เงา
    const sway = Math.sin(angle);
    const shadowOffset = 14 + Math.abs(vel)*4;
    const shadowScale = clamp(1 + Math.abs(aDeg)*0.013, 1, 1.65);
    shadow.style.transform = `translate(calc(-50% + ${sway*18}px), ${shadowOffset}px) scale(${shadowScale.toFixed(3)}, 1)`;
    shadow.style.opacity = String(0.5 + Math.min(0.35, Math.abs(vel)*0.14));

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
