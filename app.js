/* ===== Utils: RAF throttle ===== */
function rafThrottle(fn){
  var ticking = false;
  return function(){
    if (ticking) return;
    ticking = true;
    var args = arguments;
    requestAnimationFrame(function(){ fn.apply(null,args); ticking = false; });
  };
}
var isFinePointer = matchMedia('(pointer: fine)').matches;

/* ===== Reveal on scroll ===== */
(function(){
  var revealEls = document.querySelectorAll('.reveal, .card, .contact-card');
  if (!revealEls.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  },{threshold:0.15});
  revealEls.forEach(function(el){ io.observe(el); });
})();

/* ===== Section lazy ===== */
(function(){
  var secs = document.querySelectorAll('section.lazy');
  if(!secs.length) return;
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) { e.target.classList.add('entered'); obs.unobserve(e.target); }
    });
  },{threshold:0.12});
  secs.forEach(function(s){ obs.observe(s); });
})();

/* ===== Tilt + Glare ===== */
(function(){
  var tiles = document.querySelectorAll('.tilt');
  tiles.forEach(function(el){
    var glare = el.querySelector('.glare-spot');
    function handle(e){
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left)/r.width - .5;
      var y = (e.clientY - r.top)/r.height - .5;
      var rx = (-y*7).toFixed(2);
      var ry = ( x*9).toFixed(2);
      el.style.transform = 'perspective(900px) rotateX('+rx+'deg) rotateY('+ry+'deg)';
      if(glare){
        glare.style.left = (e.clientX - r.left)+'px';
        glare.style.top  = (e.clientY - r.top)+'px';
        glare.style.opacity = '.65';
      }
    }
    el.addEventListener('mousemove', handle, {passive:true});
    el.addEventListener('mouseleave', function(){
      el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
      if(glare) glare.style.opacity = 0;
    }, {passive:true});
  });
})();

/* ===== Magnetic hover ===== */
(function(){
  if(!isFinePointer) return;
  var magnets = document.querySelectorAll('.magnetic');
  var strength = 12;
  magnets.forEach(function(m){
    var onMove = rafThrottle(function(e){
      var r = m.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width - .5) * strength;
      var y = ((e.clientY - r.top) / r.height - .5) * strength;
      m.style.transform = 'translate('+x+'px,'+y+'px)';
    });
    m.addEventListener('mousemove', onMove, {passive:true});
    m.addEventListener('mouseleave', function(){ m.style.transform = 'translate(0,0)'; }, {passive:true});
  });
})();

/* ===== Parallax blobs & thumbs ===== */
if (isFinePointer) {
  document.addEventListener('mousemove', rafThrottle(function(e){
    var x = (e.clientX / innerWidth - .5) * 8;
    var y = (e.clientY / innerHeight - .5) * 8;
    document.querySelectorAll('.bg-blob').forEach(function(b,i){
      b.style.transform = 'translate('+(x*(i+1))+'px,'+(y*(i+1))+'px)';
    });
  }), {passive:true});

  document.addEventListener('mousemove', rafThrottle(function(e){
    document.querySelectorAll('.parallax').forEach(function(el){
      var depth = parseFloat(el.getAttribute('data-depth')||'0.1');
      var x = ((e.clientX / window.innerWidth) - .5) * depth * 40;
      var y = ((e.clientY / window.innerHeight) - .5) * depth * 40;
      el.style.transform = 'translate('+x+'px,'+y+'px)';
    });
  }), {passive:true});
}

/* ===== Cursor blob & dot ===== */
(function(){
  if(!isFinePointer) return;
  var blob = document.querySelector('.cursor-blob');
  var dot = document.querySelector('.cursor-dot');
  if(!blob || !dot) return;
  var bx = innerWidth/2, by = innerHeight/2;
  var tx = bx, ty = by;
  window.addEventListener('mousemove', function(e){
    tx=e.clientX; ty=e.clientY;
    dot.style.left=tx+'px'; dot.style.top =ty+'px';
  }, {passive:true});
  (function tick(){
    bx += (tx-bx)*0.12; by += (ty-by)*0.12;
    blob.style.left=bx+'px'; blob.style.top =by+'px';
    requestAnimationFrame(tick);
  })();
})();

/* ===== Intro ===== */
(function(){
  var intro = document.getElementById('intro');
  if(!intro) return;
  document.body.classList.add('intro-lock');
  var el = intro.querySelector('.intro-title .line-2');
  if(el){
    var full = (el.textContent||'').trim(); el.textContent = '';
    var i = 0;
    function step(){ el.textContent = full.slice(0, ++i); if(i < full.length) setTimeout(step, 70); }
    setTimeout(step, 260);
  }
  function closeIntro(){
    intro.classList.add('hide');
    setTimeout(function(){ intro.remove(); document.body.classList.remove('intro-lock'); window.scrollTo({top:0,behavior:'auto'}); }, 650);
  }
  window.addEventListener('load', function(){ setTimeout(closeIntro, 2400); }, {once:true});
})();

