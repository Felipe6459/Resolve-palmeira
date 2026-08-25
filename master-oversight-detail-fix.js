/* GestorPro — correção da abertura da ficha do cliente */
(function(){
 document.addEventListener('click',function(e){
  const btn=e.target.closest?.('[data-client-json]');
  if(!btn)return;
  e.preventDefault();e.stopImmediatePropagation();
  try{
   const data=JSON.parse(decodeURIComponent(btn.dataset.clientJson||'{}'));
   let old=document.getElementById('gpoDetailFix');if(old)old.remove();
   const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
   const d=document.createElement('div');d.id='gpoDetailFix';d.innerHTML='<div style="position:fixed;inset:0;z-index:1000005;background:#0008;display:grid;place-items:center;padding:16px"><div style="width:min(760px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:16px;font-family:Inter,system-ui"><div style="display:flex;justify-content:space-between;align-items:center;padding:16px;background:#17121f;color:#fff"><b>Ficha do cliente</b><button id="gpoFixClose" style="background:none;border:0;color:#fff;font-size:26px">×</button></div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:16px">'+Object.entries(data).map(([k,v])=>'<div style="padding:11px;background:#f7f5fb;border-radius:10px;overflow-wrap:anywhere"><small style="display:block;color:#777;font-size:10px">'+esc(k)+'</small><b style="display:block;margin-top:4px;font-size:12px">'+esc(typeof v==='object'?JSON.stringify(v):v)+'</b></div>').join('')+'</div></div></div>';
   document.body.appendChild(d);d.querySelector('#gpoFixClose').onclick=()=>d.remove();
  }catch(err){console.error('[GestorPro] ficha master',err)}
 },true);
})();