/* GestorPro V17 — persistência robusta + hidratação após inicialização do painel */
(function(){
 const KEY='resolve_palmeira_v6';
 let syncing=false, lastSnapshot='', lastRemote='';
 const defaults={servers:[],clients:[],transactions:[],expenses:[],closures:[],settings:{renewConsumes:true,macFormat:true}};
 const clone=o=>JSON.parse(JSON.stringify(o||{}));
 async function client(){try{return await window.GestorProSupabase?.client?.()}catch(e){return null}}
 async function orgId(){try{const s=await window.GestorProSupabase?.session?.();if(!s)return null;const o=await window.GestorProSupabase?.organization?.();return o?.organization_id||null}catch(e){return null}}
 function getState(){
   const candidates=[window.db,window.state,window.data];
   for(const x of candidates){
     if(x&&typeof x==='object'&&(Array.isArray(x.clients)||Array.isArray(x.servers))) return x;
   }
   return null;
 }
 function mergeIntoState(data){
   const merged=Object.assign({},defaults,clone(data));
   const targets=[window.db,window.state,window.data].filter(x=>x&&typeof x==='object');
   if(!targets.length){window.db=clone(merged);targets.push(window.db)}
   targets.forEach(t=>{
     if(Array.isArray(merged.clients))t.clients=clone(merged.clients);
     if(Array.isArray(merged.servers))t.servers=clone(merged.servers);
     ['transactions','expenses','closures','settings'].forEach(k=>{if(merged[k]!==undefined)t[k]=clone(merged[k])});
   });
   window.clients=clone(merged.clients||[]);window.servers=clone(merged.servers||[]);
   try{localStorage.setItem(KEY,JSON.stringify(merged))}catch(e){}
   window.dispatchEvent(new CustomEvent('gestorpro:data-loaded',{detail:merged}));
   return merged;
 }
 async function loadRemote(){
   const oid=await orgId();if(!oid)return false;
   try{
     const c=await client();if(!c)return false;
     const {data,error}=await c.rpc('gestorpro_load_data');if(error)throw error;
     const remote=Object.assign({},defaults,data&&typeof data==='object'?data:{});
     lastRemote=JSON.stringify(remote);
     syncing=true;mergeIntoState(remote);syncing=false;
     return true;
   }catch(e){console.warn('GestorPro load:',e.message);return false}
 }
 async function saveCurrent(){
   if(syncing)return;
   const s=getState();if(!s)return;
   const payload=Object.assign({},defaults,{clients:clone(s.clients||window.clients||[]),servers:clone(s.servers||window.servers||[]),transactions:clone(s.transactions||[]),expenses:clone(s.expenses||[]),closures:clone(s.closures||[]),settings:clone(s.settings||defaults.settings)});
   const snap=JSON.stringify(payload);if(snap===lastSnapshot)return;lastSnapshot=snap;
   try{const c=await client();if(!c)return;const {error}=await c.rpc('gestorpro_save_data',{p_data:payload});if(error)throw error;lastRemote=snap}catch(e){console.warn('GestorPro save:',e.message)}
 }
 function disablePublicSignup(){const x=document.getElementById('gpShowSignup');if(x){x.style.display='none';const p=document.querySelector('#gpAuthLogin p');if(p)p.textContent='Acesso liberado somente pelo administrador.'}}
 async function boot(){
   disablePublicSignup();
   const t=setInterval(disablePublicSignup,500);setTimeout(()=>clearInterval(t),15000);
   // O painel cria window.db/state/data depois dos módulos. Aguarde e hidrate novamente.
   let tries=0;
   const hydrateTimer=setInterval(async()=>{
     tries++;
     const oid=await orgId();
     if(oid){await loadRemote();}
     if(tries>=20)clearInterval(hydrateTimer);
   },500);
   // Detecta alterações feitas pelos módulos antigos, mesmo que eles usem outro mecanismo de armazenamento.
   const saveTimer=setInterval(saveCurrent,1200);
   setTimeout(()=>clearInterval(saveTimer),60*60*1000);
   window.addEventListener('beforeunload',()=>{saveCurrent()});
 }
 window.GestorProPersistence={load:loadRemote,save:saveCurrent};
 window.addEventListener('gestorpro:auth-ready',loadRemote);
 const timer=setInterval(()=>{if(window.GestorProSupabase){clearInterval(timer);boot()}},250);
})();
