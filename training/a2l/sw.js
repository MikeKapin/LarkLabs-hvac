const CACHE_NAME = 'a2l-calculator-v2.0.0';
const STATIC_CACHE = 'a2l-static-v2.0.0';
const DYNAMIC_CACHE = 'a2l-dynamic-v2.0.0';
const ENHANCED_CACHE = 'a2l-enhanced-v2.0.0';

// Enhanced files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/A2L_Pro_Logo.png',
  '/chat.js',
  '/health.js',
  '/enhanced-a2l-features.js'
];

// Professional data to cache for A2L compliance
const COMPLIANCE_DATA = [
  '/data/a2l-refrigerants.json',
  '/data/csa-b52-requirements.json',
  '/data/leak-detection-standards.json'
];

// Enhanced install event - cache static files and compliance data
self.addEventListener('install', (event) => {
  console.log('A2L Service Worker: Installing enhanced version...');
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('A2L Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES).catch((error) => {
          console.error('A2L Service Worker: Failed to cache some static files:', error);
          return Promise.resolve();
        });
      }),
      // Cache compliance data for offline A2L calculations
      caches.open(ENHANCED_CACHE).then((cache) => {
        console.log('A2L Service Worker: Caching compliance data');
        return Promise.all(
          COMPLIANCE_DATA.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(() => {
              console.log('A2L Service Worker: Compliance data not available:', url);
            })
          )
        );
      })
    ]).then(() => {
      console.log('A2L Service Worker: Enhanced installation complete');
      return self.skipWaiting();
    })
  );
});

// Enhanced activate event - clean up old caches and manage enhanced cache
self.addEventListener('activate', (event) => {
  console.log('A2L Service Worker: Activating enhanced version...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE && cache !== ENHANCED_CACHE) {
            console.log('A2L Service Worker: Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('A2L Service Worker: Enhanced activation complete');
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
              return caches.match('/index.html') || caches.match('/');
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
      icon: '/A2L_Pro_Logo.png',  // Updated to use your logo
      badge: '/A2L_Pro_Logo.png', // Updated to use your logo
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
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
    clients.openWindow(event.notification.data.url || '/')
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

// Enhanced cache management for A2L compliance data
async function cleanupCache() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== ENHANCED_CACHE
  );
  
  return Promise.all(oldCaches.map(name => caches.delete(name)));
}

// A2L-specific cache management for compliance data
async function cacheComplianceData() {
  try {
    const cache = await caches.open(ENHANCED_CACHE);
    
    // Cache A2L refrigerant data for offline compliance calculations
    const a2lData = {
      'R-32': { gwp: 675, flammability: 'A2L', lfl: 0.307, safety_class: 'A2L' },
      'R-454B': { gwp: 466, flammability: 'A2L', lfl: 0.063, safety_class: 'A2L' },
      'R-454C': { gwp: 148, flammability: 'A2L', lfl: 0.070, safety_class: 'A2L' },
      'R-468A': { gwp: 299, flammability: 'A2L', lfl: 0.045, safety_class: 'A2L' }
    };
    
    const dataResponse = new Response(JSON.stringify(a2lData), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('/data/cached-a2l-data.json', dataResponse);
    console.log('A2L Service Worker: Compliance data cached for offline use');
  } catch (error) {
    console.warn('A2L Service Worker: Failed to cache compliance data:', error);
  }
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

// Initialize enhanced A2L compliance caching on service worker startup
cacheComplianceData();

console.log('A2L Service Worker: Enhanced version loaded with CSA B52 compliance support');
