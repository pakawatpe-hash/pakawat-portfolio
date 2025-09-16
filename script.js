// simple theme toggle with local storage
(function(){
  const btn = document.getElementById('themeToggle');
  const key = 'theme-pref';
  const set = (mode)=>{
    if(mode==='light'){document.body.classList.add('light')}
    else{document.body.classList.remove('light')}
    localStorage.setItem(key, mode);
  };
  const init = localStorage.getItem(key);
  if(init){ set(init); }
  btn?.addEventListener('click', ()=>{
    const next = document.body.classList.contains('light') ? 'dark' : 'light';
    set(next==='light'?'light':'dark');
  });
})();
