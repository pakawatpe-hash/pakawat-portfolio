/* ===== Reveal on scroll ===== */
const revealEls = document.querySelectorAll('.reveal, .card, .contact-card');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
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

/* ===== Intro / Splash (auto close, no click) ===== */
(function(){
  const intro = document.getElementById('intro');
  if(!intro) return;

  // ล็อกสกอร์ลระหว่างโชว์ Intro
  document.body.classList.add('intro-lock');

  const closeIntro = ()=>{
    intro.classList.add('hide');
    setTimeout(()=>{
      intro.remove();
      document.body.classList.remove('intro-lock');
    }, 700);
  };

  // ปิดอัตโนมัติหลัง ~1.8 วินาที (ปรับได้)
  window.addEventListener('load', ()=> setTimeout(closeIntro, 1800));
})();
