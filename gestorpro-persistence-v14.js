/* GestorPro — Persistência DIRETA no Supabase
   V19: sincroniza o estado REAL usado pela interface (db/state/data/D).
   Supabase é a única fonte oficial; localStorage não participa dos dados. */
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

  /* O código original do painel e os módulos complementares usam nomes
     diferentes para o estado. O servidor, em particular, pode estar em
     window.db/state/data enquanto a camada anterior salvava window.D.
     Sempre capturamos o objeto que contém os dados reais da tela. */
  function currentState(){
    const candidates=[window.db,window.state,window.data,window.D];
    const found=candidates.find(x=>x&&typeof x==='object'&&(Array.isArray(x.servers)||Array.isArray(x.clients)||Array.isArray(x.servidores)||Array.isArray(x.clientes)));
    if(found)return found;
    return window.D&&typeof window.D==='object'?window.D:{};
  }

  function setState(remote){
    const value=remote&&typeof remote==='object'?remote:{};
    window.D=value;
    /* Mantém os aliases que o código existente usa apontando para o mesmo
       objeto remoto, evitando que uma cópia local antiga seja renderizada. */
    window.db=value;
    window.state=value;
    window.data=value;
    window.servers=value.servers||value.servidores||[];
    window.clients=value.clients||value.clientes||[];
    return value;
  }

  async function persist(data){
    const a=await api();
    const session=await a.session();
    if(!session)throw new Error('Sessão do usuário não encontrada.');
    const c=await a.client();
    const payload=JSON.parse(JSON.stringify(data||{}));
    const {data:result,error}=await c.rpc('gestorpro_save_data',{p_data:payload});
    if(error)throw error;
    return result;
  }

  function enqueue(data, successToast=true){
    const snapshot=JSON.parse(JSON.stringify(data||{}));
    queue=queue.then(()=>persist(snapshot)).then(()=>{
      console.log('[GestorPro] Persistido no Supabase.',snapshot);
      if(successToast&&typeof window.toast==='function')window.toast('Salvo no banco de dados');
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

  function directSave(){
    const source=currentState();
    setState(source);
    render();
    enqueue(source,true);
    return true;
  }

  function wrapExplicit(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__gpWrapped)return;
    const wrapped=function(){
      const result=fn.apply(this,arguments);
      const after=()=>{
        const source=currentState();
        setState(source);
        enqueue(source,true);
      };
      if(result&&typeof result.then==='function')result.then(after).catch(()=>after());
      else after();
      return result;
    };
    wrapped.__gpWrapped=true;
    window[name]=wrapped;
  }

  function install(){
    if(typeof window.save==='function'&&!window.save.__gpDirect){
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
      if(remote){setState(remote);render()}
      try{localStorage.removeItem('resolve_palmeira_v6')}catch(e){}
      console.log('[GestorPro] V19 carregado do Supabase.');
      return true;
    }catch(e){
      hydrated=false;
      console.error('[GestorPro] Falha ao carregar Supabase:',e);
      if(typeof window.toast==='function')window.toast('Erro ao carregar dados do banco');
      return false;
    }
  }

  window.GestorProPersistence={load:hydrate,save:()=>enqueue(currentState(),false)};
  window.addEventListener('gestorpro:auth-ready',()=>hydrate());
  window.addEventListener('gestorpro:supabase-ready',()=>install());
  const boot=()=>{install();setTimeout(install,300);setTimeout(install,1000);setTimeout(install,2000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
