/* GestorPro V13 — painel Master de usuários e assinaturas */
(function(){
  const wait=setInterval(async()=>{
    if(!window.GestorProSupabase||!window.GestorProOrganization) return;
    clearInterval(wait);
    if(window.GestorProOrganization.role!=='master') return;
    const nav=document.getElementById('gpV10Nav');
    if(!nav||document.getElementById('gpMasterBtn')) return;
    const btn=document.createElement('button'); btn.id='gpMasterBtn'; btn.textContent='👑 Master'; btn.onclick=window.gpMasterOpen; nav.appendChild(btn);
  },300);

  async function rpc(name,args){
    const c=await window.GestorProSupabase.client();
    const {data,error}=await c.rpc(name,args||{}); if(error) throw error; return data;
  }
  async function loadPlans(){
    const c=await window.GestorProSupabase.client();
    const {data,error}=await c.from('plans').select('id,name,price,billing_period,active,trial_days').eq('active',true).order('price');
    if(error) throw error; return data||[];
  }
  function esc(v){return String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));}
  function modal(){
    let el=document.getElementById('gpMasterModal'); if(el) return el;
    el=document.createElement('div'); el.id='gpMasterModal'; el.innerHTML=`<div class="gp13-bg"><div class="gp13-card"><div class="gp13-head"><div><b>👑 GestorPro Master</b><small>Usuários e assinaturas</small></div><button id="gp13Close">×</button></div><div class="gp13-actions"><button id="gp13Refresh">↻ Atualizar</button><button id="gp13Register">＋ Cadastrar usuário</button></div><div id="gp13Body">Carregando...</div></div></div>`; document.body.appendChild(el);
    el.querySelector('#gp13Close').onclick=()=>el.remove(); el.querySelector('#gp13Refresh').onclick=()=>render(); el.querySelector('#gp13Register').onclick=()=>showRegister(); return el;
  }
  async function render(){
    const el=modal(), body=el.querySelector('#gp13Body'); body.textContent='Carregando...';
    try{
      const [rows,plans]=await Promise.all([rpc('master_list_accounts'),loadPlans()]);
      body.innerHTML=`<div class="gp13-stats"><span><b>${rows.length}</b> contas</span><span><b>${rows.filter(x=>['active','trial'].includes(x.subscription_status)).length}</b> ativas</span><span><b>${rows.filter(x=>!['active','trial'].includes(x.subscription_status)).length}</b> pendentes/bloqueadas</span></div><div class="gp13-table"><div class="gp13-row gp13-title"><b>Usuário</b><b>Plano</b><b>Status</b><b>Ações</b></div>${rows.map(r=>{const st=r.subscription_status||'pending'; return `<div class="gp13-row"><div><b>${esc(r.organization_name||'Sem empresa')}</b><small>${esc(r.email)}<br>${esc(r.full_name||'')}</small></div><div>${esc(r.plan_name||'Sem plano')}<small>${r.amount?'R$ '+Number(r.amount).toFixed(2).replace('.',','):''}${r.expires_at?'<br>Vence '+new Date(r.expires_at).toLocaleDateString('pt-BR'):''}</small></div><div><span class="gp13-badge ${st}">${esc(st)}</span></div><div class="gp13-buttons">${st!=='active'&&st!=='trial'?`<button data-a="activate" data-id="${r.user_id}">Ativar</button>`:''}${st==='active'||st==='trial'?`<button data-a="renew" data-id="${r.user_id}">Renovar</button><button class="danger" data-a="block" data-id="${r.user_id}">Bloquear</button>`:''}</div></div>`}).join('')}</div>`;
      body.querySelectorAll('button[data-a]').forEach(b=>b.onclick=()=>action(b.dataset.a,b.dataset.id,plans));
    }catch(e){body.innerHTML='<div class="gp13-error">'+esc(e.message||'Erro ao carregar usuários')+'</div>';}
  }
  async function action(type,userId,plans){
    const plan=plans[0]; if(!plan){alert('Nenhum plano ativo cadastrado.');return;}
    try{
      if(type==='block'){if(!confirm('Bloquear este usuário?'))return; await rpc('master_block_account',{p_user_id:userId,p_reason:'Bloqueado pelo Master'});}
      else if(type==='activate'){await rpc('master_activate_account',{p_user_id:userId,p_plan_id:plan.id,p_amount:plan.price,p_days:plan.billing_period==='yearly'?365:30});}
      else if(type==='renew'){await rpc('master_renew_account',{p_user_id:userId,p_plan_id:plan.id,p_amount:plan.price,p_days:plan.billing_period==='yearly'?365:30});}
      await render();
    }catch(e){alert(e.message||'Não foi possível concluir a operação.');}
  }
  async function showRegister(){
    const el=modal(), body=el.querySelector('#gp13Body');
    let plans=[]; try{plans=await loadPlans()}catch(e){}
    body.innerHTML=`<div class="gp13-form"><h3>Cadastrar usuário</h3><p>O usuário precisa primeiro criar a conta no GestorPro. Depois informe o e-mail abaixo para ativar a assinatura.</p><label>E-mail da conta<input id="gp13Email" type="email" placeholder="cliente@email.com"></label><label>Plano<select id="gp13Plan">${plans.map(p=>`<option value="${p.id}" data-price="${p.price}" data-period="${p.billing_period}">${esc(p.name)} — R$ ${Number(p.price).toFixed(2).replace('.',',')}</option>`).join('')}</select></label><button id="gp13Save">Ativar usuário</button><button class="gp13-back" id="gp13Back">← Voltar</button><div id="gp13Msg"></div></div>`;
    body.querySelector('#gp13Back').onclick=render;
    body.querySelector('#gp13Save').onclick=async()=>{const email=body.querySelector('#gp13Email').value.trim(); const s=body.querySelector('#gp13Plan').selectedOptions[0]; const msg=body.querySelector('#gp13Msg'); if(!email){msg.textContent='Informe o e-mail.';return;} msg.textContent='Ativando...'; try{const rows=await rpc('master_list_accounts'); const r=rows.find(x=>(x.email||'').toLowerCase()===email.toLowerCase()); if(!r){msg.textContent='Conta não encontrada. O cliente precisa criar a conta primeiro.';return;} await rpc('master_activate_account',{p_user_id:r.user_id,p_plan_id:s.value,p_amount:Number(s.dataset.price),p_days:s.dataset.period==='yearly'?365:30}); await render();}catch(e){msg.textContent=e.message||'Erro ao ativar.';}};
  }
  window.gpMasterOpen=()=>{modal();render();};
  const style=document.createElement('style'); style.textContent=`#gpMasterModal{position:fixed;inset:0;z-index:1000000}.gp13-bg{min-height:100vh;background:#09070dce;backdrop-filter:blur(5px);display:grid;place-items:center;padding:14px;font-family:Inter,system-ui}.gp13-card{width:min(1050px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:20px;box-shadow:0 30px 90px #0008}.gp13-head{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;background:#17121f;color:#fff}.gp13-head b{display:block;font-size:20px}.gp13-head small{color:#cfc5dd}.gp13-head button{border:0;background:none;color:#fff;font-size:28px}.gp13-actions{display:flex;gap:8px;padding:14px;flex-wrap:wrap}.gp13-actions button,.gp13-buttons button,.gp13-form button{border:0;border-radius:9px;padding:10px 13px;background:#6d42e8;color:#fff;font-weight:800}.gp13-stats{display:flex;gap:10px;flex-wrap:wrap;padding:0 14px 14px}.gp13-stats span{background:#f4f1f8;border-radius:10px;padding:10px 14px}.gp13-table{padding:0 14px 18px}.gp13-row{display:grid;grid-template-columns:1.5fr 1fr .7fr 1.2fr;gap:10px;align-items:center;padding:12px;border-top:1px solid #eee}.gp13-row small{display:block;color:#777;font-size:11px;margin-top:3px}.gp13-title{background:#faf8fc}.gp13-badge{display:inline-block;border-radius:20px;padding:5px 8px;font-size:11px;font-weight:800;background:#eee}.gp13-badge.active,.gp13-badge.trial{background:#dcfce7;color:#166534}.gp13-badge.blocked,.gp13-badge.expired{background:#fee2e2;color:#991b1b}.gp13-buttons{display:flex;gap:5px;flex-wrap:wrap}.gp13-buttons .danger{background:#dc2626}.gp13-form{padding:20px}.gp13-form h3{margin-top:0}.gp13-form p{color:#666}.gp13-form label{display:block;font-weight:700;font-size:12px;margin:12px 0}.gp13-form input,.gp13-form select{display:block;width:100%;box-sizing:border-box;padding:12px;margin-top:6px;border:1px solid #ddd;border-radius:9px}.gp13-form button{margin-top:8px}.gp13-form .gp13-back{background:#eee;color:#333}.gp13-error{padding:20px;color:#b91c1c}@media(max-width:700px){.gp13-row{grid-template-columns:1fr}.gp13-title{display:none}}`; document.head.appendChild(style);
})();