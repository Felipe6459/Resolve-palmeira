/* GestorPro — Persistência DIRETA no Supabase
   V17: Supabase é a fonte única dos dados do painel.
   Clientes, servidores, transações, despesas e configurações não usam localStorage. */
(function(){
  let apiRef=null;
  let installed=false;
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

  async function loadRemote(){
    const a=await api();
    const session=await a.session();
    if(!session)throw new Error('Sessão do usuário não encontrada.');
    const c=await a.client();
    const {data,error}=await c.rpc('gestorpro_load_data');
    if(error)throw error;
    return data&&typeof data==='object'?data:null;
  }

  function render(){
    try{ if(typeof window.renderAll==='function')window.renderAll(); }
    catch(e){console.error('[GestorPro] erro ao renderizar:',e)}
  }

  function directSave(data){
    window.D=data||window.D||{};
    render();
    const snapshot=JSON.parse(JSON.stringify(window.D||{}));
    queue=queue.then(()=>persist(snapshot)).then(()=>{
      console.log('[GestorPro] Dados salvos diretamente no Supabase.');
      if(typeof window.toast==='function')window.toast('Salvo no banco de dados');
    }).catch(e=>{
      console.error('[GestorPro] ERRO REAL AO SALVAR NO SUPABASE:',e);
      if(typeof window.toast==='function')window.toast('Erro ao salvar no banco: '+(e.message||'verifique a conexão'));
    });
    return true;
  }

  function install(){
    if(installed)return;
    if(typeof window.save!=='function')return false;
    /* Substitui completamente a função antiga.
       Não chamamos a implementação anterior, portanto ela não grava no localStorage. */
    window.save=directSave;
    installed=true;
    console.log('[GestorPro] Persistência V17 instalada: localStorage fora do fluxo de dados.');
    return true;
  }

  async function hydrate(){
    try{
      const remote=await loadRemote();
      install();
      if(remote){
        window.D=remote;
        render();
      }
      /* Remove qualquer cache antigo para impedir que dados antigos reapareçam. */
      try{localStorage.removeItem('resolve_palmeira_v6')}catch(e){}
      return true;
    }catch(e){
      console.error('[GestorPro] Falha ao carregar dados do Supabase:',e);
      if(typeof window.toast==='function')window.toast('Erro ao carregar dados do banco');
      return false;
    }
  }

  window.GestorProPersistence={
    load:hydrate,
    save:()=>persist(window.D||{})
  };

  const boot=()=>{install();};
  window.addEventListener('gestorpro:auth-ready',()=>{hydrate();});
  window.addEventListener('gestorpro:supabase-ready',()=>{install();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setTimeout(boot,500);
})();
