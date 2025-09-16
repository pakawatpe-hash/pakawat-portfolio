// Simple tab switcher like profile tabs
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const show = btn.dataset.tab;
    ['grid','about','contact'].forEach(id=>{
      document.getElementById(id).classList.toggle('hidden', id!==show);
    });
    // scroll to top of section on mobile
    document.getElementById(show).scrollIntoView({behavior:'smooth', block:'start'});
  });
});
