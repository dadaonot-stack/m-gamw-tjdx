/* 自己管理 オフライン用の仕組み。
   新しい版は、公開されたあとブラウザが見つけると「待機」状態になります。
   設定画面の「適用する」を押すか、アプリを完全に閉じて開き直すと切り替わります。保存データは消えません。 */
const CACHE = 'jikokanri-app-v0.3.0';
const MUST = ['./', './index.html', './manifest.webmanifest'];
const OPTIONAL = ['./icon-180.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    /* ブラウザの一時保存(古い画面が残っていることがある)を使わず、必ず公開先から取り直す */
    const fresh = u => new Request(u, { cache: 'reload' });
    await c.addAll(MUST.map(fresh));
    await Promise.all(OPTIONAL.map(f => c.add(fresh(f)).catch(() => {})));
    /* 一度だけの例外:確認用の試作(Hello World)から本体へ入れ替えるときだけ、すぐ切り替える。
       これ以降の更新は、設定の「適用する」を押したときだけ行われる。 */
    const olds = (await caches.keys()).filter(k => k.startsWith('hello-'));
    if (olds.length) self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
