// sw.js
const CACHE_NAME = 'petabicara-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/scripts/styles/add-story.css',
  '/src/scripts/styles/auth.css',
  '/src/scripts/styles/components.css',
  '/src/scripts/styles/home.css',
  '/src/scripts/styles/main.css',
  '/src/scripts/styles/view-transitions.css',
  '/src/scripts/utils/router.js',
  '/src/scripts/utils/camera-helper.js',
  '/src/scripts/api/api-service.js',
  '/src/scripts/model/story-model.js',
  // JavaScript files
  '/src/scripts/app.js',
  '/src/scripts/view/app-view.js',
  '/src/scripts/view/pages/add-story-view.js',
  '/src/scripts/view/pages/home-view.js',
  '/src/scripts/view/pages/map-view.js',
  '/src/scripts/view/pages/login-view.js',
  '/src/scripts/view/pages/register-view.js',
  '/src/scripts/presenter/app-presenter.js',
  '/src/scripts/presenter/pages/add-story-presenter.js',
  '/src/scripts/presenter/pages/home-presenter.js',
  '/src/scripts/presenter/pages/map-presenter.js',
  '/src/scripts/presenter/pages/login-presenter.js',
  '/src/scripts/presenter/pages/register-presenter.js',
  // External resources
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Playfair+Display:wght@700&display=swap'
];

// Install event - cache basic resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service Worker: Clearing old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Strategy: Cache First, then Network
self.addEventListener('fetch', event => {
  // Skip for API calls and navigation requests - we'll handle API calls with IndexedDB
  if (event.request.url.includes('story-api.dicoding.dev') || 
      (event.request.mode === 'navigate' && !event.request.url.endsWith('.css') && !event.request.url.endsWith('.js'))) {
    return;
  }

  console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('Service Worker: Found in cache', event.request.url);
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('Service Worker: Cached new resource', event.request.url);
              });

            return response;
          }
        );
      })
  );
});

// Push Event Handler
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');

  let body;
  if (event.data) {
    body = event.data.text();
  } else {
    body = 'Ada cerita baru di PetaBicara!';
  }

  const options = {
    body: body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat Cerita',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PetaBicara', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click received', event.notification);
  
  event.notification.close();

  if (event.action === 'close') {
    console.log('Notification dismissed');
    return;
  }

  // Open the app and navigate to home page
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(clientList => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});