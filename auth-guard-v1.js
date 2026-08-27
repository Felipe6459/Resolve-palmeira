/* GestorPro — guard de sessão e logout */
(function(){
 let busy=false;
 async function logout(){
  if(busy)return; busy=true;
  try{const c=await window.GestorProSupabase.client(); await c.auth.signOut({scope:'local'});}catch(e){console.error('Logout:',e)}
  try{sessionStorage.clear()}catch(e){}
  window.location.replace(window.location.pathname+'?logout=1&t='+Date.now());
 }
 window.GestorProLogout=logout;
 document.addEventListener('click',function(e){const b=e.target.closest('#gpPermBtn,[data-gp-logout],#gpLogoutBtn');if(b&&b.matches('[data-gp-logout],#gpLogoutBtn')){e.preventDefault();e.stopPropagation();logout()}},true);
 async function guard(){
  try{const c=await window.GestorProSupabase.client();
   const r=await c.auth.getSession();
   if(!r.data.session && !location.search.includes('logout=1')) location.replace(location.pathname+'?logout=1');
   c.auth.onAuthStateChange(function(event,session){if(event==='SIGNED_OUT'||!session)location.replace(location.pathname+'?logout=1&t='+Date.now())});
  }catch(e){console.warn('Auth guard:',e)}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',guard);else guard();
})();
