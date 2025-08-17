// Service Worker for HVAC Pro Tools 3.0
const CACHE_NAME = 'hvac-pro-tools-v3.0';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('📦 HVAC Pro Tools 3.0 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker installed successfully');
                return self.skipWaiting();
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('🚀 HVAC Pro Tools 3.0 Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('📦 Serving from cache:', event.request.url);
                    return response;
                }
                
                console.log('🌐 Fetching from network:', event.request.url);
                return fetch(event.request).then((response) => {
                    // Don't cache if not a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            }).catch(() => {
                // Fallback for offline
                console.log('📱 Offline fallback for:', event.request.url);
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            })
    );
});

// Background sync for data persistence
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Placeholder for background data sync
    return Promise.resolve();
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    console.log('📨 Push notification received');
    const options = {
        body: event.data ? event.data.text() : 'HVAC Pro Tools update available',
        icon: './icon-192.png',
        badge: './icon-192.png'
    };
    
    event.waitUntil(
        self.registration.showNotification('HVAC Pro Tools', options)
    );
});

console.log('✅ HVAC Pro Tools 3.0 Service Worker loaded');