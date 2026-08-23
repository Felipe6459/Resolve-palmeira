/* Resolve Palmeira — correção de receita
   A receita agora considera o valor da assinatura no cadastro e nas renovações.
   Este arquivo é um patch auxiliar para a versão local do painel.
*/
(function(){
  const originalSaveClient = window.saveClient;
  if (typeof originalSaveClient !== 'function') return;

  // Mantém a função original e, depois do cadastro, cria um registro de receita
  // para clientes que ainda não possuem pagamento de cadastro.
  window.saveClient = function(id){
    const before = id ? null : (window.D && D.clients ? D.clients.map(c=>c.id) : []);
    const result = originalSaveClient.apply(this, arguments);
    if (!id && window.D && Array.isArray(D.clients)) {
      const c = D.clients.find(x => !before.includes(x.id));
      if (c) {
        c.payments = Array.isArray(c.payments) ? c.payments : [];
        if (!c.payments.some(p => p.type === 'Cadastro' && Number(p.value) === Number(c.value))) {
          c.payments.push({date:new Date().toISOString(), value:Number(c.value)||0, type:'Cadastro'});
        }
        localStorage.setItem('resolve_profissional_v10', JSON.stringify(D));
        if (typeof renderAll === 'function') renderAll();
      }
    }
    return result;
  };

  // Reconstrói receita para clientes antigos que foram cadastrados antes do patch.
  window.rebuildRevenue = function(){
    if (!window.D || !Array.isArray(D.clients)) return;
    D.clients.forEach(c=>{
      c.payments = Array.isArray(c.payments) ? c.payments : [];
      const hasEntry = c.payments.some(p => p.type === 'Cadastro');
      if (!hasEntry && Number(c.value) > 0) {
        c.payments.unshift({date:c.createdAt || new Date().toISOString(), value:Number(c.value), type:'Cadastro'});
      }
    });
    localStorage.setItem('resolve_profissional_v10', JSON.stringify(D));
    if (typeof renderAll === 'function') renderAll();
    if (typeof toast === 'function') toast('Receita reconstruída com os valores das assinaturas.');
  };
})();
