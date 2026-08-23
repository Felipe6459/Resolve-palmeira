/* GestorPro — Relatórios V7
   Consolida receita, custos, despesas, lucro e indicadores por período.
   É uma camada complementar; não altera os dados existentes. */
(function(){
 const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
 const db=()=>window.db||window.state||window.data||{};
 const clients=()=>db().clients||db().clientes||window.clients||[];
 const expenses=()=>db().expenses||db().despesas||window.expenses||[];
 const dateOf=c=>new Date(c.paidAt||c.paymentDate||c.dataPagamento||c.createdAt||c.data_de_inicio||c.due||c.vencimento||Date.now());
 const inMonth=(d,y,m)=>d.getFullYear()===y&&d.getMonth()===m;
 function calc(y,m){
  const cs=clients().filter(c=>inMonth(dateOf(c),y,m));
  const es=expenses().filter(e=>inMonth(dateOf(e),y,m));
  const revenue=cs.reduce((a,c)=>a+Number(c.value??c.valor??c.assinatura??0),0);
  const credits=cs.reduce((a,c)=>a+Number(c.creditCost??c.custoCredito??c.cost??0),0);
  const exp=es.reduce((a,e)=>a+Number(e.value??e.valor??e.amount??0),0);
  const profit=revenue-credits-exp;
  const servers={};cs.forEach(c=>{const s=c.serverName||c.servidorNome||c.server||c.servidor||'Sem servidor';if(!servers[s])servers[s]={clients:0,revenue:0,cost:0};servers[s].clients++;servers[s].revenue+=Number(c.value??c.valor??c.assinatura??0);servers[s].cost+=Number(c.creditCost??c.custoCredito??c.cost??0)});
  return {revenue,credits,exp,profit,margin:revenue?profit/revenue*100:0,clients:cs.length,renewals:cs.filter(c=>c.renewedAt||c.renovacao||c.renewal).length,servers};
 }
 window.gpReports=function(y,m){
  const now=new Date();y=y??now.getFullYear();m=m??now.getMonth();let modal=document.getElementById('gpReportsV7');if(!modal){modal=document.createElement('div');modal.id='gpReportsV7';modal.className='modal';document.body.appendChild(modal)}
  const x=calc(y,m);const month=new Date(y,m,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});const rows=Object.entries(x.servers).sort((a,b)=>(b[1].revenue-b[1].cost)-(a[1].revenue-a[1].cost)).map(([n,v])=>'<div class="gp-rep-row"><b>'+n+'</b><span>'+v.clients+'</span><span>'+money(v.revenue)+'</span><span>'+money(v.cost)+'</span><strong>'+money(v.revenue-v.cost)+'</strong></div>').join('')||'<div class="gp-empty">Sem movimentação no período.</div>';
  modal.innerHTML='<div class="box gp-rep-box"><div class="modalhead"><h2>📊 Relatórios GestorPro</h2><button class="btn" onclick="this.closest(\'.modal\').classList.remove(\'open\')">✕</button></div><div class="gp-rep-period"><button class="btn" onclick="gpReports('+y+','+(m-1)+')">‹</button><b>'+month+'</b><button class="btn" onclick="gpReports('+y+','+(m+1)+')">›</button></div><div class="gp-rep-grid"><div><small>Receita</small><b>'+money(x.revenue)+'</b></div><div><small>Créditos</small><b>'+money(x.credits)+'</b></div><div><small>Despesas</small><b>'+money(x.exp)+'</b></div><div class="profit"><small>Lucro líquido</small><b>'+money(x.profit)+'</b><em>'+x.margin.toFixed(1)+'% de margem</em></div></div><div class="gp-rep-stats"><span>👥 '+x.clients+' clientes</span><span>🔄 '+x.renewals+' renovações</span></div><h3>Desempenho por servidor</h3><div class="gp-rep-table"><div class="gp-rep-head"><span>Servidor</span><span>Clientes</span><span>Receita</span><span>Custo</span><span>Lucro</span></div>'+rows+'</div><button class="btn primary" onclick="window.print()">🖨️ Imprimir relatório</button></div>';modal.classList.add('open');
 };
 const style=document.createElement('style');style.textContent='.gp-rep-box{width:min(980px,100%)}.gp-rep-period{display:flex;justify-content:center;align-items:center;gap:18px;margin:12px}.gp-rep-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.gp-rep-grid>div{padding:15px;border:1px solid #e8e1f2;border-radius:14px;background:#faf8ff}.gp-rep-grid small{display:block;color:#8b849b}.gp-rep-grid b{display:block;font-size:19px;margin-top:4px}.gp-rep-grid .profit{background:linear-gradient(135deg,#6d42e8,#8b5cf6);color:#fff}.gp-rep-grid .profit small,.gp-rep-grid .profit em{color:#eee8ff}.gp-rep-grid em{font-size:12px;font-style:normal}.gp-rep-stats{display:flex;gap:15px;padding:14px 0;color:#625b70}.gp-rep-table{border:1px solid #eee9f5;border-radius:14px;overflow:hidden;margin-bottom:15px}.gp-rep-head,.gp-rep-row{display:grid;grid-template-columns:2fr 1fr 1.2fr 1.2fr 1.2fr;gap:8px;align-items:center;padding:12px}.gp-rep-head{font-size:12px;color:#8b849b;font-weight:800}.gp-rep-row{border-top:1px solid #eee9f5}.gp-rep-row strong{color:#17834b}.gp-empty{padding:25px;text-align:center;color:#8b849b}@media(max-width:700px){.gp-rep-grid{grid-template-columns:1fr 1fr}.gp-rep-head{display:none}.gp-rep-row{grid-template-columns:1fr 1fr}.gp-rep-row strong{justify-self:end}}';document.head.appendChild(style);
})();
