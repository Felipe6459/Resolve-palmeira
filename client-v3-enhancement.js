/* GestorPro — Cliente V3 / edição e link de pagamento */
(function(){
  if(window.__GP_CLIENT_V3_READY)return;
  window.__GP_CLIENT_V3_READY=true;
  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\\':'&#39;'}[m]));
  function clients(){
    const sources=[window.D,window.db,window.state,window.data];
    for(const d of sources)if(d&&Array.isArray(d.clients))return d.clients;
    return Array.isArray(window.clients)?window.clients:[];
  }
  function findClient(id){return clients().find(x=>String(x.id)===String(id));}
  function openClientModal(){return document.querySelector('.modal.open:not(#gpClientV3)')||document.querySelector('.modal:not(#gpClientV3)');}
  function injectPaymentFields(){
    const modal=openClientModal();if(!modal)return;
    const box=modal.querySelector('.box');if(!box||box.querySelector('#gpPaymentLink'))return;
    const form=box.querySelector('form'),target=form||box;
    const fields=document.createElement('div');fields.className='gp-payment-fields';
    fields.innerHTML='<div class="field full"><label>🔗 Link de pagamento do cliente</label><input id="gpPaymentLink" type="url" placeholder="https://seu-servidor.com/#/checkout/..." autocomplete="off"><small class="muted">Cole aqui o link específico da conta desse cliente.</small></div><div class="field full"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input id="gpIncludePaymentLink" type="checkbox" style="width:auto"> Incluir este link nas mensagens automáticas do cliente</label></div>';
    const anchor=target.querySelector('.foot')||target.lastElementChild;
    if(anchor)target.insertBefore(fields,anchor);else target.appendChild(fields);
    const c=window.__gpEditingClient;
    if(c){document.getElementById('gpPaymentLink').value=c.payment_link||c.paymentLink||'';document.getElementById('gpIncludePaymentLink').checked=!!(c.include_payment_link_in_messages??c.includePaymentLinkInMessages);}
  }
  function openRealEdit(id){
    const c=findClient(id);if(!c){window.toast?.('Cliente não encontrado');return false;}
    window.__gpEditingClient=c;
    if(typeof window.clientModal!=='function'){window.toast?.('A tela de edição ainda não foi carregada.');return false;}
    try{
      window.clientModal(c.id);
      requestAnimationFrame(injectPaymentFields);
      setTimeout(injectPaymentFields,80);
      return true;
    }catch(e){console.error('[GestorPro] edição',e);window.toast?.('Não foi possível abrir a edição.');return false;}
  }
  function patch(){
    if(typeof window.clientModal!=='function')return false;
    if(!window.__GP_ORIGINAL_CLIENT_MODAL)window.__GP_ORIGINAL_CLIENT_MODAL=window.clientModal;
    if(!window.__GP_CLIENT_MODAL_PATCHED){
      const original=window.__GP_ORIGINAL_CLIENT_MODAL;
      window.clientModal=function(id){window.__gpEditingClient=id?findClient(id):null;const r=original.apply(this,arguments);requestAnimationFrame(injectPaymentFields);setTimeout(injectPaymentFields,100);return r;};
      window.__GP_CLIENT_MODAL_PATCHED=true;
    }
    window.gpOpenClientEdit=openRealEdit;
    window.editClient=openRealEdit;
    if(typeof window.saveClient==='function'&&!window.__GP_SAVE_CLIENT_PATCHED){
      const originalSave=window.saveClient;
      window.saveClient=async function(e){
        const link=document.getElementById('gpPaymentLink')?.value?.trim()||'';
        const include=!!document.getElementById('gpIncludePaymentLink')?.checked;
        const result=await originalSave.apply(this,arguments);
        const id=window.__gpEditingClient?.id;
        const c=id?findClient(id):null;
        if(c){c.payment_link=link;c.include_payment_link_in_messages=include;try{await window.GestorProPersistence?.save?.();}catch(err){console.error('[GestorPro] link pagamento',err);}}
        return result;
      };
      window.__GP_SAVE_CLIENT_PATCHED=true;
    }
    return true;
  }
  window.gpClientDetails=function(id){
    const c=findClient(id);if(!c){window.toast?.('Cliente não encontrado');return;}
    let modal=document.getElementById('gpClientV3');
    if(!modal){modal=document.createElement('div');modal.id='gpClientV3';modal.className='modal';document.body.appendChild(modal);}
    const value=Number(c.value||c.valor||c.assinatura||0),cost=Number(c.creditCost||c.custoCredito||c.cost||0);
    modal.innerHTML='<div class="box gp-v3-box"><div class="modalhead"><h2>'+esc(c.name||c.nome||'Cliente')+'</h2><button class="btn" onclick="this.closest(\'.modal\').classList.remove(\'open\')">✕</button></div><div class="profile"><div class="kv"><small>WhatsApp</small><b>'+esc(c.whatsapp||c.phone||'-')+'</b></div><div class="kv"><small>Status</small><b>'+esc(c.status||'-')+'</b></div><div class="kv"><small>Plano</small><b>'+esc(c.plan||c.plano||'-')+'</b></div><div class="kv"><small>Valor</small><b>'+money(value)+'</b></div><div class="kv"><small>Vencimento</small><b>'+esc(c.due||c.vencimento||'-')+'</b></div><div class="kv"><small>Lucro estimado</small><b class="green">'+money(value-cost)+'</b></div></div><div class="foot"><button class="btn" onclick="document.getElementById(\'gpClientV3\').classList.remove(\'open\');window.gpOpenClientEdit('+JSON.stringify(c.id)+')">✏️ Editar</button><button class="btn primary" onclick="document.getElementById(\'gpClientV3\').classList.remove(\'open\');renewClient&&renewClient('+JSON.stringify(c.id)+')">🔄 Renovar</button></div></div>';
    modal.classList.add('open');
  };
  const style=document.createElement('style');style.textContent='.gp-v3-box{width:min(760px,100%)}.gp-v3-box .kv{min-height:58px}.gp-v3-box .foot{flex-wrap:wrap}.gp-payment-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0;padding:14px;background:#f8f7fb;border:1px solid #e7e3ef;border-radius:12px}.gp-payment-fields .full{grid-column:1/-1}.gp-payment-fields input[type=url]{width:100%}.gp-payment-fields small{font-size:11px}@media(max-width:700px){.gp-payment-fields{grid-template-columns:1fr}.gp-payment-fields .full{grid-column:auto}}';document.head.appendChild(style);
  const boot=()=>{patch();let n=0,t=setInterval(()=>{if(patch()||++n>100)clearInterval(t)},200);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
