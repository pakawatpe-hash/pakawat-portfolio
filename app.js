/* =======================
   Pakawat Portfolio - app.js (v23)
   ======================= */

/* ===== Utils ===== */
const rafThrottle = (fn) => {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      fn(...args);
      ticking = false;
    });
  };
};

const isFinePointer = matchMedia("(pointer: fine)").matches;
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Reveal on scroll (elements) ===== */
(() => {
  const targets = document.querySelectorAll(".reveal, .card, .contact-card");
  if (!targets.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => io.observe(el));
})();

/* ===== Reveal whole sections ===== */
(() => {
  const secs = document.querySelectorAll("section.lazy");
  if (!secs.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("entered");
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.12 }
  );

  secs.forEach((s) => obs.observe(s));
})();

/* ===== Tilt + Glare (soft) ===== */
(() => {
  const tilts = document.querySelectorAll(".tilt");
  if (!tilts.length) return;

  tilts.forEach((el) => {
    const glare = el.querySelector(".glare-spot");
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
      if (glare) {
        glare.style.left = `${e.clientX - r.left}px`;
        glare.style.top = `${e.clientY - r.top}px`;
        glare.style.opacity = 0.65;
      }
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "rotateX(0) rotateY(0)";
      if (glare) glare.style.opacity = 0;
    });
  });
})();

/* ===== Magnetic hover ===== */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;

  const magnets = document.querySelectorAll(".magnetic");
  if (!magnets.length) return;

  const strength = 12;
  magnets.forEach((m) => {
    const onMove = rafThrottle((e) => {
      const r = m.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
      const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
      m.style.transform = `translate(${x}px, ${y}px)`;
    });

    m.addEventListener("mousemove", onMove, { passive: true });
    m.addEventListener("mouseleave", () => {
      m.style.transform = "translate(0,0)";
    });
  });
})();

/* ===== Parallax blobs & thumbs ===== */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;

  const blobs = document.querySelectorAll(".bg-blob");
  const parallaxes = document.querySelectorAll(".parallax");
  if (!blobs.length && !parallaxes.length) return;

  const onMouseMove = rafThrottle((e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;

    blobs.forEach((b, i) => {
      const mul = (i + 1);
      b.style.transform = `translate(${nx * 8 * mul}px, ${ny * 8 * mul}px)`;
    });

    parallaxes.forEach((el) => {
      const d = parseFloat(el.dataset.depth || "0.1");
      const x = nx * d * 40;
      const y = ny * d * 40;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  document.addEventListener("mousemove", onMouseMove, { passive: true });
})();

/* ===== Cursor blob & dot ===== */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;

  const blob = document.querySelector(".cursor-blob");
  const dot = document.querySelector(".cursor-dot");
  if (!blob || !dot) return;

  let bx = innerWidth / 2, by = innerHeight / 2;
  let tx = bx, ty = by;

  window.addEventListener("mousemove", (e) => {
    tx = e.clientX; ty = e.clientY;
    dot.style.left = `${tx}px`; dot.style.top = `${ty}px`;
  }, { passive: true });

  const tick = () => {
    bx += (tx - bx) * 0.12; by += (ty - by) * 0.12;
    blob.style.left = `${bx}px`; blob.style.top = `${by}px`;
    requestAnimationFrame(tick);
  };
  tick();
})();

/* ===== Intro (robust auto-close with watchdog) ===== */
(() => {
  const intro = document.getElementById("intro");
  if (!intro) return;

  document.body.classList.add("intro-lock");

  const el = intro.querySelector(".intro-title .line-2");
  if (el) {
    const full = el.textContent.trim();
    el.textContent = "";
    let i = 0;
    const step = () => {
      el.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(step, 70);
    };
    setTimeout(step, 260);
  }

  let closed = false;
  const closeIntro = () => {
    if (closed) return; closed = true;
    intro.classList.add("hide");
    setTimeout(() => {
      intro.remove();
      document.body.classList.remove("intro-lock");
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 650);
  };

  window.addEventListener("load", () => setTimeout(closeIntro, 2400), { once: true });

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  document.addEventListener("DOMContentLoaded", () => {
    Promise.race([fontsReady, new Promise(r => setTimeout(r, 1200))])
      .then(() => setTimeout(closeIntro, 1200));
  }, { once: true });

  setTimeout(closeIntro, 6000); // watchdog
  intro.addEventListener("click", closeIntro);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeIntro(); });
})();

