const CACHE_PREFIX = 'riichi-';
const CACHE_NAME = `${CACHE_PREFIX}${self.CACHE_VERSION}`;

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  const requests = self.PRECACHE_URLS.map(
    (url) => new Request(url, { cache: 'reload' }),
  );

  await cache.addAll(requests);
}

async function deleteOldCaches() {
  const cacheNames = await caches.keys();
  const oldCacheNames = cacheNames.filter(
    (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
  );

  await Promise.all(oldCacheNames.map((name) => caches.delete(name)));
}

async function getResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });

  return cached ?? fetch(request);
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
  const { origin } = new URL(event.request.url);

  if (event.request.method === 'GET' && origin === self.location.origin) {
    event.respondWith(getResponse(event.request));
  }
});
