/* GestorPro — Cliente V3
   Camada complementar: ficha detalhada, ações rápidas, filtros e histórico.
   Não substitui a lógica financeira existente. */
(function(){
  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\\':'&#39;'}[m]));
  function findClient(id){
    const db=window.db||window.state||window.data||{};
    const arr=db.clients||window.clients||[];
    return arr.find(x=>String(x.id)===String(id));
  }
  window.gpClientDetails=function(id){
    const c=findClient(id); if(!c){window.toast?.('Cliente não encontrado');return;}
    let modal=document.getElementById('gpClientV3');
    if(!modal){ modal=document.createElement('div'); modal.id='gpClientV3'; modal.className='modal'; document.body.appendChild(modal); }
    const cost=Number(c.creditCost||c.custoCredito||c.cost||0), value=Number(c.value||c.valor||c.assinatura||0);
    const profit=value-cost;
    modal.innerHTML='<div class="box gp-v3-box"><div class="modalhead"><h2>'+esc(c.name||c.nome||'Cliente')+'</h2><button class="btn" onclick="this.closest(\'.modal\').classList.remove(\'open\')">✕</button></div>'+
      '<div class="profile"><div class="kv"><small>WhatsApp</small><b>'+esc(c.whatsapp||c.phone||'-')+'</b></div><div class="kv"><small>Status</small><b>'+esc(c.status||'-')+'</b></div><div class="kv"><small>Plano</small><b>'+esc(c.plan||c.plano||'-')+'</b></div><div class="kv"><small>Valor</small><b>'+money(value)+'</b></div><div class="kv"><small>Servidor</small><b>'+esc(c.serverName||c.servidor||'-')+'</b></div><div class="kv"><small>Custo do crédito</small><b>'+money(cost)+'</b></div><div class="kv"><small>Lucro estimado</small><b class="green">'+money(profit)+'</b></div><div class="kv"><small>Vencimento</small><b>'+esc(c.due||c.vencimento||'-')+'</b></div></div>'+
      '<div class="foot"><button class="btn" onclick="document.getElementById(\'gpClientV3\').classList.remove(\'open\');clientModal&&clientModal('+JSON.stringify(c.id)+')">✏️ Editar</button><button class="btn primary" onclick="document.getElementById(\'gpClientV3\').classList.remove(\'open\');renewClient&&renewClient('+JSON.stringify(c.id)+')">🔄 Renovar</button><button class="btn soft" onclick="document.getElementById(\'gpClientV3\').classList.remove(\'open\');migrateClient&&migrateClient('+JSON.stringify(c.id)+')">🖥️ Migrar</button></div></div>';
    modal.classList.add('open');
  };
  const style=document.createElement('style'); style.textContent='.gp-v3-box{width:min(760px,100%)}.gp-v3-box .kv{min-height:58px}.gp-v3-box .foot{flex-wrap:wrap}.gp-v3-actions{display:flex;gap:5px;flex-wrap:wrap}.gp-v3-actions .btn{padding:6px 8px;font-size:12px}'; document.head.appendChild(style);
})();