/* ===== Stats counter ===== */
(() => {
  const counters = document.querySelectorAll(".stat-card[data-count] .num");
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const numEl = e.target;
      const target = +numEl.parentElement.dataset.count || 0;
      let cur = 0;
      const step = Math.max(1, Math.floor(target / 60));
      const inc = () => {
        cur = Math.min(target, cur + step);
        numEl.textContent = cur;
        if (cur < target) requestAnimationFrame(inc);
      };
      inc();
      obs.unobserve(numEl);
    });
  }, { threshold: 0.5 });

  counters.forEach((n) => obs.observe(n));
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

  const show = (key) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === key;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    Object.entries(panels).forEach(([k, p]) => {
      if (!p) return;
      if (k === key) p.removeAttribute("hidden");
      else p.setAttribute("hidden", "");
    });
  };

  tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.tab)));
  document.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const arr = [...tabs];
    const i = arr.findIndex((t) => t.classList.contains("active"));
    const ni = e.key === "ArrowRight" ? (i + 1) % arr.length : (i - 1 + arr.length) % arr.length;
    arr[ni].focus(); arr[ni].click();
  });
})();

/* ===== ScrollSpy ===== */
(() => {
  const links = document.querySelectorAll('#navLinks a[href^="#"]');
  if (!links.length) return;

  const sections = [...links]
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const spy = () => {
    const y = window.scrollY + 120;
    let active = links[0];
    sections.forEach((sec, i) => { if (sec.offsetTop <= y) active = links[i]; });
    links.forEach((a) => a.classList.toggle("active", a === active));
  };

  spy();
  window.addEventListener("scroll", rafThrottle(spy), { passive: true });
})();

