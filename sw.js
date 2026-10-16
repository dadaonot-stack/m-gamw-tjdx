/* Hello World 試作(診断つき)のオフライン用の仕組み。勝手に自動更新しないよう skipWaiting は使いません。 */
const CACHE = 'hello-v3';
const MUST = ['./', './index.html', './manifest.webmanifest'];
const OPTIONAL = ['./icon-180.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(MUST);
    await Promise.all(OPTIONAL.map(f => c.add(f).catch(() => {})));
  }));
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
