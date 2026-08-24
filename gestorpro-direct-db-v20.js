/* GestorPro V20 — gravação direta das ações principais no Supabase.
   Este módulo não depende do localStorage nem da função save() antiga. */
(function(){
  let installed=false;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function persist(){
    const api=window.GestorProSupabase;
    if(!api?.client) throw new Error('Módulo Supabase não disponível.');
    const session=await api.session();
    if(!session) throw new Error('Sessão não encontrada.');
    const c=await api.client();
    const data=window.D;
    if(!data || !Array.isArray(data.servers) || !Array.isArray(data.clients)) throw new Error('Dados do painel não estão prontos.');
    const r=await c.rpc('gestorpro_save_data',{p_data:JSON.parse(JSON.stringify(data))});
    if(r.error) throw r.error;
    return true;
  }
  function toast(msg){if(typeof window.toast==='function')window.toast(msg);}
  function install(){
    if(installed)return true;
    if(typeof window.saveServer!=='function' || typeof window.saveClient!=='function' || !window.GestorProSupabase?.client)return false;
    const originalServer=window.saveServer;
    window.saveServer=async function(e){
      e?.preventDefault?.();
      try{
        /* Executa a lógica original sem deixar a mensagem antiga ser a confirmação. */
        originalServer.call(this,e);
        await persist();
        toast('Servidor salvo no banco de dados');
      }catch(err){
        console.error('[GestorPro V20] servidor:',err);
        toast('Erro ao salvar servidor: '+(err.message||err));
      }
    };
    const originalClient=window.saveClient;
    window.saveClient=async function(e){
      e?.preventDefault?.();
      try{
        originalClient.call(this,e);
        await persist();
        toast('Cliente salvo no banco de dados');
      }catch(err){
        console.error('[GestorPro V20] cliente:',err);
        toast('Erro ao salvar cliente: '+(err.message||err));
      }
    };
    installed=true;
    console.log('[GestorPro V20] gravação direta instalada');
    return true;
  }
  const boot=()=>{install();let n=0,t=setInterval(()=>{if(install()||++n>60)clearInterval(t)},250)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
