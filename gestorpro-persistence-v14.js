/* GestorPro — persistência real e imediata no Supabase
   O localStorage continua como cache, mas o Supabase passa a ser a fonte persistente.
   Cada save() do painel dispara uma gravação direta no banco, sem depender apenas de polling.
*/
(function(){
 const KEY='resolve_palmeira_v6';
 let apiRef=null;
 let savePatched=false;
 let syncing=false;
 let pending=null;
 let lastSaved='';
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 function local(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
 function hasData(d){return !!d&&['servers','clients','transactions','expenses','closures'].some(k=>Array.isArray(d[k])&&d[k].length>0)}
 function mergeArray(remote, localData){
   const a=Array.isArray(remote)?remote:[], b=Array.isArray(localData)?localData:[];
   const out=a.slice(); const index=new Map(out.map(x=>[String(x?.id||''),x]));
   for(const item of b){
     if(!item) continue;
     const id=String(item.id||'');
     if(!id){out.push(item);continue}
     if(!index.has(id)){out.push(item);index.set(id,item)}
   }
   return out;
 }
 function mergeData(remote, localData){
   const r=remote&&typeof remote==='object'?remote:{};
   const l=localData&&typeof localData==='object'?localData:{};
   return {
     ...r,
     ...l,
     servers:mergeArray(r.servers,l.servers),
     clients:mergeArray(r.clients,l.clients),
     transactions:mergeArray(r.transactions,l.transactions),
     expenses:mergeArray(r.expenses,l.expenses),
     closures:mergeArray(r.closures,l.closures),
     settings:{...(r.settings||{}),...(l.settings||{})}
   };
 }
 async function api(){
   if(apiRef)return apiRef;
   for(let i=0;i<60;i++){
     if(window.GestorProSupabase?.client){apiRef=window.GestorProSupabase;return apiRef}
     await wait(250);
   }
   return null;
 }
 async function ready(a){
   for(let i=0;i<60;i++){
     try{if(await a.session())return true}catch(e){}
     await wait(250);
   }
   return false;
 }
 async function rpc(a,name,args){
   const c=await a.client();
   if(!c)throw Error('Supabase client indisponível');
   const r=await c.rpc(name,args||{});
   if(r.error)throw r.error;
   return r.data;
 }
 async function persist(data){
   const a=await api();
   if(!a)return false;
   try{
     if(!(await ready(a)))return false;
     const payload=data&&typeof data==='object'?data:{};
     await rpc(a,'gestorpro_save_data',{p_data:payload});
     lastSaved=JSON.stringify(payload);
     return true;
   }catch(e){
     console.warn('[GestorPro] erro ao salvar no Supabase:',e.message||e);
     return false;
   }
 }
 function patchSave(){
   if(savePatched||typeof window.save!=='function')return;
   const originalSave=window.save;
   window.save=function(x){
     originalSave(x);
     const current=local();
     const serialized=JSON.stringify(current||{});
     pending=current||{};
     if(serialized===lastSaved)return;
     if(!syncing){
       syncing=true;
       const data=pending;
       pending=null;
       persist(data).finally(()=>{
         syncing=false;
         if(pending){const next=pending;pending=null;persist(next)}
       });
     }
   };
   savePatched=true;
 }
 async function hydrate(){
   const a=await api();
   if(!a||!(await ready(a)))return;
   patchSave();
   try{
     const remote=await rpc(a,'gestorpro_load_data');
     const r=remote&&typeof remote==='object'?remote:{};
     const l=local();

     // Se houver dados locais que ainda não chegaram ao banco, preserva-os.
     // Isso evita perder clientes/servidores quando o banco já contém apenas parte do painel.
     let finalData;
     if(hasData(r)&&hasData(l)) finalData=mergeData(r,l);
     else if(hasData(r)) finalData=r;
     else finalData=l||{};

     const serialized=JSON.stringify(finalData);
     localStorage.setItem(KEY,serialized);
     lastSaved=serialized;

     // Se houve dados locais adicionais, consolida tudo no Supabase agora.
     if(serialized!==JSON.stringify(r||{})){
       await persist(finalData);
     }

     // Atualiza a memória do painel sem recarregar a página.
     if(window.D&&typeof window.D==='object'){
       window.D=finalData;
       if(typeof window.renderAll==='function')window.renderAll();
     }
   }catch(e){console.error('[GestorPro] erro ao sincronizar dados:',e)}
   patchSave();
 }
 window.GestorProPersistence={load:hydrate,save:()=>persist(local()||{})};
 window.addEventListener('gestorpro:auth-ready',hydrate);
 window.addEventListener('gestorpro:supabase-ready',()=>{patchSave();hydrate()});
 hydrate();
})();