/* ===== Stats counter ===== */
(function(){
  var counters = document.querySelectorAll('.stat-card[data-count] .num');
  if(!counters.length) return;
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      var numEl = e.target; var target = +(numEl.parentElement.getAttribute('data-count')||0);
      var cur = 0; var step = Math.max(1, Math.floor(target/60));
      (function inc(){ cur=Math.min(target, cur+step); numEl.textContent=cur; if(cur<target) requestAnimationFrame(inc); })();
      obs.unobserve(numEl);
    });
  },{threshold:0.5});
  counters.forEach(function(n){ obs.observe(n); });
})();

/* ===== Tabs ===== */
(function(){
  var tabs = document.querySelectorAll('.tab');
  if(!tabs.length) return;
  var panels = {
    projects: document.getElementById('panel-projects'),
    certs: document.getElementById('panel-certs'),
    stack: document.getElementById('panel-stack')
  };
  function show(key){
    tabs.forEach(function(t){
      var on = t.getAttribute('data-tab')===key;
      t.classList.toggle('active',on);
      t.setAttribute('aria-selected', on ? 'true':'false');
    });
    for (var k in panels){
      if(!panels[k]) continue;
      if (k===key) panels[k].removeAttribute('hidden'); else panels[k].setAttribute('hidden','');
    }
  }
  tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.getAttribute('data-tab')); }, {passive:true}); });
  document.addEventListener('keydown', function(e){
    if(e.key!=='ArrowLeft' && e.key!=='ArrowRight') return;
    var arr=Array.prototype.slice.call(tabs);
    var i=arr.findIndex(function(t){return t.classList.contains('active')});
    if(i<0) i=0;
    var ni=e.key==='ArrowRight'?(i+1)%arr.length:(i-1+arr.length)%arr.length;
    arr[ni].click();
  });
})();

/* ===== ScrollSpy ===== */
(function(){
  var links = document.querySelectorAll('#navLinks a[href^="#"]');
  if(!links.length) return;
  var sections = [];
  links.forEach(function(a){
    var sel = a.getAttribute('href');
    var sec = document.querySelector(sel);
    if(sec) sections.push(sec);
  });
  function spy(){
    var y=window.scrollY+120; var active=links[0];
    sections.forEach(function(sec,i){ if(sec.offsetTop<=y) active=links[i]; });
    links.forEach(function(a){ a.classList.toggle('active', a===active); });
  }
  spy(); window.addEventListener('scroll', rafThrottle(spy), {passive:true});
})();

