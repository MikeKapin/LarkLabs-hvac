// LARK Labs Service Worker - Cache Strategy
const CACHE_NAME = 'lark-labs-v1';
const STATIC_CACHE = [
    '/',
    '/index.html',
    '/HVAC_Tools/',
    '/tssa-g3-exam-prep.html',
    '/tssa-g2-exam-prep.html',
    '/assets/css/main.css'
];

const EXTERNAL_CACHE = [
    'https://hvac-jack-5-0.vercel.app/',
    'https://codecompassapp.netlify.app/',
    'https://gas-technician-ai-tutor-new.vercel.app/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell');
                return cache.addAll(STATIC_CACHE);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then(fetchResponse => {
                        // Cache new requests for static assets
                        if (event.request.url.includes('.css') || 
                            event.request.url.includes('.js') || 
                            event.request.url.includes('.html')) {
                            const responseClone = fetchResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return fetchResponse;
                    });
            })
            .catch(() => {
                // Offline fallback
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});