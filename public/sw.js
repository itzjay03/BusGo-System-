/* BusGo Service Worker
 * - App shell ............ pre-cached on install
 * - Static assets (JS/CSS/images) ... Cache-First
 * - API GET requests (/api/...) ..... Network-First (falls back to cache when offline)
 * - Page navigations ................ Network-First (falls back to cached shell, then offline.html)
 *
 * To force users to get a fresh cache after a big release, change VERSION.
 */
const VERSION = "v1";
const SHELL_CACHE = `busgo-shell-${VERSION}`;
const STATIC_CACHE = `busgo-static-${VERSION}`;
const API_CACHE = `busgo-api-${VERSION}`;
const ALL_CACHES = [SHELL_CACHE, STATIC_CACHE, API_CACHE];

const SHELL_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// ---------- Install: pre-cache the app shell ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(
        SHELL_FILES.map((file) =>
          cache.add(file).catch((err) => console.warn("[SW] Could not pre-cache", file, err))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ---------- Activate: remove old caches ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => !ALL_CACHES.includes(key)).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ---------- Strategies ----------
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    return Response.error();
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ message: "You are offline and no saved data is available yet." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function navigationHandler(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put("/index.html", response.clone());
    return response;
  } catch (error) {
    return (
      (await cache.match("/index.html")) ||
      (await cache.match("/")) ||
      (await cache.match("/offline.html"))
    );
  }
}

// ---------- Fetch router ----------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;          // never cache POST / PUT / DELETE

  const url = new URL(request.url);

  const isThirdParty = /google|firebase|gstatic/.test(url.hostname);
  const isApi = url.pathname.startsWith("/api/") && !isThirdParty;

  // 1. Backend API (can be on another origin, e.g. Render) -> Network-First
  if (isApi) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // 2. Other cross-origin requests (Firebase Auth, Google, etc.) -> leave to the browser
  if (url.origin !== self.location.origin) return;

  // 3. Page navigations -> Network-First with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(navigationHandler(request));
    return;
  }

  // 4. Same-origin static files -> Cache-First
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});
