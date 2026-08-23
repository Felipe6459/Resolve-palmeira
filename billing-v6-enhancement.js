/* GestorPro — Central de Cobranças V6 */
(function(){
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const db=()=>window.db||window.state||window.data||{};
 const list=()=>db().clients||db().clientes||window.clients||[];
 function days(c){const raw=c.due||c.vencimento||c.expiration||c.expiresAt;if(!raw)return null;const t=new Date(raw+'T23:59:59');return Math.ceil((t-Date.now())/86400000)}
 function group(c){const d=days(c);if(d===null)return 'sem-data';if(d<0)return 'vencido';if(d===0)return 'hoje';if(d<=3)return '3dias';if(d<=7)return '7dias';return 'futuro'}
 window.gpBilling=function(filter='hoje'){
  let m=document.getElementById('gpBillingV6');if(!m){m=document.createElement('div');m.id='gpBillingV6';m.className='modal';document.body.appendChild(m)}
  const cs=list().filter(c=>filter==='todos'||group(c)===filter);
  const buttons=['todos','hoje','3dias','7dias','vencido'].map(k=>'<button class="btn '+(filter===k?'primary':'')+'" onclick="gpBilling(\''+k+'\')">'+({todos:'Todos',hoje:'Hoje','3dias':'Até 3 dias','7dias':'Até 7 dias',vencido:'Vencidos'}[k])+'</button>').join('');
  const rows=cs.map(c=>{const d=days(c);const phone=String(c.whatsapp||c.phone||'').replace(/\D/g,'');const name=c.name||c.nome||'Cliente';const due=c.due||c.vencimento||'-';const msg=encodeURIComponent('Olá '+name+', tudo bem? Passando para avisar sobre o vencimento da sua assinatura ('+due+').');return '<div class="gp-bill-row"><div><b>'+esc(name)+'</b><small>'+esc(c.plan||c.plano||'')+' · Vencimento: '+esc(due)+'</small></div><strong class="'+(d<0?'red':'')+'">'+(d===null?'—':d<0?Math.abs(d)+' dias atrasado':d===0?'vence hoje':'vence em '+d+' dias')+'</strong><a class="btn soft" target="_blank" href="https://wa.me/'+phone+'?text='+msg+'">📱 WhatsApp</a></div>'}).join('')||'<div class="gp-empty">Nenhum cliente nesta categoria.</div>';
  m.innerHTML='<div class="box gp-bill-box"><div class="modalhead"><h2>🔔 Central de Cobranças</h2><button class="btn" onclick="this.closest(\'.modal\').classList.remove(\'open\')">✕</button></div><div class="gp-bill-filters">'+buttons+'</div><div class="gp-bill-list">'+rows+'</div></div>';m.classList.add('open');
 };
 const style=document.createElement('style');style.textContent='.gp-bill-box{width:min(900px,100%)}.gp-bill-filters{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.gp-bill-list{border:1px solid #eee9f5;border-radius:14px;overflow:hidden}.gp-bill-row{display:grid;grid-template-columns:2fr 1.3fr auto;gap:10px;align-items:center;padding:13px;border-bottom:1px solid #eee9f5}.gp-bill-row:last-child{border:0}.gp-bill-row small{display:block;color:#8b849b;margin-top:3px}.gp-bill-row strong{font-size:13px}.gp-bill-row .red{color:#c62828}.gp-empty{padding:30px;text-align:center;color:#8b849b}@media(max-width:650px){.gp-bill-row{grid-template-columns:1fr}.gp-bill-row .btn{justify-self:start}}';document.head.appendChild(style);
})();
