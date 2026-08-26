(() => {
  const BASE = '/Resolve-palmeira/';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${BASE}sw.js`, { scope: BASE }).catch(err => console.error('GestorPro PWA:', err));
    });
  }

  const loadScript = (src, id) => new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) return resolve();
    const s = document.createElement('script');
    if (id) s.id = id;
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const loadAsaas = () => new Promise((resolve, reject) => {
    if (window.gpAsaasSettings) return resolve();
    const s = document.createElement('script');
    s.src = `${BASE}asaas-payments-v1.js?v=fix2`;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  function addAsaasButton() {
    if (!window.gpAsaasSettings) return;
    const nav = document.querySelector('.nav');
    if (!nav || document.getElementById('gpAsaasNavButton')) return;
    const button = document.createElement('button');
    button.id = 'gpAsaasNavButton'; button.type = 'button';
    button.innerHTML = '💳 <span>Asaas</span>';
    button.title = 'Configurar pagamentos Asaas';
    button.onclick = () => window.gpAsaasSettings();
    const settings = Array.from(nav.querySelectorAll('button')).find(b => /Configurações/i.test(b.textContent));
    if (settings) nav.insertBefore(button, settings); else nav.appendChild(button);
  }

  async function initAsaasUI() {
    try {
      await loadAsaas();
      if (window.GestorProSupabase) {
        try {
          const org = await window.GestorProSupabase.organization();
          const role = String(org?.role || '').toLowerCase();
          if (['master','owner','admin'].includes(role)) addAsaasButton();
        } catch (e) { console.warn('GestorPro Asaas: perfil não verificado.', e); }
      }
      setTimeout(addAsaasButton, 1000);
      setTimeout(addAsaasButton, 3000);
    } catch (e) { console.error('GestorPro Asaas:', e); }
  }

  async function initPlanManager() {
    try { await loadScript(`${BASE}gestorpro-plan-manager-v1.js?v=1`, 'gestorpro-plan-manager'); }
    catch (e) { console.error('GestorPro Plan Manager:', e); }
  }

  function boot() {
    initAsaasUI();
    initPlanManager();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt = event; showInstallButton(); });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; document.getElementById('gestorpro-install-button')?.remove(); });
  function showInstallButton() {
    if (document.getElementById('gestorpro-install-button') || window.matchMedia('(display-mode: standalone)').matches) return;
    const button = document.createElement('button');
    button.id = 'gestorpro-install-button'; button.type = 'button'; button.textContent = '📲 Instalar GestorPro';
    Object.assign(button.style, {position:'fixed',right:'16px',bottom:'16px',zIndex:'9999',border:'0',borderRadius:'12px',padding:'12px 16px',background:'#6d42e8',color:'#fff',font:'700 14px system-ui',boxShadow:'0 8px 24px rgba(45,25,90,.25)',cursor:'pointer'});
    button.addEventListener('click', async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; button.remove(); });
    document.body.appendChild(button);
  }
})();
