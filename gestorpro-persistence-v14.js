/* GestorPro — Persistência DIRETA no Supabase
   V18: gravação explícita de clientes/servidores + hidratação única.
   Supabase é a fonte oficial; localStorage não participa dos dados do painel. */
(function(){
  let apiRef=null, installed=false, hydrated=false;
  let queue=Promise.resolve();
  const wait=ms=>new Promise(r=>setTimeout(r,ms));

  async function api(){
    if(apiRef)return apiRef;
    for(let i=0;i<120;i++){
      if(window.GestorProSupabase?.client){apiRef=window.GestorProSupabase;return apiRef}
      await wait(250);
    }
    throw new Error('Supabase não ficou disponível.');
  }

  async function persist(data){
    const a=await api();
    const session=await a.session();
    if(!session)throw new Error('Sessão do usuário não encontrada.');
    const c=await a.client();
    const payload=JSON.parse(JSON.stringify(data||{}));
    const {error}=await c.rpc('gestorpro_save_data',{p_data:payload});
    if(error)throw error;
    return true;
  }

  function enqueue(data, successToast=true){
    const snapshot=JSON.parse(JSON.stringify(data||window.D||{}));
    queue=queue.then(()=>persist(snapshot)).then(()=>{
      console.log('[GestorPro] Persistido no Supabase.', snapshot);
      if(successToast && typeof window.toast==='function')window.toast('Salvo no banco de dados');
    }).catch(e=>{
      console.error('[GestorPro] ERRO AO SALVAR NO SUPABASE:',e);
      if(typeof window.toast==='function')window.toast('Erro ao salvar no banco: '+(e.message||'verifique a conexão'));
    });
    return queue;
  }

  async function loadRemote(){
    const a=await api();
    const session=await a.session();
    if(!session)throw new Error('Sessão do usuário não encontrada.');
    const c=await a.client();
    const {data,error}=await c.rpc('gestorpro_load_data');
    if(error)throw error;
    return data&&typeof data==='object'?data:null;
  }

  function render(){try{if(typeof window.renderAll==='function')window.renderAll()}catch(e){console.error('[GestorPro] render:',e)}}

  function directSave(data){
    window.D=data||window.D||{};
    render();
    enqueue(window.D,true);
    return true;
  }

  function wrapExplicit(name){
    const fn=window[name];
    if(typeof fn!=='function' || fn.__gpWrapped)return;
    const wrapped=function(){
      const result=fn.apply(this,arguments);
      /* O formulário já alterou window.D. Capturamos o estado final,
         independentemente de como a função interna chama save(). */
      enqueue(window.D||{},true);
      return result;
    };
    wrapped.__gpWrapped=true;
    window[name]=wrapped;
  }

  function install(){
    if(typeof window.save==='function' && !window.save.__gpDirect){
      const direct=directSave;
      direct.__gpDirect=true;
      window.save=direct;
      installed=true;
    }
    wrapExplicit('saveServer');
    wrapExplicit('saveClient');
    wrapExplicit('saveCredits');
    wrapExplicit('saveExpense');
    wrapExplicit('renew');
    return installed;
  }

  async function hydrate(){
    if(hydrated)return true;
    hydrated=true;
    try{
      const remote=await loadRemote();
      install();
      if(remote){window.D=remote;render()}
      try{localStorage.removeItem('resolve_palmeira_v6')}catch(e){}
      console.log('[GestorPro] V18 carregado do Supabase.');
      return true;
    }catch(e){
      hydrated=false;
      console.error('[GestorPro] Falha ao carregar Supabase:',e);
      if(typeof window.toast==='function')window.toast('Erro ao carregar dados do banco');
      return false;
    }
  }

  window.GestorProPersistence={load:hydrate,save:()=>enqueue(window.D||{},false)};
  window.addEventListener('gestorpro:auth-ready',()=>hydrate());
  window.addEventListener('gestorpro:supabase-ready',()=>install());
  const boot=()=>{install();setTimeout(install,300);setTimeout(install,1000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
