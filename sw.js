const CACHE = "huying-phonics-v10";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/assets/app-icon.png",
  "/assets/jungle-home-v1.jpg",
  "/assets/jungle-title-sign-v1.png",
  "/assets/flower-game-01.jpg",
  "/assets/flower-game-02.jpg",
  "/assets/flower-game-03.jpg",
  "/assets/flower-game-04.jpg",
  "/assets/flower-game-05.jpg",
  "/assets/flower-game-06.jpg",
  "/assets/game-listen.png",
  "/assets/game-match.png",
  "/assets/game-meaning.png",
  "/assets/game-spell.png",
  "/assets/game-phonics-chart.png",
  "/assets/course-ket.png",
  "/assets/course-pet.png",
];
self.addEventListener("install", (event) => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  const wordAssets = await fetch("/assets/words/manifest.json").then((response) => response.json());
  const audioManifestUrl = "/assets/audio/phonemes/manifest.json";
  const audioAssets = await fetch(audioManifestUrl).then((response) => response.json()).then((manifest) => manifest.assets.map((item) => `/assets/audio/phonemes/${item.file}`));
  await cache.addAll([...APP_SHELL, "/assets/words/manifest.json", ...wordAssets, audioManifestUrl, ...audioAssets]);
  await self.skipWaiting();
})()));
self.addEventListener("activate", (event) => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(event.request);
        await cache.put("/", response.clone());
        return response;
      } catch {
        return (await cache.match("/")) || Response.error();
      }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("/"))));
});
