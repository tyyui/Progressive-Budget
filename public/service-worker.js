const FILES_TO_CACHE = [
    "/",
    "/css/style.css",
    "/index.html",
    "/dist/index.bundle.js",
    "/dist/db.bundle.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css", 
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

const STATIC_CACHE = "budget-static-v1";
const DATA_CACHE = "data-cache-v1";

self.addEventListener("install", function (event) {
    event.waitUntil(
    caches.open(STATIC_CACHE)
    .then(cache => {
        console.log("Service worker installation successful!");
        return cache.addAll(FILES_TO_CACHE);
    })
    .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", event => {
    const currentCaches = [STATIC_CACHE, DATA_CACHE];
event.waitUntil(
    caches.keys()
    .then(cacheNames => {
    return Promise.all(
        cacheNames
        .filter(cacheNames => {
            return cacheNames.filter(
                cacheName => !currentCaches.includes(cacheName)
            );
        })
        )
    })
    .then(cachesToDelete => {
        return Promise.all(
            cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
            })
        );
        })
        .then(() => self.clients.claim())
    )
});

self.addEventListener("fetch", function(event) {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
        caches.open(DATA_CACHE).then(cache => {
            return fetch(event.request)
            .then(response => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                cache.put(event.request.url, response.clone());
                }

                return response;
            })
            .catch(err => {
                // Network request failed, try to get it from the cache.
                return cache.match(event.request);
            });
        }).catch(err => console.log(err))
        );

        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
            return response || fetch(event.request);
        });
        })
    );
    });