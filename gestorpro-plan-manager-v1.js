/* GestorPro — Plan manager v2
   Admin-only UI. Prices, limits and promotions are persisted in Supabase plans table. */
(function(){
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = v => Number(v || 0).toFixed(2);
  const dtLocal = v => v ? new Date(v).toISOString().slice(0,16) : '';
  let plans = [];

  async function getContext(){
    const api = window.GestorProSupabase;
    if(!api) throw new Error('Supabase ainda não está pronto.');
    const org = await api.organization();
    if(!org) throw new Error('Sessão ou organização não encontrada.');
    const role = String(org.role || '').toLowerCase();
    if(!['master','owner','admin'].includes(role)) throw new Error('Acesso restrito ao administrador.');
    return api.client();
  }
  async function loadPlans(){
    const c = await getContext();
    const {data,error} = await c.from('plans').select('*').order('price',{ascending:true});
    if(error) throw error; plans=data||[]; render();
  }
  function modalHtml(){
    const rows=plans.map((p,i)=>`<div style="border:1px solid #e7e0f4;border-radius:12px;padding:13px;margin:8px 0;background:#fff">
      <div style="display:grid;grid-template-columns:1.4fr .9fr .9fr .8fr .9fr .9fr;gap:8px;align-items:end">
        <label style="font-size:11px;font-weight:800;color:#77718a">Nome<input data-i="${i}" data-k="name" value="${esc(p.name)}" style="display:block;width:100%;padding:9px;border:1px solid #e7e0ef;border-radius:8px"></label>
        <label style="font-size:11px;font-weight:800;color:#77718a">Preço normal<input data-i="${i}" data-k="price" type="number" min="0" step="0.01" value="${money(p.price)}" style="display:block;width:100%;padding:9px;border:1px solid #e7e0ef;border-radius:8px"></label>
        <label style="font-size:11px;font-weight:800;color:#77718a">Período<select data-i="${i}" data-k="billing_period" style="display:block;width:100%;padding:9px;border:1px solid #e7e0ef;border-radius:8px"><option value="week" ${p.billing_period==='week'?'selected':''}>Semanal</option><option value="month" ${p.billing_period==='month'?'selected':''}>Mensal</option><option value="year" ${p.billing_period==='year'?'selected':''}>Anual</option></select></label>
        <label style="font-size:11px;font-weight:800;color:#77718a">Trial<input data-i="${i}" data-k="trial_days" type="number" min="0" value="${Number(p.trial_days||0)}" style="display:block;width:100%;padding:9px;border:1px solid #e7e0ef;border-radius:8px"></label>
        <label style="font-size:11px;font-weight:800;color:#77718a">Clientes<input data-i="${i}" data-k="max_clients" type="number" min="0" value="${Number(p.max_clients||0)}" style="display:block;width:100%;padding:9px;border:1px solid #e7e0ef;border-radius:8px"></label>
        <label style="font-size:11px;font-weight:800;color:#77718a"><input data-i="${i}" data-k="active" type="checkbox" ${p.active?'checked':''}> Ativo</label>
      </div>
      <div style="margin-top:10px;padding:10px;border-radius:10px;background:#faf8ff">
        <strong style="font-size:12px">🔥 Promoção</strong>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:end;margin-top:8px">
          <label style="font-size:11px;font-weight:800;color:#77718a">Preço promocional<input data-i="${i}" data-k="promo_price" type="number" min="0" step="0.01" value="${p.promo_price==null?'':money(p.promo_price)}" placeholder="Ex.: 19,90" style="display:block;width:100%;padding:9px;border:1px solid #e7e0ef;border-radius:8px"></label>
          <label style="font-size:11px;font-weight:800;color:#77718a">Início<input data-i="${i}" data-k="promo_starts_at" type="datetime-local" value="${esc(dtLocal(p.promo_starts_at))}" style="display:block;width:100%;padding:9px;border:1px solid #e7e0ef;border-radius:8px"></label>
          <label style="font-size:11px;font-weight:800;color:#77718a">Fim<input data-i="${i}" data-k="promo_ends_at" type="datetime-local" value="${esc(dtLocal(p.promo_ends_at))}" style="display:block;width:100%;padding:9px;border:1px solid #e7e0ef;border-radius:8px"></label>
          <label style="font-size:11px;font-weight:800;color:#77718a"><input data-i="${i}" data-k="promo_active" type="checkbox" ${p.promo_active?'checked':''}> Ativa</label>
        </div>
      </div>
      <div style="margin-top:8px;display:flex;justify-content:flex-end"><button class="btn primary" data-save="${i}">Salvar plano</button></div>
    </div>`).join('');
    return `<div id="gpPlansModal" class="modal open"><div class="box" style="width:min(1100px,100%)"><div class="modalhead"><h2>Planos e assinaturas</h2><button class="btn" id="gpPlansClose">✕</button></div><div class="notice">Preço normal e promoção são editáveis e ficam salvos no Supabase.</div>${rows||'<div class="empty">Nenhum plano cadastrado.</div>'}<div class="foot"><button class="btn" id="gpPlansReload">Atualizar</button></div></div></div>`;
  }
  function render(){
    document.getElementById('gpPlansModal')?.remove(); document.body.insertAdjacentHTML('beforeend',modalHtml());
    document.getElementById('gpPlansClose').onclick=()=>document.getElementById('gpPlansModal')?.remove();
    document.getElementById('gpPlansReload').onclick=()=>loadPlans().catch(showError);
    document.querySelectorAll('[data-save]').forEach(btn=>btn.onclick=()=>save(Number(btn.dataset.save)));
  }
  async function save(i){
    try{
      const p=plans[i]; if(!p?.id) throw new Error('Plano inválido.');
      const root=document.getElementById('gpPlansModal'); const value=k=>root.querySelector(`[data-i="${i}"][data-k="${k}"]`);
      const promoRaw=value('promo_price').value.trim();
      const starts=value('promo_starts_at').value; const ends=value('promo_ends_at').value;
      const patch={
        name:value('name').value.trim(), price:Number(value('price').value), billing_period:value('billing_period').value,
        trial_days:Math.max(0,Number(value('trial_days').value)), max_clients:Math.max(0,Number(value('max_clients').value)), active:value('active').checked,
        promo_price:promoRaw===''?null:Number(promoRaw), promo_starts_at:starts?new Date(starts).toISOString():null,
        promo_ends_at:ends?new Date(ends).toISOString():null, promo_active:value('promo_active').checked
      };
      if(!patch.name || !Number.isFinite(patch.price)) throw new Error('Nome e preço são obrigatórios.');
      if(patch.promo_price!==null && (!Number.isFinite(patch.promo_price) || patch.promo_price<0)) throw new Error('Preço promocional inválido.');
      if(patch.promo_active && patch.promo_price===null) throw new Error('Informe o preço promocional antes de ativar a promoção.');
      if(patch.promo_starts_at && patch.promo_ends_at && new Date(patch.promo_ends_at)<=new Date(patch.promo_starts_at)) throw new Error('A data final da promoção deve ser posterior à inicial.');
      const c=await getContext(); const {error}=await c.from('plans').update(patch).eq('id',p.id); if(error) throw error;
      alert('Plano atualizado com sucesso.'); await loadPlans();
    }catch(e){showError(e)}
  }
  function showError(e){console.error('GestorPro Plan Manager:',e);alert(e?.message||'Não foi possível atualizar os planos.');}
  async function open(){try{await loadPlans()}catch(e){showError(e)}}
  function installButton(){
    if(document.getElementById('gpPlansButton'))return; const nav=document.querySelector('.nav'); if(!nav)return;
    const settings=Array.from(nav.querySelectorAll('button')).find(b=>/Configurações/i.test(b.textContent)); if(!settings)return;
    const b=document.createElement('button');b.id='gpPlansButton';b.type='button';b.innerHTML='▣ <span>Planos</span>';b.title='Gerenciar planos e preços';b.onclick=open;nav.insertBefore(b,settings);
  }
  function boot(){setTimeout(installButton,500);setTimeout(installButton,2000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
