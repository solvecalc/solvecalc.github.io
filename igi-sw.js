/* Project I.G.I. needs a cross-origin-isolated page, and GitHub Pages cannot send the isolation headers.
   This worker adds them to ONE navigation of the home page: the I.G.I. card arms it (message), the next
   load of "/" comes back with COOP/COEP, and the flag is cleared. Every other page is untouched. */
var FLAG = 'igi-armed';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('message', function (e) {
  if (!e.data || e.data.igi !== 'arm') return;
  var port = e.ports && e.ports[0];
  e.waitUntil(caches.open(FLAG).then(function (c) { return c.put('/armed', new Response(String(Date.now()))); })
    .then(function () { if (port) port.postMessage('ok'); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.mode !== 'navigate') return;
  var u = new URL(req.url);
  if (u.origin !== self.location.origin || u.pathname !== '/') return;
  e.respondWith((async function () {
    var cache = await caches.open(FLAG);
    var flag = await cache.match('/armed');
    if (!flag) return fetch(req);
    await cache.delete('/armed');
    if (Date.now() - Number(await flag.text()) > 60000) return fetch(req);
    var r = await fetch(req);
    var h = new Headers(r.headers);
    h.set('Cross-Origin-Opener-Policy', 'same-origin');
    h.set('Cross-Origin-Embedder-Policy', 'credentialless');
    h.set('Cache-Control', 'no-store');
    return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
  })());
});