/* ===== Scroll progress ===== */
(function(){
  var bar = document.querySelector('.progress span'); if(!bar) return;
  function onScroll(){
    var h = document.documentElement;
    var scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    bar.style.width = (scrolled*100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', rafThrottle(onScroll), {passive:true}); onScroll();
})();

/* ===== Marquee (no clone) ===== */
(function(){
  var ROOT = document.documentElement;
  var prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cssVar(name){
    var v = getComputedStyle(ROOT).getPropertyValue(name);
    return parseFloat(v)||0;
  }
  var BASE_SPEED = Math.max(20, cssVar('--mk-speed') || 120);
  var ENABLED = !prefersReduced && BASE_SPEED > 0;

  var belt = document.getElementById('skillsBelt');
  if(!belt) return;
  var rowA = belt.querySelector('.mk-row.mk-a');
  var rowB = belt.querySelector('.mk-row.mk-b');
  var aTrack = rowA ? rowA.querySelector('.mk-track') : null;
  var bTrack = rowB ? rowB.querySelector('.mk-track') : null;
  if(!aTrack || !bTrack) return;

  var tracks = [
    { el:aTrack, dir:-1, rowW:0, contentW:0, x:0, startX:0, endX:0, dist:0, speed:0, vx:0 },
    { el:bTrack, dir:+1, rowW:0, contentW:0, x:0, startX:0, endX:0, dist:0, speed:0, vx:0 }
  ];

  function metrics(trackEl){
    var row = trackEl.closest('.mk-row');
    return { rowW: row ? row.clientWidth : 0, contentW: trackEl.scrollWidth || 0 };
  }
  function setBounds(t){
    if (t.dir === -1){ t.startX = t.rowW; t.endX = -t.contentW; }
    else { t.startX = -t.contentW; t.endX = t.rowW; }
    t.dist = Math.max(1, Math.abs(t.endX - t.startX));
  }
  function syncSpeeds(){
    var maxDist = Math.max(tracks[0].dist, tracks[1].dist);
    var T = maxDist / BASE_SPEED;
    tracks.forEach(function(t){
      t.speed = t.dist / T;
      t.vx = (t.endX > t.startX ? +t.speed : -t.speed);
    });
  }
  function init(keepProgress){
    tracks.forEach(function(t){
      var m = metrics(t.el);
      var oldStart = t.startX, oldEnd = t.endX, oldRange = (oldEnd - oldStart) || 1;
      var oldP = keepProgress ? (t.x - oldStart) / oldRange : 0;
      t.rowW = m.rowW; t.contentW = Math.max(1, m.contentW);
      setBounds(t);
      if (keepProgress){
        var newRange = (t.endX - t.startX) || 1;
        t.x = t.startX + oldP * newRange;
      }else{
        t.x = t.startX;
      }
      t.el.style.willChange = 'transform';
      t.el.style.animation = 'none';
      t.el.style.transform = 'translateX('+t.x.toFixed(2)+'px)';
    });
    syncSpeeds();
  }
  var last = performance.now();
  function frame(now){
    var dt = Math.min(0.05, (now - last)/1000);
    last = now;
    if (ENABLED){
      tracks.forEach(function(t){
        t.x += t.vx * dt;
        var forward = t.endX > t.startX;
        var done = forward ? (t.x >= t.endX) : (t.x <= t.endX);
        if (done) t.x = t.startX;
        t.el.style.transform = 'translateX('+t.x.toFixed(2)+'px)';
      });
    }
    requestAnimationFrame(frame);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ init(false); requestAnimationFrame(function(t0){ last=t0; frame(t0); }); }, {once:true});
  } else {
    init(false); requestAnimationFrame(function(t0){ last=t0; frame(t0); });
  }
  window.addEventListener('resize', function(){ init(true); }, {passive:true});
})();

/* ===== Code window: word-by-word glow sweep ===== */
(function(){
  var host = document.querySelector('.code-window pre code');
  if (!host) return;
  if (host.dataset.glowInit === '1') return;
  host.dataset.glowInit = '1';

  if (!document.createTreeWalker) return;
  var NF = window.NodeFilter || { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2 };
  var walker = document.createTreeWalker(
    host, NF.SHOW_TEXT,
    { acceptNode: function(n){
        if (n.parentElement && n.parentElement.classList.contains('glow-word')) return NF.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim() ? NF.FILTER_ACCEPT : NF.FILTER_REJECT;
      }
    }, false
  );

  var textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach(function(t){
    if (!t.parentNode) return;
    var parts = t.nodeValue.split(/(\s+)/);
    var frag = document.createDocumentFragment();
    parts.forEach(function(p){
      if (!p || /^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
      else { var s = document.createElement('span'); s.className = 'glow-word'; s.textContent = p; frag.appendChild(s); }
    });
    t.parentNode.replaceChild(frag, t);
  });

  var words = Array.prototype.slice.call(host.querySelectorAll('.glow-word'));
  if (!words.length) return;

  function rgbaWithAlpha(cssColor, a) {
    var m = cssColor && cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (m) return 'rgba('+m[1]+','+m[2]+','+m[3]+','+a+')';
    var tmp = document.createElement('span'); tmp.style.color = cssColor || ''; document.body.appendChild(tmp);
    var rgb = getComputedStyle(tmp).color; document.body.removeChild(tmp);
    var m2 = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    return m2 ? 'rgba('+m2[1]+','+m2[2]+','+m2[3]+','+a+')' : 'rgba(255,255,255,'+a+')';
  }

  var TRAIL = 4, STEP = 80, idx = 0, timer;
  function setGlow(el, on){
    if (!el) return;
    if (on){
      var base = getComputedStyle(el).color;
      el.style.color = '#fff';
      el.style.filter = 'saturate(1.1)';
      el.style.textShadow = '0 0 10px '+rgbaWithAlpha(base,0.85)+', 0 0 18px '+rgbaWithAlpha(base,0.55);
    }else{
      el.style.textShadow = ''; el.style.filter = ''; el.style.color = '';
    }
  }
  function tick(){
    if (idx < words.length) setGlow(words[idx], true);
    var drop = idx - TRAIL;
    if (drop >= 0 && drop < words.length) setGlow(words[drop], false);
    idx++;
    if (idx > words.length + TRAIL){ words.forEach(function(w){ setGlow(w,false); }); idx = 0; }
    timer = setTimeout(tick, STEP);
  }
  tick();
  window.addEventListener('pagehide', function(){ clearTimeout(timer); }, { once: true });
  window.addEventListener('beforeunload', function(){ clearTimeout(timer); }, { once: true });
})();

/* ===== Education axis spark ===== */
(function(){
  var tl = document.querySelector('.edu-timeline');
  if (!tl) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('.edu-item'));
  function updateAxis(){
    var r  = tl.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh/2 - r.top) / r.height; p = Math.max(0, Math.min(1, p));
    tl.style.setProperty('--spark-y', (p*100).toFixed(2)+'%');
    var mid = vh/2;
    items.forEach(function(el){
      var er = el.getBoundingClientRect();
      var anchor = er.top + 56;
      var prog = 1 - Math.abs(anchor - mid) / (vh * 0.45);
      prog = Math.max(0, Math.min(1, prog));
      prog = Math.pow(prog, 0.6);
      el.style.setProperty('--line-prog', prog.toFixed(3));
    });
  }
  function onScroll(){ updateAxis(); }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll, { passive:true });
  onScroll();
})();