/* ===== Scroll progress bar ===== */
(() => {
  const bar = document.querySelector(".progress span");
  if (!bar) return;
  const onScroll = rafThrottle(() => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    bar.style.width = `${(scrolled * 100).toFixed(2)}%`;
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ===== Double-Track Marquee (seamless + auto speed) ===== */
(() => {
  const setupTrack = (track) => {
    if (!track) return;
    const original = Array.from(track.children);
    if (!original.some((n) => n.hasAttribute && n.hasAttribute("data-dup"))) {
      const frag = document.createDocumentFragment();
      original.forEach((n) => { const c = n.cloneNode(true); c.setAttribute("data-dup", ""); frag.appendChild(c); });
      track.appendChild(frag);
    }
    const half = Math.floor(track.children.length / 2);
    let halfWidth = 0; const gap = parseFloat(getComputedStyle(track).gap || "0") || 0;
    for (let i = 0; i < half; i++) {
      halfWidth += track.children[i].getBoundingClientRect().width + gap;
    }
    const pxPerSec = 120;
    const duration = Math.max(14, halfWidth / pxPerSec);
    track.style.animationDuration = `${duration}s`;
  };

  const t1 = document.getElementById("skillsTrack1");
  const t2 = document.getElementById("skillsTrack2");
  setupTrack(t1); setupTrack(t2);
  window.addEventListener("load", () => { setupTrack(t1); setupTrack(t2); });
})();

/* ===== Dangling Badge — Real Pendulum (drag to pull & release) ===== */
(() => {
  const root = document.getElementById("hangBadge");
  if (!root) return;

  const string = root.querySelector(".hb-string");
  const card   = root.querySelector(".hb-card");
  const shadow = root.querySelector(".hb-shadow");
  const ring   = root.querySelector(".hb-ring");

  // Parameters
  let theta = 8 * Math.PI/180; // initial angle
  let omega = 0;               // angular velocity
  let L = 100;                 // rope length
  const G = 2500;              // gravity-like accel
  const DAMP = 0.995;          // air drag
  const MAX_DEG = 70;          // clamp
  const STR_STRETCH = 0.06;

  const measure = () => {
    const r = ring.getBoundingClientRect();
    const b = root.getBoundingClientRect();
    const px = r.left + r.width/2, py = r.top + r.height/2;
    const cx = b.left + b.width/2, cy = b.top + b.height/2;
    L = Math.max(60, Math.hypot(cx-px, cy-py));
  };
  measure();
  addEventListener("resize", measure);

  const rad = d => d*Math.PI/180;
  const clampAngle = a => Math.max(-rad(MAX_DEG), Math.min(rad(MAX_DEG), a));

  // Drag to pull
  let dragging = false, lastT = performance.now(), lastMoveT = lastT;

  const setFromPointer = (x,y) => {
    const r = ring.getBoundingClientRect();
    const px = r.left + r.width/2, py = r.top + r.height/2;
    const dx = x - px, dy = y - py;
    theta = Math.atan2(dx, dy); // angle from vertical
    theta = clampAngle(theta);
  };

  const onDown = (e) => {
    dragging = true; omega = 0; root.classList.add("dragging");
    const p = e.touches?.[0] || e;
    setFromPointer(p.clientX, p.clientY);
    lastMoveT = performance.now();
    e.preventDefault();
  };
  const onMove = (e) => {
    if(!dragging) return;
    const p = e.touches?.[0] || e;
    const tNow = performance.now();
    const dt = Math.max(1, tNow - lastMoveT) / 1000;
    const prev = theta;
    setFromPointer(p.clientX, p.clientY);
    omega = (theta - prev) / dt; // carry momentum
    lastMoveT = tNow;
  };
  const onUp = () => { dragging=false; root.classList.remove("dragging"); };

  root.addEventListener("mousedown", onDown);
  addEventListener("mousemove", onMove, {passive:false});
  addEventListener("mouseup", onUp);
  root.addEventListener("touchstart", onDown, {passive:false});
  addEventListener("touchmove", onMove, {passive:false});
  addEventListener("touchend", onUp);
  addEventListener("touchcancel", onUp);

  // Small scroll impulse
  let lastY = scrollY;
  addEventListener("scroll", rafThrottle(()=>{
    const dy = scrollY - lastY; lastY = scrollY;
    omega += Math.max(-6, Math.min(6, dy * 0.008));
  }), {passive:true});

  // Double click toggle mini
  root.addEventListener("dblclick", (e)=>{ e.preventDefault(); root.classList.toggle("min"); });

  // Physics loop
  const tick = (now) => {
    const dt = Math.min(32, now - lastT) / 1000; lastT = now;

    if(!dragging){
      const alpha = - (G / L) * Math.sin(theta);
      omega += alpha * dt;
      omega *= DAMP;
      theta += omega * dt;

      const hard = Math.PI * MAX_DEG / 180;
      if (Math.abs(theta) > hard){
        theta = Math.sign(theta) * hard;
        omega *= 0.6;
      }
    }

    root.style.transform = `rotate(${(theta*180/Math.PI).toFixed(3)}deg)`;

    const stretch = 1 + Math.min(0.14, Math.abs(omega) * STR_STRETCH);
    string.style.transform = `translateX(-50%) scaleY(${stretch.toFixed(3)})`;

    const deg = theta*180/Math.PI;
    const rx = Math.max(-7, Math.min(7, -deg * 0.18));
    const ry = Math.max(-10, Math.min(10,  deg * 0.28));
    card.style.transform = `translateZ(0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

    const sway = Math.sin(theta);
    const shOff = 14 + Math.abs(omega)*3.2;
    const shScale = Math.max(1, Math.min(1.55, 1 + Math.abs(deg)*0.012));
    shadow.style.transform = `translate(calc(-50% + ${sway*16}px), ${shOff}px) scale(${shScale.toFixed(3)}, 1)`;
    shadow.style.opacity = String(0.55 + Math.min(0.3, Math.abs(omega)*0.12));

    requestAnimationFrame(tick);
  };
  requestAnimationFrame((t)=>{ lastT = t; tick(t); });
})();
