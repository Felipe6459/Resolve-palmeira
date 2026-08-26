(() => {
  const BASE = '/Resolve-palmeira/';

  // O index.html já possui a navegação principal do GestorPro.
  // Versões antigas da integração criavam uma segunda barra (#gpV10Nav).
  const removeLegacyNav = () => {
    const legacy = document.getElementById('gpV10Nav');
    if (legacy) legacy.remove();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', removeLegacyNav, { once: true });
  else removeLegacyNav();
  new MutationObserver(removeLegacyNav).observe(document.documentElement, { childList: true, subtree: true });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${BASE}sw.js`, { scope: BASE }).catch(err => {
        console.error('GestorPro PWA: falha ao registrar Service Worker', err);
      });
    });
  }

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
    button.id = 'gpAsaasNavButton';
    button.type = 'button';
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
          if (role === 'master' || role === 'owner' || role === 'admin') addAsaasButton();
        } catch (e) {
          console.warn('GestorPro Asaas: não foi possível verificar o perfil.', e);
        }
      }
      setTimeout(addAsaasButton, 1000);
      setTimeout(addAsaasButton, 3000);
    } catch (e) {
      console.error('GestorPro Asaas: falha ao carregar integração', e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAsaasUI, { once: true });
  else initAsaasUI();

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallButton();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const button = document.getElementById('gestorpro-install-button');
    if (button) button.remove();
  });

  function showInstallButton() {
    if (document.getElementById('gestorpro-install-button') || window.matchMedia('(display-mode: standalone)').matches) return;
    const button = document.createElement('button');
    button.id = 'gestorpro-install-button';
    button.type = 'button';
    button.textContent = '📲 Instalar GestorPro';
    Object.assign(button.style, {
      position: 'fixed', right: '16px', bottom: '16px', zIndex: '9999',
      border: '0', borderRadius: '12px', padding: '12px 16px',
      background: '#6d42e8', color: '#fff', font: '700 14px system-ui',
      boxShadow: '0 8px 24px rgba(45,25,90,.25)', cursor: 'pointer'
    });
    button.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      button.remove();
    });
    document.body.appendChild(button);
  }
})();
