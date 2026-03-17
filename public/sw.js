// Service worker disabled — nuke all caches and unregister
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll())
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});
