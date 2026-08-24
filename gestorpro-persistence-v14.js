/* GestorPro — persistência real e imediata no Supabase V16 */
(function(){
 const KEY='resolve_palmeira_v6';
 let apiRef=null, booted=false, queue=Promise.resolve();
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 function local(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
 async function api(){
   if(apiRef)return apiRef;
   for(let i=0;i<80;i++){
     if(window.GestorProSupabase?.client){apiRef=window.GestorProSupabase;return apiRef}
     await wait(250);
   }
   return null;
 }
 async function persist(data){
   const a=await api(); if(!a)return false;
   try{
     const session=await a.session(); if(!session)return false;
     const c=await a.client(); if(!c)throw Error('Supabase client indisponível');
     const {error}=await c.rpc('gestorpro_save_data',{p_data:data||{}});
     if(error)throw error;
     return true;
   }catch(e){console.error('[GestorPro] Falha ao salvar:',e);return false}
 }
 async function loadRemote(){
   const a=await api(); if(!a)return null;
   try{
     if(!(await a.session()))return null;
     const c=await a.client();
     const {data,error}=await c.rpc('gestorpro_load_data');
     if(error)throw error;
     return data&&typeof data==='object'?data:null;
   }catch(e){console.error('[GestorPro] Falha ao carregar:',e);return null}
 }
 function install(){
   if(booted)return;
   booted=true;
   // O painel usa uma função global save(). Interceptamos o ponto único de gravação.
   const original=window.save;
   if(typeof original==='function'){
     window.save=function(data){
       original(data);
       const snapshot=local();
       queue=queue.then(()=>persist(snapshot)).catch(e=>console.error('[GestorPro] fila de persistência:',e));
     };
   }else{
     // Caso o HTML ainda não tenha criado save(), tenta novamente.
     booted=false; setTimeout(install,300); return;
   }
   // Também reforça explicitamente os dois fluxos críticos.
   ['saveServer','saveClient'].forEach(name=>{
     const fn=window[name];
     if(typeof fn==='function'){
       window[name]=function(){
         const result=fn.apply(this,arguments);
         const snapshot=local();
         queue=queue.then(()=>persist(snapshot)).catch(e=>console.error('[GestorPro] fila de persistência:',e));
         return result;
       };
     }
   });
 }
 async function hydrate(){
   install();
   const remote=await loadRemote();
   if(!remote)return;
   // Banco é a fonte oficial. Não sobrescrevemos o remoto com localStorage.
   localStorage.setItem(KEY,JSON.stringify(remote));
   if(window.D&&typeof window.D==='object'){
     window.D=remote;
     if(typeof window.renderAll==='function')window.renderAll();
   }
   install();
 }
 window.GestorProPersistence={load:hydrate,save:()=>persist(local()||{})};
 window.addEventListener('gestorpro:auth-ready',()=>hydrate());
 window.addEventListener('gestorpro:supabase-ready',()=>{install();hydrate()});
 setTimeout(()=>{install();hydrate()},500);
})();
