/* GestorPro V10 — integração dos módulos complementares + Supabase
   Este arquivo deve ser carregado pelo index.html uma única vez. */
(function(){
 const modules=['gestorpro-supabase.js','client-v3-enhancement.js','servers-v4-enhancement.js','finance-v5-enhancement.js','billing-v6-enhancement.js','reports-v7-enhancement.js','backup-v8-enhancement.js','settings-v9-enhancement.js'];
 function load(src){return new Promise((resolve,reject)=>{if(document.querySelector('script[src="'+src+'"]'))return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})}
 async function init(){for(const m of modules){try{await load(m)}catch(e){console.warn('GestorPro: módulo não carregado',m,e)}}
  let nav=document.getElementById('gpV10Nav');if(nav)return;
  nav=document.createElement('div');nav.id='gpV10Nav';nav.className='gp-v10-nav';
  nav.innerHTML='<div class="gp-v10-brand"><b>GestorPro</b><small>Central de gestão</small></div><button onclick="window.gpClientDetails&&gpClientDetails((window.clients||[])[0]?.id)">👤 Clientes</button><button onclick="window.gpServersDashboard&&gpServersDashboard()">🖥️ Servidores</button><button onclick="window.gpFinanceDashboard&&gpFinanceDashboard()">💰 Financeiro</button><button onclick="window.gpBilling&&gpBilling(\'todos\')">🔔 Cobranças</button><button onclick="window.gpReports&&gpReports()">📊 Relatórios</button><button onclick="window.gpSettings&&gpSettings()">⚙️ Configurações</button><button onclick="window.gpBackupExport&&gpBackupExport()">💾 Backup</button>';
  document.body.prepend(nav);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 const style=document.createElement('style');style.textContent='.gp-v10-nav{position:sticky;top:0;z-index:9999;display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:10px 14px;background:#17121f;color:#fff;box-shadow:0 4px 18px rgba(0,0,0,.14)}.gp-v10-brand{margin-right:10px;display:flex;flex-direction:column}.gp-v10-brand b{font-size:18px}.gp-v10-brand small{font-size:10px;color:#cfc5dd}.gp-v10-nav button{border:1px solid #453653;background:#241b30;color:#fff;border-radius:9px;padding:9px 11px;cursor:pointer}.gp-v10-nav button:hover{background:#6d42e8}@media(max-width:700px){.gp-v10-nav{overflow-x:auto;flex-wrap:nowrap}.gp-v10-nav button{white-space:nowrap}.gp-v10-brand{position:sticky;left:0;background:#17121f;padding-right:8px}}';document.head.appendChild(style);
})();
