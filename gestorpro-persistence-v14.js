/* GestorPro V18 — persistência real do painel legado */
(function(){
 const KEY='resolve_palmeira_v6';
 let lastLocal='';
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 function local(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
 function hasData(d){return !!d&&((d.servers||[]).length+(d.clients||[]).length+(d.transactions||[]).length+(d.expenses||[]).length+(d.closures||[]).length)>0}
 async function api(){for(let i=0;i<60;i++){if(window.GestorProSupabase?.client)return window.GestorProSupabase;await wait(250)}return null}
 async function ready(a){for(let i=0;i<60;i++){try{if(await a.session())return true}catch(e){}await wait(250)}return false}
 async function rpc(a,name,args){const c=await a.client();if(!c)throw Error('Supabase client indisponível');const r=await c.rpc(name,args);if(r.error)throw r.error;return r.data}
 async function hydrate(){
   const a=await api();if(!a||!(await ready(a)))return;
   try{
     const remote=await rpc(a,'gestorpro_load_data');
     const r=remote&&typeof remote==='object'?remote:{};
     const l=local();
     if(hasData(r)){
       const rs=JSON.stringify(r),ls=JSON.stringify(l||{});
       if(rs!==ls){localStorage.setItem(KEY,rs);lastLocal=rs;location.reload();return;}
       lastLocal=ls;
     }else if(hasData(l)){
       const ls=JSON.stringify(l);await rpc(a,'gestorpro_save_data',{p_data:l});lastLocal=ls;
     }else lastLocal=JSON.stringify(l||{});
   }catch(e){console.error('[GestorPro] erro ao sincronizar dados:',e)}
   setInterval(async()=>{
     try{
       const l=local();const s=JSON.stringify(l||{});
       if(s===lastLocal)return;
       await rpc(a,'gestorpro_save_data',{p_data:l||{}});lastLocal=s;
     }catch(e){console.warn('[GestorPro] autosave:',e.message)}
   },1000);
 }
 window.GestorProPersistence={load:hydrate,save:hydrate};
 window.addEventListener('gestorpro:auth-ready',hydrate);
 hydrate();
})();
