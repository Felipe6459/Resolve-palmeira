/* GestorPro — Backup V8
   Exporta e importa os dados do armazenamento local sem depender do Supabase. */
(function(){
 const keys=['db','state','data','clients','clientes','servers','servidores','expenses','despesas'];
 function source(){return window.db||window.state||window.data||null}
 window.gpBackupExport=function(){
  const payload={version:8,createdAt:new Date().toISOString(),data:{}};
  keys.forEach(k=>{try{const v=localStorage.getItem(k);if(v!==null)payload.data[k]=JSON.parse(v)}catch{const v=localStorage.getItem(k);if(v!==null)payload.data[k]=v}});
  if(!Object.keys(payload.data).length&&source())payload.data.app=source();
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='gestorpro-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);
 };
 window.gpBackupImport=function(){
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{const f=input.files?.[0];if(!f)return;try{const p=JSON.parse(await f.text());if(!p||typeof p!=='object'||!p.data)throw new Error('Formato inválido');if(!confirm('Importar este backup substituirá os dados locais correspondentes. Continuar?'))return;Object.entries(p.data).forEach(([k,v])=>localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v)));alert('Backup importado. Recarregue o GestorPro para aplicar os dados.');location.reload()}catch(e){alert('Não foi possível importar o backup: '+e.message)}};input.click();
 };
 window.gpBackupInfo=function(){alert('Backup GestorPro: exporte seus dados antes de mudanças importantes e guarde o arquivo em local seguro. A restauração substitui os dados locais correspondentes.')};
 const style=document.createElement('style');style.textContent='.gp-backup-actions{display:flex;gap:8px;flex-wrap:wrap}.gp-backup-actions .btn{min-width:150px}';document.head.appendChild(style);
})();
