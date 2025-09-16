// IntersectionObserver for reveal-on-scroll
const revealEls = document.querySelectorAll('.reveal, .card, .contact-card');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
},{threshold: 0.15});
revealEls.forEach(el=>io.observe(el));

// Subtle tilt on hover
document.querySelectorAll('.tilt').forEach(el=>{
  el.addEventListener('mousemove', (e)=>{
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `rotateX(${(-y*8).toFixed(2)}deg) rotateY(${(x*10).toFixed(2)}deg)`;
  });
  el.addEventListener('mouseleave', ()=>{
    el.style.transform = 'rotateX(0) rotateY(0)';
  });
});

// Small parallax for background blobs
document.addEventListener('mousemove', (e)=>{
  const x = (e.clientX / window.innerWidth - .5) * 8;
  const y = (e.clientY / window.innerHeight - .5) * 8;
  document.querySelectorAll('.bg-blob').forEach((b,i)=>{
    b.style.transform = `translate(${x*(i+1)}px, ${y*(i+1)}px)`;
  });
});
