/* GestorPro — estabilidade da navegação V1 */
(function(){
  function logout(){
    try{
      if(window.GestorProSupabase?.signOut) return Promise.resolve(window.GestorProSupabase.signOut()).finally(()=>location.reload());
      if(window.GestorProSupabase?.client){ const c=window.GestorProSupabase.client(); if(c?.auth?.signOut) return c.auth.signOut().finally(()=>location.reload()); }
    }catch(e){ console.warn('GestorPro logout',e); }
    window.dispatchEvent(new CustomEvent('gestorpro:logout-request'));
  }
  function ensure(){
    const top=document.querySelector('.top .right');
    const side=document.querySelector('.side .nav');
    if(top && !document.getElementById('gpStableLogout')){
      const b=document.createElement('button'); b.id='gpStableLogout'; b.className='btn danger hideMobile'; b.type='button'; b.textContent='Sair'; b.onclick=logout; top.appendChild(b);
    }
    if(side && !document.getElementById('gpStableSideLogout')){
      const b=document.createElement('button'); b.id='gpStableSideLogout'; b.type='button'; b.innerHTML='↪ <span>Sair</span>'; b.onclick=logout; side.appendChild(b);
    }
    [top,side].filter(Boolean).forEach(el=>{el.style.removeProperty('display');el.style.removeProperty('visibility');el.classList.remove('hidden','d-none');});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ensure); else ensure();
  const obs=new MutationObserver(ensure); obs.observe(document.documentElement,{childList:true,subtree:true});
  [500,1200,2500,5000].forEach(t=>setTimeout(ensure,t));
})();
