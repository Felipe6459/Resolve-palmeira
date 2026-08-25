(() => {
  const BASE = '/Resolve-palmeira/';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${BASE}sw.js`, { scope: BASE }).catch(err => {
        console.error('GestorPro PWA: falha ao registrar Service Worker', err);
      });
    });
  }

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
