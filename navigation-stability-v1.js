/* GestorPro — navegação: não injeta barra nem botões */
(function(){
 function cleanup(){
  document.querySelectorAll('#gpStableTopNav,#gpStableLogout,#gpStableSideLogout,#gpPermBtn').forEach(x=>x.remove());
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup);else cleanup();
})();
