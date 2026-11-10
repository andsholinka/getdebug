/* Tara Tech Arcade — service worker: cache app shell agar bisa diinstall & main offline.
   Halaman (navigasi) pakai network-first supaya update konten langsung sampai,
   aset statis pakai cache-first supaya tetap cepat dan bisa offline. */
var CACHE = "tara-arcade-v2";
var CORE = [
  "/",
  "/tangkap-bug/",
  "/jangan-typo/",
  "/manifest.webmanifest",
  "/icons/icon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(CORE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Navigasi (halaman HTML): network-first, cache sebagai cadangan offline.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Aset statis: cache-first, simpan hasil network untuk kunjungan berikut.
  event.respondWith(
    caches.match(event.request).then(function (hit) {
      if (hit) return hit;
      return fetch(event.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(event.request);
      });
    })
  );
});
