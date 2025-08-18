const CACHE_NAME = 'hvac-tool-vault-v1.0.1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-72x72.png',
  './icon-96x96.png',
  './icon-128x128.png',
  './icon-144x144.png',
  './icon-152x152.png',
  './icon-192x192.png',
  './icon-384x384.png',
  './icon-512x512.png',
  '../../assets/images/logo-square.png',
  // Add other critical assets here
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('HVAC Tool Vault: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('HVAC Tool Vault: Cache installation failed:', error);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // If both cache and network fail, return offline page
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
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
            console.log('HVAC Tool Vault: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for posting tools when back online
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-post-tool') {
    event.waitUntil(syncPendingPosts());
  }
});

async function syncPendingPosts() {
  try {
    // Get pending posts from IndexedDB
    const pendingPosts = await getPendingPosts();
    
    for (const post of pendingPosts) {
      try {
        // In production, sync with backend API
        await fetch('/api/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post.data)
        });
        
        // Remove from pending posts
        await removePendingPost(post.id);
        console.log('HVAC Tool Vault: Synced pending post:', post.id);
      } catch (error) {
        console.error('HVAC Tool Vault: Failed to sync post:', post.id, error);
      }
    }
  } catch (error) {
    console.error('HVAC Tool Vault: Background sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingPosts() {
  // In production, implement IndexedDB operations
  return [];
}

async function removePendingPost(id) {
  // In production, implement IndexedDB operations
  console.log('Removing pending post:', id);
}

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: './icon-192x192.png',
      badge: './icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('./index.html?notification=' + event.notification.data.id)
    );
  }
});