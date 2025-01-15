const CACHE_NAME = import.meta.env.VITE_APP_NAME;

self.addEventListener('install', (event) => {
    console.info('Service Worker installing');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.info('Service Worker activating');
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    if (
        !event.request.url.match(new RegExp(import.meta.env.VITE_CDN_DOMAIN)) &&
        event.request.url.match(/\.(jpe?g|png|gif|webp|svg|otf|json|svg|mp4)$/i)
    ) {
        event.respondWith(handleOtherRequests(event.request));
    } else {
        return;
    }
});

async function handleOtherRequests(request: Request) {
    const cache = await caches.open(CACHE_NAME);

    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        if (import.meta.env.MODE !== 'production')
            console.info('[CHECK]: Serving_From_Cache', request.url);
        return cachedResponse;
    }

    if (import.meta.env.MODE !== 'production')
        console.info('[CHECK]: Cache_Miss! Fetching_From_Network', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.status === 200)
        cache.put(request, networkResponse.clone());

    return networkResponse;
}
