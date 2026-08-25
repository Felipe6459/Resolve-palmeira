/* GestorPro — Persistência V22
   Supabase é a fonte oficial. Clientes e servidores são persistidos diretamente. */
(function(){
  let apiRef=null, hydrated=false, installing=false;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function api(){if(apiRef)return apiRef;for(let i=0;i<120;i++){if(window.GestorProSupabase?.client){apiRef=window.GestorProSupabase;return apiRef}await sleep(250)}throw new Error('Supabase não ficou disponível.')}
  function realD(){try{if(typeof D!=='undefined'&&D&&typeof D==='object')return D}catch(e){}return window.D}
  function assignD(v){try{if(typeof D!=='undefined')D=v}catch(e){}window.D=v;return v}
  async function persist(){const a=await api(),session=await a.session();if(!session)throw new Error('Sessão do usuário não encontrada.');const c=await a.client(),d=realD();if(!d||!Array.isArray(d.servers)||!Array.isArray(d.clients))throw new Error('Estado do GestorPro ainda não está pronto.');const r=await c.rpc('gestorpro_save_data',{p_data:JSON.parse(JSON.stringify(d))});if(r.error)throw r.error;return true}
  async function loadRemote(){const a=await api(),session=await a.session();if(!session)throw new Error('Sessão do usuário não encontrada.');const c=await a.client(),r=await c.rpc('gestorpro_load_data');if(r.error)throw r.error;return r.data&&typeof r.data==='object'?r.data:null}
  function toast(m){if(typeof window.toast==='function')window.toast(m);else console.log(m)}
  function render(){try{window.renderAll?.()}catch(e){console.error('[GestorPro] render',e)}}
  async function editServer(id){const d=realD();const list=d?.servers||[];const s=list.find(x=>String(x.id??x.serverId??x.name??x.nome)===String(id));if(!s){toast('Servidor não encontrado');return false}const name=prompt('Nome do servidor:',s.name??s.nome??'');if(name===null)return false;const price=prompt('Preço por crédito:',String(s.creditPrice??s.precoCredito??s.custoCredito??0));if(price===null)return false;const credits=prompt('Créditos disponíveis:',String(s.credits??s.creditos??s.balance??0));if(credits===null)return false;s.name=name.trim();s.creditPrice=Number(price)||0;s.credits=Number(credits)||0;await persist();render();toast('Servidor atualizado no banco de dados');return true}
  async function deleteServer(id){const d=realD();const list=d?.servers||[];const idx=list.findIndex(x=>String(x.id??x.serverId??x.name??x.nome)===String(id));if(idx<0){toast('Servidor não encontrado');return false}const s=list[idx];const name=s.name??s.nome??'Servidor';if(!confirm('Excluir o servidor “'+name+'”? Esta ação não pode ser desfeita.'))return false;list.splice(idx,1);await persist();render();toast('Servidor excluído do banco de dados');return true}
  function install(){
    if(installing)return false;
    if(typeof window.saveServer!=='function'||typeof window.saveClient!=='function'||!window.GestorProSupabase?.client)return false;
    installing=true;
    const originalServer=window.saveServer,originalClient=window.saveClient;
    window.saveServer=async function(e){e?.preventDefault?.();try{originalServer.call(this,e);await persist();toast('Servidor salvo no banco de dados');return true}catch(err){console.error('[GestorPro] saveServer',err);toast('Erro ao salvar servidor: '+(err.message||err));return false}};
    window.saveClient=async function(e){e?.preventDefault?.();try{originalClient.call(this,e);await persist();toast('Cliente salvo no banco de dados');return true}catch(err){console.error('[GestorPro] saveClient',err);toast('Erro ao salvar cliente: '+(err.message||err));return false}};
    window.save=async function(){render();try{await persist();return true}catch(err){console.error('[GestorPro] save',err);toast('Erro ao salvar no banco: '+(err.message||err));return false}};
    window.gpEditServer=editServer;
    window.gpDeleteServer=deleteServer;
    console.log('[GestorPro] V22 persistência direta instalada');return true;
  }
  async function hydrate(){if(hydrated)return true;try{
    const remote=await loadRemote();
    const current=realD()||{};
    const incoming=remote&&typeof remote==='object'?remote:{};
    const merged={...current,...incoming};
    if(!Array.isArray(incoming.clients))merged.clients=Array.isArray(current.clients)?current.clients:[];
    if(!Array.isArray(incoming.servers))merged.servers=Array.isArray(current.servers)?current.servers:[];
    assignD(merged);
    hydrated=true;install();render();try{localStorage.removeItem('resolve_palmeira_v6')}catch(e){}console.log('[GestorPro] dados carregados do Supabase');return true
  }catch(e){console.error('[GestorPro] falha ao carregar Supabase',e);toast('Erro ao carregar dados do banco');return false}}
  window.GestorProPersistence={load:hydrate,save:persist,editServer,deleteServer};
  window.addEventListener('gestorpro:auth-ready',hydrate);
  window.addEventListener('gestorpro:supabase-ready',install);
  const boot=()=>{install();let n=0,t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},250)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
