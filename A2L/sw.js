const CACHE_NAME = 'a2l-calculator-v1.0.0';
const STATIC_CACHE = 'a2l-static-v1.0.0';
const DYNAMIC_CACHE = 'a2l-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/A2L/',
  '/A2L/index.html',
  '/A2L/manifest.json',
  '/A2L/A2L_Pro_Logo.png'
  // Removed offline.html since it doesn't exist
  // Add any additional static files here if needed
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Caching static files');
      return cache.addAll(STATIC_FILES).catch((error) => {
        console.error('Service Worker: Failed to cache some files:', error);
        // Continue installation even if some files fail to cache
        return Promise.resolve();
      });
    }).then(() => {
      // Skip waiting to activate new service worker immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Take control of all open clients
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached files when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If online, serve from network and update cache
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback to main page if specific page not cached
              return caches.match('/A2L/index.html') || caches.match('/A2L/');
            });
        })
    );
    return;
  }

  // Handle other requests (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to dynamic cache
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch((error) => {
            console.warn('Service Worker: Fetch failed for:', event.request.url, error);
            // Return a basic fallback for failed requests
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle background sync (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // Handle any background synchronization tasks here
  }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/A2L/A2L_Pro_Logo.png',  // Updated to use your logo
      badge: '/A2L/A2L_Pro_Logo.png', // Updated to use your logo
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/A2L/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/A2L/')
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-data') {
    console.log('Service Worker: Periodic background sync triggered');
    // Handle periodic data updates here
  }
});

// Handle online/offline status
self.addEventListener('online', () => {
  console.log('Service Worker: Back online');
  // Sync any pending data when back online
});

self.addEventListener('offline', () => {
  console.log('Service Worker: Gone offline');
  // Handle offline state
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection:', event.reason);
});

// Utility functions
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function isCacheable(request) {
  const url = new URL(request.url);
  const isHTTPS = url.protocol === 'https:';
  const isHTTP = url.protocol === 'http:';
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  
  return (isHTTPS || (isHTTP && isLocalhost)) && request.method === 'GET';
}

// Cache management - clean up old entries
async function cleanupCache() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name !== STATIC_CACHE && name !== DYNAMIC_CACHE
  );
  
  return Promise.all(oldCaches.map(name => caches.delete(name)));
}

// Update cache strategy - check for updates
async function updateCache() {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const requests = await cache.keys();
    
    const updatePromises = requests.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      } catch (error) {
        console.warn('Failed to update cache for:', request.url);
      }
    });
    
    await Promise.all(updatePromises);
    console.log('Cache updated successfully');
  } catch (error) {
    console.error('Failed to update cache:', error);
  }
}

console.log('Service Worker: Loaded');
