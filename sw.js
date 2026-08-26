const CACHE_NAME = 'gestorpro-v3';
const BASE = '/Resolve-palmeira/';
const APP_SHELL = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.json`
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('gestorpro-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca coloque Supabase, APIs ou outros hosts externos no cache do PWA.
  if (url.origin !== self.location.origin) return;

  // O Service Worker só controla o aplicativo dentro do próprio diretório.
  if (!url.pathname.startsWith(BASE)) return;

  // Para navegação, tenta a rede primeiro e usa o shell somente se estiver offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(`${BASE}index.html`))
    );
    return;
  }

  // Recursos estáticos: rede primeiro; cache como fallback offline.
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