/* ===== Certificates (JPG) ===== */
(function(){
  var data = [
    { title: "Cybersecurity พื้นฐาน (2 ชม.)", file: "assets/certs/cert-01.jpg", category: "programming" },
    { title: "นักพัฒนา Hardware (ชั้น 3)", file: "assets/certs/cert-02.jpg", category: "programming" },
    { title: "นักพัฒนา Applications (ระดับ 5)", file: "assets/certs/cert-03.jpg", category: "programming" },
    { title: "ผู้ให้บริการ Hardware (ระดับ 4)", file: "assets/certs/cert-04.jpg", category: "ai" },
    { title: "นักพัฒนา Hardware (ระดับ 4)", file: "assets/certs/cert-05.jpg", category: "programming" },
    { title: "นักพัฒนา Cloud (ระดับ 5)", file: "assets/certs/cert-06.jpg", category: "other" },
    { title: "นักออกเเบบศิลปะเกม 3D (ระดับ 5)", file: "assets/certs/cert-07.jpg", category: "programming" },
    { title: "นักพัฒนา Software เครือข่าย (ระดับ 4)", file: "assets/certs/cert-08.jpg", category: "hardware" },
    { title: "วิศวะกรรมข้อมูล (ระดับ 5)", file: "assets/certs/cert-09.jpg", category: "data" },
    { title: "นักทดสอบระบบ (ระดับ 5)", file: "assets/certs/cert-10.jpg", category: "hardware" }
  ];

  var panel = document.getElementById('panel-certs');
  if(!panel) return;
  var grid = document.getElementById('certGrid');
  var filterBtns = panel.querySelectorAll('.cert-filters .chip');

  function render(list){
    grid.innerHTML = '';
    var frag = document.createDocumentFragment();
    list.forEach(function(cert){
      var card = document.createElement('article');
      card.className = 'cert-card glass';
      card.innerHTML =
        '<img src="'+cert.file+'" alt="'+cert.title+'" class="cert-thumb" loading="lazy">'+
        '<div class="cert-meta">'+
          '<div class="cert-title">'+cert.title+'</div>'+
          '<div class="cert-actions">'+
            '<button class="btn tiny" data-view>ดู</button>'+
            '<a class="btn tiny ghost" href="'+cert.file+'" download="'+cert.title.replace(/\s+/g,"_")+'.jpg">ดาวน์โหลด</a>'+
          '</div>'+
        '</div>';
      card.querySelector('[data-view]').addEventListener('click', function(){ openLightbox(cert); });
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  function applyFilter(cat){
    if(cat==='all'){ render(data); return; }
    render(data.filter(function(d){ return d.category===cat; }));
  }

  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter(btn.getAttribute('data-filter'));
    }, {passive:true});
  });

  var lb = document.getElementById('certLightbox');
  var lbImg = document.getElementById('clbImg');
  var lbDl  = document.getElementById('clbDownload');
  function openLightbox(cert){
    lbImg.src = cert.file;
    lbImg.alt = cert.title;
    lbDl.href  = cert.file;
    lbDl.download = cert.title.replace(/\s+/g,'_') + '.jpg';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden','false');
  }
  function closeLightbox(){
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden','true');
    lbImg.src = '';
  }
  lb.addEventListener('click', function(e){ if(e.target.hasAttribute('data-close')) closeLightbox(); }, {passive:true});
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && lb.classList.contains('open')) closeLightbox(); });

  render(data);
  var tabBtn = document.getElementById('tab-certs');
  if(tabBtn){
    tabBtn.addEventListener('click', function(){
      var active = panel.querySelector('.cert-filters .chip.active');
      var cat = active ? active.getAttribute('data-filter') : 'all';
      applyFilter(cat);
    }, {passive:true});
  }
})();
