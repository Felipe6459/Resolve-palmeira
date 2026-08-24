/* GestorPro — Central de Servidores V5
   Indicadores, estoque, rentabilidade e ações de editar/excluir servidores. */
(function(){
  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const data=()=>{try{if(typeof D!=='undefined'&&D)return D}catch(e){}return window.D||window.db||window.state||window.data||{}};
  const arr=()=>data().servers||data().servidores||window.servers||[];
  const clients=()=>data().clients||data().clientes||window.clients||[];
  function metrics(s){
    const id=String(s.id??s.serverId??s.nome??s.name); const cs=clients().filter(c=>String(c.serverId??c.servidorId??c.server??c.servidor??c.serverName??'')===id || String(c.serverName??c.servidorNome??'')===String(s.name??s.nome));
    const revenue=cs.reduce((a,c)=>a+Number(c.value??c.valor??c.assinatura??0),0);
    const cost=cs.reduce((a,c)=>a+Number(c.creditCost??c.custoCredito??c.cost??s.creditPrice??s.precoCredito??0),0);
    const profit=revenue-cost; const margin=revenue?profit/revenue*100:0;
    return {clients:cs.length,revenue,cost,profit,margin,credits:Number(s.credits??s.creditos??s.balance??0),price:Number(s.creditPrice??s.precoCredito??s.custoCredito??0)};
  }
  window.gpServersDashboard=function(){
    let m=document.getElementById('gpServersV4'); if(!m){m=document.createElement('div');m.id='gpServersV4';m.className='modal';document.body.appendChild(m)}
    const rows=arr().slice(0,50).map((s,i)=>{const x=metrics(s);const id=String(s.id??s.serverId??s.nome??s.name??i);return '<div class="gp-server-row"><div><b>'+esc(s.name||s.nome||'Servidor')+'</b><small>'+x.clients+' clientes · '+x.credits+' créditos</small></div><span>'+money(x.revenue)+'</span><span>'+money(x.cost)+'</span><strong>'+money(x.profit)+'</strong><em>'+x.margin.toFixed(1)+'%</em><div class="gp-server-actions"><button class="btn small soft" onclick="gpEditServer('+JSON.stringify(id)+');setTimeout(()=>gpServersDashboard(),300)">✏️ Editar</button><button class="btn small danger" onclick="gpDeleteServer('+JSON.stringify(id)+');setTimeout(()=>gpServersDashboard(),300)">🗑️ Excluir</button></div></div>'}).join('');
    const total=arr().slice(0,50).reduce((a,s)=>{const x=metrics(s);return {c:a.c+x.clients,r:a.r+x.revenue,k:a.k+x.cost,p:a.p+x.profit}}, {c:0,r:0,k:0,p:0});
    m.innerHTML='<div class="box gp-servers-box"><div class="modalhead"><h2>🖥️ Central de Servidores</h2><button class="btn" onclick="this.closest(\'.modal\').classList.remove(\'open\')">✕</button></div><div class="gp-server-summary"><div><small>Clientes</small><b>'+total.c+'</b></div><div><small>Receita</small><b>'+money(total.r)+'</b></div><div><small>Custo</small><b>'+money(total.k)+'</b></div><div><small>Lucro</small><b>'+money(total.p)+'</b></div></div><div class="gp-server-table"><div class="gp-server-head"><span>Servidor</span><span>Receita</span><span>Custo</span><span>Lucro</span><span>Margem</span><span>Ações</span></div>'+rows+'</div></div>';
    m.classList.add('open');
  };
  const style=document.createElement('style');style.textContent='.gp-servers-box{width:min(1100px,100%)}.gp-server-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}.gp-server-summary>div{padding:14px;border:1px solid #e8e1f2;border-radius:12px;background:#faf8ff}.gp-server-summary small,.gp-server-row small{display:block;color:#8b849b}.gp-server-summary b{display:block;font-size:18px;margin-top:4px}.gp-server-head,.gp-server-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr .7fr 190px;gap:10px;align-items:center}.gp-server-head{padding:10px;color:#8b849b;font-size:12px;font-weight:800}.gp-server-row{padding:13px 10px;border-top:1px solid #eee9f5}.gp-server-row strong{color:#17834b}.gp-server-row em{font-style:normal;font-weight:800}.gp-server-row small{margin-top:3px}.gp-server-actions{display:flex;gap:5px;justify-content:flex-end}.gp-server-actions .danger{color:#dc2626}@media(max-width:850px){.gp-server-summary{grid-template-columns:1fr 1fr}.gp-server-head{display:none}.gp-server-row{grid-template-columns:1fr 1fr;gap:7px}.gp-server-row strong,.gp-server-row em{justify-self:end}.gp-server-actions{grid-column:1/-1;justify-content:flex-start}}';document.head.appendChild(style);
})();
