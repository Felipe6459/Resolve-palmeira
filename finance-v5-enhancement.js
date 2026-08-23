/* GestorPro — Financeiro V5
   Estrutura complementar para visão financeira e fechamento mensal. */
(function(){
  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
  const d=()=>window.db||window.state||window.data||{};
  const clients=()=>d().clients||d().clientes||window.clients||[];
  const expenses=()=>d().expenses||d().despesas||window.expenses||[];
  function calc(){
    const revenue=clients().reduce((a,c)=>a+Number(c.value??c.valor??c.assinatura??0),0);
    const creditCost=clients().reduce((a,c)=>a+Number(c.creditCost??c.custoCredito??c.cost??0),0);
    const exp=expenses().reduce((a,e)=>a+Number(e.value??e.valor??e.amount??0),0);
    const profit=revenue-creditCost-exp;
    return {revenue,creditCost,expenses:exp,profit,margin:revenue?profit/revenue*100:0};
  }
  window.gpFinanceDashboard=function(){
    let m=document.getElementById('gpFinanceV5');if(!m){m=document.createElement('div');m.id='gpFinanceV5';m.className='modal';document.body.appendChild(m)}
    const x=calc();
    m.innerHTML='<div class="box gp-fin-box"><div class="modalhead"><h2>💰 Financeiro GestorPro</h2><button class="btn" onclick="this.closest(\'.modal\').classList.remove(\'open\')">✕</button></div><div class="gp-fin-grid"><div><small>Receita</small><b>'+money(x.revenue)+'</b></div><div><small>Custo dos créditos</small><b>'+money(x.creditCost)+'</b></div><div><small>Despesas</small><b>'+money(x.expenses)+'</b></div><div class="profit"><small>Lucro líquido</small><b>'+money(x.profit)+'</b><em>Margem '+x.margin.toFixed(1)+'%</em></div></div><div class="gp-fin-note">O custo dos créditos permanece separado da receita das assinaturas. O lucro líquido considera também as despesas registradas.</div></div>';
    m.classList.add('open');
  };
  const style=document.createElement('style');style.textContent='.gp-fin-box{width:min(850px,100%)}.gp-fin-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}.gp-fin-grid>div{padding:16px;border:1px solid #e8e1f2;border-radius:14px;background:#faf8ff}.gp-fin-grid small{display:block;color:#8b849b}.gp-fin-grid b{display:block;font-size:20px;margin-top:5px}.gp-fin-grid .profit{background:linear-gradient(135deg,#6d42e8,#8b5cf6);color:#fff}.gp-fin-grid .profit small{color:#eee8ff}.gp-fin-grid em{font-size:12px;font-style:normal;color:#eee8ff}.gp-fin-note{padding:14px;background:#f5f2fa;border-radius:12px;color:#625b70;font-size:13px}@media(max-width:700px){.gp-fin-grid{grid-template-columns:1fr 1fr}}';document.head.appendChild(style);
})();
