/* GestorPro V16 — persistência real por organização + hidratação do estado do painel */
(function(){
 const KEY='resolve_palmeira_v6';
 let syncing=false, patched=false;
 async function getOrg(){try{if(!window.GestorProSupabase)return null;const s=await window.GestorProSupabase.session();if(!s)return null;const o=await window.GestorProSupabase.organization();return o?.organization_id||null}catch(e){console.warn('GestorPro persistência:',e);return null}}
 async function client(){return window.GestorProSupabase?.client?.()}
 async function saveRemote(raw){if(syncing)return;try{const c=await client();if(!c)return;syncing=true;const {error}=await c.rpc('gestorpro_save_data',{p_data:JSON.parse(raw)});if(error)console.warn('GestorPro save:',error.message)}catch(e){console.warn('GestorPro save:',e.message)}finally{syncing=false}}
 async function loadRemote(){
  const org=await getOrg(); if(!org)return false;
  try{
   const c=await client(); const {data,error}=await c.rpc('gestorpro_load_data'); if(error)throw error;
   const remote=data&&typeof data==='object'?data:{};
   const merged=Object.assign({servers:[],clients:[],transactions:[],expenses:[],closures:[],settings:{renewConsumes:true,macFormat:true}},remote);
   syncing=true; localStorage.setItem(KEY,JSON.stringify(merged)); syncing=false;
   // Hidrata os estados globais usados pelos módulos antigos do painel.
   if(Array.isArray(merged.servers)) window.servers=merged.servers;
   if(Array.isArray(merged.clients)) window.clients=merged.clients;
   if(window.db&&typeof window.db==='object') Object.assign(window.db,merged);
   if(window.state&&typeof window.state==='object') Object.assign(window.state,merged);
   if(window.data&&typeof window.data==='object') Object.assign(window.data,merged);
   window.dispatchEvent(new CustomEvent('gestorpro:data-loaded',{detail:merged}));
   return true;
  }catch(e){console.warn('GestorPro load:',e.message);return false}
 }
 function disablePublicSignup(){const x=document.getElementById('gpShowSignup');if(x){x.style.display='none';const p=document.querySelector('#gpAuthLogin p');if(p)p.textContent='Acesso liberado somente pelo administrador.'}}
 async function boot(){
  disablePublicSignup();
  const signupTimer=setInterval(()=>{disablePublicSignup();if(document.getElementById('gpShowSignup')?.style.display==='none')clearInterval(signupTimer)},300);
  if(!patched){const originalSet=localStorage.setItem.bind(localStorage);localStorage.setItem=function(k,v){originalSet(k,v);if(k===KEY&&!syncing)saveRemote(v)};patched=true}
  await loadRemote();
 }
 window.GestorProPersistence={load:loadRemote,save:()=>{const v=localStorage.getItem(KEY);if(v)return saveRemote(v)}};
 window.addEventListener('gestorpro:auth-ready',()=>loadRemote());
 const timer=setInterval(()=>{if(window.GestorProSupabase){clearInterval(timer);boot()}},250);
})();
