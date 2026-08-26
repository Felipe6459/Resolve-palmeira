/* GestorPro — Cliente V3
   Extensão da ficha de clientes + link de pagamento.
   A edição original continua sendo feita pela função clientModal() do GestorPro.
*/
(function(){
  const KEY='resolve_palmeira_v6';
  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\\':'&#39;'}[m]));

  // O D principal do index.html é lexical e não fica exposto em window.D.
  // Por isso esta extensão lê o mesmo armazenamento usado pelo painel.
  function readStore(){
    try{return JSON.parse(localStorage.getItem(KEY)||'null')||{clients:[]}}catch(e){return {clients:[]}}
  }
  function findClient(id){
    const d=readStore();
    return (d.clients||[]).find(x=>String(x.id)===String(id))||null;
  }
  function getClients(){return readStore().clients||[]}
  function persistPayment(id,link,include){
    try{
      const d=readStore();
      const c=(d.clients||[]).find(x=>String(x.id)===String(id));
      if(!c)return false;
      c.payment_link=link;
      c.include_payment_link_in_messages=include;
      localStorage.setItem(KEY,JSON.stringify(d));
      return true;
    }catch(e){console.error('[GestorPro] payment link persist',e);return false}
  }

  window.gpClientDetails=function(id){
    const c=findClient(id); if(!c){window.toast?.('Cliente não encontrado');return;}
    let modal=document.getElementById('gpClientV3');
    if(!modal){modal=document.createElement('div');modal.id='gpClientV3';modal.className='modal';document.body.appendChild(modal)}
    const cost=Number(c.creditCost||0),value=Number(c.value||0);
    modal.innerHTML='<div class="box gp-v3-box"><div class="modalhead"><h2>'+esc(c.name||'Cliente')+'</h2><button class="btn" onclick="this.closest(\'.modal\').classList.remove(\'open\')">✕</button></div>'+
      '<div class="profile"><div class="kv"><small>WhatsApp</small><b>'+esc(c.whatsapp||'-')+'</b></div><div class="kv"><small>Status</small><b>'+esc(c.status||'-')+'</b></div><div class="kv"><small>Plano</small><b>'+esc(c.plan||'-')+'</b></div><div class="kv"><small>Valor</small><b>'+money(value)+'</b></div><div class="kv"><small>Vencimento</small><b>'+esc(c.due||'-')+'</b></div></div>'+ 
      '<div class="foot"><button class="btn" onclick="document.getElementById(\'gpClientV3\').classList.remove(\'open\');window.gpOpenClientEdit&&window.gpOpenClientEdit('+JSON.stringify(c.id)+')">✏️ Editar</button></div></div>';
    modal.classList.add('open');
  };

  function openClientModal(){return document.querySelector('.modal.open:not(#gpClientV3)')||document.getElementById('modal')}
  function injectPaymentFields(){
    const modal=openClientModal();if(!modal)return;
    const box=modal.querySelector('.box');if(!box)return;
    let fields=box.querySelector('#gpPaymentLink')?.closest('.gp-payment-fields');
    if(!fields){
      const form=box.querySelector('form');
      fields=document.createElement('div');fields.className='gp-payment-fields';
      fields.innerHTML='<div class="field full"><label>🔗 Link de pagamento do cliente</label><input id="gpPaymentLink" type="url" placeholder="https://seu-servidor.com/#/checkout/..." autocomplete="off"><small class="muted">Cole aqui o link específico da conta desse cliente.</small></div><div class="field full"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input id="gpIncludePaymentLink" type="checkbox" style="width:auto"> Incluir este link nas mensagens automáticas do cliente</label></div>';
      const target=form||box;const anchor=target.querySelector('.foot')||target.lastElementChild;
      if(anchor)target.insertBefore(fields,anchor);else target.appendChild(fields);
    }
    const c=window.__gpEditingClient;
    const input=document.getElementById('gpPaymentLink'),check=document.getElementById('gpIncludePaymentLink');
    if(input)input.value=c?.payment_link||'';
    if(check)check.checked=!!c?.include_payment_link_in_messages;
  }

  function openRealEdit(id){
    if(!id)return false;
    // Não dependemos de window.D: clientModal() usa o D lexical original.
    if(typeof window.clientModal!=='function'){window.toast?.('A edição de clientes ainda não foi carregada.');return false}
    window.__gpEditingClient=findClient(id);
    try{
      window.clientModal(id);
      setTimeout(injectPaymentFields,0);
      setTimeout(injectPaymentFields,80);
      setTimeout(injectPaymentFields,250);
      return true;
    }catch(e){console.error('[GestorPro] client edit',e);window.toast?.('Não foi possível abrir a edição');return false}
  }

  function patch(){
    if(typeof window.clientModal!=='function')return false;
    if(window.__gpClientPaymentPatched)return true;
    const originalModal=window.clientModal;
    window.clientModal=function(id){
      window.__gpEditingClient=id?findClient(id):null;
      const result=originalModal.apply(this,arguments);
      setTimeout(injectPaymentFields,0);
      setTimeout(injectPaymentFields,80);
      return result;
    };
    window.gpOpenClientEdit=openRealEdit;

    if(typeof window.saveClient==='function'&&!window.__gpClientSavePatched){
      const originalSave=window.saveClient;
      window.saveClient=async function(e){
        const editingId=window.__gpEditingClient?.id||null;
        const link=document.getElementById('gpPaymentLink')?.value?.trim()||'';
        const include=!!document.getElementById('gpIncludePaymentLink')?.checked;
        const result=await originalSave.apply(this,arguments);
        if(editingId)persistPayment(editingId,link,include);
        else{
          const list=getClients();
          const created=list[list.length-1];
          if(created)persistPayment(created.id,link,include);
        }
        return result;
      };
      window.__gpClientSavePatched=true;
    }
    window.__gpClientPaymentPatched=true;
    return true;
  }

  const style=document.createElement('style');
  style.textContent='.gp-v3-box{width:min(760px,100%)}.gp-v3-box .kv{min-height:58px}.gp-v3-box .foot{flex-wrap:wrap}.gp-payment-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0;padding:14px;background:#f8f7fb;border:1px solid #e7e3ef;border-radius:12px}.gp-payment-fields .full{grid-column:1/-1}.gp-payment-fields input[type=url]{width:100%}.gp-payment-fields small{font-size:11px}@media(max-width:700px){.gp-payment-fields{grid-template-columns:1fr}.gp-payment-fields .full{grid-column:auto}}';
  document.head.appendChild(style);

  const boot=()=>{patch();let n=0;const t=setInterval(()=>{if(patch()||++n>80)clearInterval(t)},250)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
