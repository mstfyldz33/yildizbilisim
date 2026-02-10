// Service Worker for PWA
const CACHE_NAME = 'yildizbilisim-v1'
const RUNTIME_CACHE = 'yildizbilisim-runtime'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/favicon.ico',
  '/favicon.svg'
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
          })
          .map((cacheName) => {
            return caches.delete(cacheName)
          })
      )
    })
    .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache the response
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // If network fails, return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html')
            }
          })
      })
  )
})

// Background sync for offline form submissions (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms())
  }
})

async function syncForms() {
  // This would sync any pending form submissions when back online
  // Implementation depends on your needs
}

