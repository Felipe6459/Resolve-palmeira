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
  function getClients(){const d=window.D||window.db||{};return Array.isArray(d.clients)?d.clients:(window.clients||[])}
  window.gpClientDetails=function(id){
    const c=findClient(id); if(!c){window.toast?.('Cliente não encontrado');return;}
    let modal=document.getElementById('gpClientV3');
    if(!modal){ modal=document.createElement('div'); modal.id='gpClientV3'; modal.className='modal'; document.body.appendChild(modal); }
    const cost=Number(c.creditCost||c.custoCredito||c.cost||0), value=Number(c.value||c.valor||c.assinatura||0);
    const profit=value-cost;
    modal.innerHTML='<div class="box gp-v3-box"><div class="modalhead"><h2>'+esc(c.name||c.nome||'Cliente')+'</h2><button class="btn" onclick="this.closest(\'.modal\').classList.remove(\'open\')">✕</button></div>'+
      '<div class="profile"><div class="kv"><small>WhatsApp</small><b>'+esc(c.whatsapp||c.phone||'-')+'</b></div><div class="kv"><small>Status</small><b>'+esc(c.status||'-')+'</b></div><div class="kv"><small>Plano</small><b>'+esc(c.plan||c.plano||'-')+'</b></div><div class="kv"><small>Valor</small><b>'+money(value)+'</b></div><div class="kv"><small>Servidor</small><b>'+esc(c.serverName||c.servidor||'-')+'</b></div><div class="kv"><small>Custo do crédito</small><b>'+money(cost)+'</b></div><div class="kv"><small>Lucro estimado</small><b class="green">'+money(profit)+'</b></div><div class="kv"><small>Vencimento</small><b>'+esc(c.due||c.vencimento||'-')+'</b></div></div>'+
      '<div class="foot"><button class="btn" onclick="document.getElementById(\'gpClientV3\').classList.remove(\'open\');window.gpOpenClientEdit&&gpOpenClientEdit('+JSON.stringify(c.id)+')">✏️ Editar</button><button class="btn primary" onclick="document.getElementById(\'gpClientV3\').classList.remove(\'open\');renewClient&&renewClient('+JSON.stringify(c.id)+')">🔄 Renovar</button><button class="btn soft" onclick="document.getElementById(\'gpClientV3\').classList.remove(\'open\');migrateClient&&migrateClient('+JSON.stringify(c.id)+')">🖥️ Migrar</button></div></div>';
    modal.classList.add('open');
  };
  function openClientModal(){return document.querySelector('.modal.open:not(#gpClientV3)')||document.querySelector('.modal:not(#gpClientV3)')}
  function injectPaymentFields(){
    const modal=openClientModal(); if(!modal)return;
    const box=modal.querySelector('.box'); if(!box)return;
    if(box.querySelector('#gpPaymentLink'))return;
    const form=box.querySelector('form');
    const fields=document.createElement('div'); fields.className='gp-payment-fields';
    fields.innerHTML='<div class="field full"><label>🔗 Link de pagamento do cliente</label><input id="gpPaymentLink" type="url" placeholder="https://seu-servidor.com/#/checkout/..." autocomplete="off"><small class="muted">Cole aqui o link específico da conta desse cliente.</small></div><div class="field full"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input id="gpIncludePaymentLink" type="checkbox" style="width:auto"> Incluir este link nas mensagens automáticas do cliente</label></div>';
    const target=form||box; const anchor=target.querySelector('.foot')||target.lastElementChild;
    if(anchor)target.insertBefore(fields,anchor);else target.appendChild(fields);
    const c=window.__gpEditingClient;
    if(c){document.getElementById('gpPaymentLink').value=c.payment_link||c.paymentLink||'';document.getElementById('gpIncludePaymentLink').checked=!!(c.include_payment_link_in_messages??c.includePaymentLinkInMessages)}
  }
  function findClientIdFromElement(el){
    let n=el;
    for(let i=0;i<5&&n;i++,n=n.parentElement){
      const direct=n.dataset?.clientId||n.dataset?.id||n.getAttribute?.('data-client-id'); if(direct)return direct;
      const m=(n.getAttribute?.('onclick')||'').match(/(?:editClient|clientModal|gpClientDetails)\s*\(\s*['"]?([^,'")]+)['"]?/); if(m)return m[1];
    }
    return null;
  }
  function openRealEdit(id){
    const c=findClient(id); if(!c){window.toast?.('Cliente não encontrado');return false;}
    window.__gpEditingClient=c;
    if(typeof window.clientModal==='function'){
      try{window.clientModal(c.id);setTimeout(injectPaymentFields,50);setTimeout(injectPaymentFields,200);return true}catch(e){console.error('[GestorPro] clientModal edit',e)}
    }
    window.toast?.('A tela de edição do cliente não está disponível.');return false;
  }
  function patchClientModal(){
    if(typeof window.clientModal!=='function'||window.__gpClientPaymentPatched)return false;
    const originalModal=window.clientModal;
    window.clientModal=function(id){window.__gpEditingClient=id?findClient(id):null;const r=originalModal.apply(this,arguments);setTimeout(injectPaymentFields,0);setTimeout(injectPaymentFields,120);return r};
    window.gpOpenClientEdit=openRealEdit;
    window.editClient=openRealEdit;
    if(typeof window.saveClient==='function'){
      const originalSave=window.saveClient;
      window.saveClient=async function(e){
        const before=getClients().map(x=>String(x.id));
        const link=document.getElementById('gpPaymentLink')?.value?.trim()||'';
        const include=!!document.getElementById('gpIncludePaymentLink')?.checked;
        const result=await originalSave.apply(this,arguments);
        const list=getClients();
        let c=window.__gpEditingClient&&findClient(window.__gpEditingClient.id);
        if(!c)c=list.find(x=>!before.includes(String(x.id)))||list[list.length-1];
        if(c){c.payment_link=link;c.include_payment_link_in_messages=include;if(window.GestorProPersistence?.save)try{await window.GestorProPersistence.save()}catch(err){console.error('[GestorPro] payment link persist',err)}}
        return result;
      };
    }
    window.__gpClientPaymentPatched=true;return true;
  }
  // Fallback: some older client rows call an edit action that no longer exists.
  // Capture the click and route it to the real client editor using the row/button id.
  document.addEventListener('click',function(ev){
    const btn=ev.target.closest?.('button,a'); if(!btn)return;
    const label=(btn.textContent||btn.getAttribute('aria-label')||btn.title||'').trim().toLowerCase();
    if(!label.includes('editar')&&!label.includes('edit'))return;
    if(btn.closest('#gpClientV3'))return;
    const id=findClientIdFromElement(btn);
    if(id){ev.preventDefault();ev.stopImmediatePropagation();openRealEdit(id);}
  },true);
  const style=document.createElement('style'); style.textContent='.gp-v3-box{width:min(760px,100%)}.gp-v3-box .kv{min-height:58px}.gp-v3-box .foot{flex-wrap:wrap}.gp-v3-actions{display:flex;gap:5px;flex-wrap:wrap}.gp-v3-actions .btn{padding:6px 8px;font-size:12px}.gp-payment-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0;padding:14px;background:#f8f7fb;border:1px solid #e7e3ef;border-radius:12px}.gp-payment-fields .full{grid-column:1/-1}.gp-payment-fields input[type=url]{width:100%}.gp-payment-fields small{font-size:11px}@media(max-width:700px){.gp-payment-fields{grid-template-columns:1fr}.gp-payment-fields .full{grid-column:auto}}'; document.head.appendChild(style);
  const boot=()=>{patchClientModal();let n=0,t=setInterval(()=>{if(patchClientModal()||++n>80)clearInterval(t)},250)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
