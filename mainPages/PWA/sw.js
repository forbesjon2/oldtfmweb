const cacheName = `transcript.fm`;
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `/`,
        `/explore`,
        `/about`,
        `/account`
      ]).then(() => self.skipWaiting());
    })
  );
});


self.addEventListener('fetch', function(event) {
    event.respondWith(
    caches.match(event.request).then(function(response) {
    return response || fetch(event.request);
    }));
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
