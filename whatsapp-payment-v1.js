/* GestorPro — WhatsApp com link individual de pagamento */
(function(){
  function enabled(v){
    return v===true || v===1 || String(v??'').trim().toLowerCase()==='true' || String(v??'').trim()==='1';
  }
  function data(){
    try{ if(typeof D!=='undefined' && D) return D; }catch(e){}
    return window.D||{};
  }
  function clientById(cid){
    const d=data();
    const list=Array.isArray(d.clients)?d.clients:[];
    return list.find(c=>String(c.id)===String(cid));
  }
  function formatDue(v){
    if(typeof window.fmtDate==='function') return window.fmtDate(v);
    if(!v) return '-';
    const x=new Date(String(v).includes('T')?v+'':String(v)+'T00:00:00');
    return Number.isNaN(x.getTime())?String(v):x.toLocaleDateString('pt-BR');
  }
  window.wa=function(cid){
    const c=clientById(cid);
    if(!c) return;
    const num=String(c.whatsapp||c.phone||'').replace(/\D/g,'');
    if(!num){
      if(typeof window.toast==='function') window.toast('Cliente não possui WhatsApp cadastrado');
      return;
    }
    const due=c.due||c.vencimento||c.expiration||c.expiresAt||'';
    const name=c.name||c.nome||'Cliente';
    let msg;
    if(due && String(due)<String(typeof window.today==='function'?window.today():new Date().toISOString().slice(0,10))){
      msg=`Olá, ${name}! Seu acesso está vencido desde ${formatDue(due)}. Podemos fazer a renovação?`;
    }else{
      msg=`Olá, ${name}! Seu acesso vence em ${formatDue(due)}. Podemos renovar?`;
    }
    const link=String(c.payment_link??c.paymentLink??'').trim();
    const include=enabled(c.include_payment_link_in_messages??c.includePaymentLinkInMessages);
    if(include && link){
      msg += `\n\nPara renovar seu plano, clique no link abaixo:\n${link}\n\nPor favor, nos envie o comprovante de pagamento assim que possível.`;
    }
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`,'_blank');
  };
  console.log('[GestorPro] WhatsApp payment link V1 ativo');
})();
