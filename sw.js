const CACHE = "forge-v11.64";
const ASSETS = [
  "./",
  "./index.html",
  "./css/base.css",
  "./css/components.css",
  "./css/views.css",
  "./css/workout.css",
  "./css/progress.css",
  "./css/camera.css",
  "./js/core.js",
  "./js/views.js",
  "./js/progress.js",
  "./js/programs.js",
  "./js/workout.js",
  "./js/camera.js",
  "./js/app.js",
  "./js/demo.js",
  "./js/icons.js",

  "./js/badges.js",
  "./js/data-exercises.js",
  "./js/data-programs.js",
  "./js/vendor/three.min.js",
  "./manifest.json"
];
self.addEventListener("install", e => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(
      r =>
        r ||
        fetch(e.request)
          .then(res => {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
            return res;
          })
          .catch(() => caches.match("./index.html"))
    )
  );
});
