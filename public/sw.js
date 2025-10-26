// Service Worker for The Living Red List Globe
// Version 1.2.0

const CACHE_NAME = 'red-list-globe-v1.2.0';
const RUNTIME_CACHE = 'red-list-globe-runtime';

// Resources to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/globe.js',
  '/src/data.js',
  '/src/ui.js',
  '/src/i18n.js',
  '/src/simulation.js',
  '/src/styles/main.css',
  '/manifest.json',
  // Add Three.js and other essential libraries
  'https://unpkg.com/three@0.158.0/build/three.module.js'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Different strategies for different types of requests
  if (url.origin === location.origin) {
    // Same-origin requests - cache first, then network
    event.respondWith(cacheFirst(request));
  } else {
    // Cross-origin requests (CDN, APIs) - network first, then cache
    event.respondWith(networkFirst(request));
  }
});

// Cache-first strategy (for app shell)
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Serving from cache:', request.url);
    return cached;
  }

  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);

    // Return offline page if available
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    // Return basic offline response
    return new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Network-first strategy (for dynamic content and APIs)
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    console.log('[SW] Caching additional URLs:', event.data.urls);
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(event.data.urls);
    });
  }
});

// Background sync (if supported)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Sync any cached data when connection is restored
    console.log('[SW] Syncing data...');
    // Add your sync logic here
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    return Promise.reject(error);
  }
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Red List Globe Update';
  const options = {
    body: data.body || 'New information available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const url = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log('[SW] Service Worker loaded');
