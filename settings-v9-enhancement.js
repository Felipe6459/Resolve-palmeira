/* GestorPro — Configurações V9
   Preferências locais, usuários/perfis e proteção de ações administrativas. */
(function(){
 const KEY='gestorpro_settings_v9';
 const defaults={companyName:'GestorPro',theme:'dark',currency:'BRL',notifications:true,confirmDelete:true,whatsappTemplate:'Olá {nome}, sua assinatura vence em {vencimento}.',adminName:'Administrador'};
 function get(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}}
 function save(v){localStorage.setItem(KEY,JSON.stringify(v));return v}
 window.gpSettingsGet=get;window.gpSettingsSave=save;
 window.gpSettings=function(){
  let m=document.getElementById('gpSettingsV9');if(!m){m=document.createElement('div');m.id='gpSettingsV9';m.className='modal';document.body.appendChild(m)}
  const s=get();
  m.innerHTML='<div class="box gp-set-box"><div class="modalhead"><h2>⚙️ Configurações · GestorPro</h2><button class="btn" onclick="this.closest(\'.modal\').classList.remove(\'open\')">✕</button></div><label>Nome do sistema<input id="gpSetName" value="'+s.companyName+'"></label><label>Administrador<input id="gpSetAdmin" value="'+s.adminName+'"></label><label>Mensagem padrão de cobrança<textarea id="gpSetMsg">'+s.whatsappTemplate+'</textarea></label><label class="gp-check"><input id="gpSetNotif" type="checkbox" '+(s.notifications?'checked':'')+'> Ativar lembretes de cobrança</label><label class="gp-check"><input id="gpSetDelete" type="checkbox" '+(s.confirmDelete?'checked':'')+'> Pedir confirmação antes de excluir</label><div class="foot"><button class="btn" onclick="this.closest(\'.modal\').classList.remove(\'open\')">Cancelar</button><button class="btn primary" onclick="gpSettingsSave({...gpSettingsGet(),companyName:document.getElementById(\'gpSetName\').value,adminName:document.getElementById(\'gpSetAdmin\').value,whatsappTemplate:document.getElementById(\'gpSetMsg\').value,notifications:document.getElementById(\'gpSetNotif\').checked,confirmDelete:document.getElementById(\'gpSetDelete\').checked});alert(\'Configurações salvas.\');this.closest(\'.modal\').classList.remove(\'open\')">Salvar</button></div></div>';m.classList.add('open');
 };
 const style=document.createElement('style');style.textContent='.gp-set-box{width:min(620px,100%)}.gp-set-box label{display:block;margin:12px 0;font-size:13px;font-weight:700;color:#625b70}.gp-set-box input:not([type=checkbox]),.gp-set-box textarea{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:11px;border:1px solid #ddd5e8;border-radius:10px;background:#fff;color:#28222f}.gp-set-box textarea{min-height:90px;resize:vertical}.gp-check{display:flex!important;gap:8px;align-items:center}.gp-check input{width:auto!important;margin:0!important}.gp-set-box .foot{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}';document.head.appendChild(style);
})();
