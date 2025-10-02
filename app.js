/* =======================
   Pakawat Portfolio - app.js
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

/* ===== Parallax blobs & thumbs (1 handler) ===== */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;

  const blobs = document.querySelectorAll(".bg-blob");
  const parallaxes = document.querySelectorAll(".parallax");
  if (!blobs.length && !parallaxes.length) return;

  const onMouseMove = rafThrottle((e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;

    // BG blobs (soft sway)
    blobs.forEach((b, i) => {
      const mul = i + 1;
      b.style.transform = `translate(${nx * 8 * mul}px, ${ny * 8 * mul}px)`;
    });

    // Card thumbs parallax (depth-based)
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

  let bx = innerWidth / 2,
    by = innerHeight / 2;
  let tx = bx,
    ty = by;

  window.addEventListener(
    "mousemove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.left = `${tx}px`;
      dot.style.top = `${ty}px`;
    },
    { passive: true }
  );

  const tick = () => {
    bx += (tx - bx) * 0.12;
    by += (ty - by) * 0.12;
    blob.style.left = `${bx}px`;
    blob.style.top = `${by}px`;
    requestAnimationFrame(tick);
  };
  tick();
})();

/* ===== Intro (auto close + typewriter caret) ===== */
(() => {
  const intro = document.getElementById("intro");
  if (!intro) return;

  document.body.classList.add("intro-lock");

  // typewriter
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

  const closeIntro = () => {
    intro.classList.add("hide");
    setTimeout(() => {
      intro.remove();
      document.body.classList.remove("intro-lock");
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 650);
  };

  window.addEventListener("load", () => setTimeout(closeIntro, 2400), { once: true });
})();

/* ===== Stats counter ===== */
(() => {
  const counters = document.querySelectorAll(".stat-card[data-count] .num");
  if (!counters.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
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
    },
    { threshold: 0.5 }
  );

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
    arr[ni].focus();
    arr[ni].click();
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
    sections.forEach((sec, i) => {
      if (sec.offsetTop <= y) active = links[i];
    });
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

/* ===== Smooth Marquee (เข้า/ออกจากขอบจอ, ไม่ทับ, ไม่โผล่กลาง, 2 แถวคนละทิศ) ===== */
(() => {
  const root = document.getElementById("skillsMarquee");
  if (!root) return;

  const makeRow = (rowEl, dir = "left") => {
    const template = rowEl.querySelector(".track");
    if (!template) return;

    // สร้าง 2 unit (A/B) จากรายการไอคอนเดิม
    const makeUnit = () => {
      const u = document.createElement("div");
      u.className = "unit";
      Array.from(template.children).forEach(ch => u.appendChild(ch.cloneNode(true)));
      rowEl.appendChild(u);
      return u;
    };
    const A = makeUnit();
    const B = makeUnit();
    template.remove();

    const state = {
      dir: dir === "left" ? -1 : 1,
      speed: 90,   // px/sec (ปรับได้)
      gap: 80,     // ระยะห่างระหว่างขบวน
      ax: 0, bx: 0,
      aW: 0, bW: 0,
    };

    const measure = () => {
      // สูงแถว
      const h = A.getBoundingClientRect().height || 44;
      rowEl.style.height = `${h}px`;

      // กว้างของแต่ละขบวน
      state.aW = A.offsetWidth;
      state.bW = B.offsetWidth;

      const vw = rowEl.clientWidth || window.innerWidth;

      if (state.dir < 0) {
        // ไปซ้าย: เริ่มนอกขวา
        state.ax = vw + state.gap;
        state.bx = state.ax + state.aW + state.gap;
      } else {
        // ไปขวา: เริ่มนอกซ้าย
        state.ax = -state.aW - state.gap;
        state.bx = state.ax - state.bW - state.gap;
      }
    };

    const apply = () => {
      A.style.transform = `translateX(${state.ax}px)`;
      B.style.transform = `translateX(${state.bx}px)`;
    };

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      const v = state.speed * state.dir;
      const vw = rowEl.clientWidth || window.innerWidth;

      state.ax += v * dt;
      state.bx += v * dt;

      // รีเซ็ตเมื่อ "ออกนอกจอทั้งหมด" เท่านั้น แล้วไปต่อท้าย/ต่อหน้าอีกขบวน (ไม่โผล่กลาง)
      if (state.dir < 0) {
        // ไปซ้าย: ออกซ้ายเมื่อ x + width < 0
        if (state.ax + state.aW < 0) state.ax = Math.max(state.bx, state.ax) + state.bW + state.gap;
        if (state.bx + state.bW < 0) state.bx = Math.max(state.ax, state.bx) + state.aW + state.gap;
      } else {
        // ไปขวา: ออกขวาเมื่อ x > vw
        if (state.ax > vw) state.ax = Math.min(state.bx, state.ax) - state.aW - state.gap;
        if (state.bx > vw) state.bx = Math.min(state.ax, state.bx) - state.bW - state.gap;
      }

      apply();
      requestAnimationFrame(tick);
    };

    measure();
    apply();
    requestAnimationFrame(tick);

    new ResizeObserver(() => { measure(); apply(); }).observe(rowEl);
  };

  // สร้างแถวซ้าย/ขวา (คนละทิศ)
  const rowLeft  = root.querySelector(".row.left");
  const rowRight = root.querySelector(".row.right");
  if (rowLeft)  makeRow(rowLeft,  "left");
  if (rowRight) makeRow(rowRight, "right");
})();
