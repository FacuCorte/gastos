// Guarda la pantalla en el celu para que abra al instante. Los datos (Apps Script) siempre van por red.
// Al cambiar cualquier archivo de la app, subí este número para que el celu baje la versión nueva.
const VERSION = 'v4';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Primero lo guardado (abre al instante); en segundo plano se actualiza para la próxima vez.
  e.respondWith(caches.open(VERSION).then(c => c.match(e.request, { ignoreSearch: true }).then(guardado => {
    const red = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
    if (guardado) { e.waitUntil(red.catch(() => {})); return guardado; }
    return red;
  })));
});
