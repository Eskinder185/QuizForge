const CACHE = "factforge-v1";
const ASSETS = [
  "/factforge/",
  "/factforge/index.html",
  "/factforge/404.html",
  "/factforge/icon.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
