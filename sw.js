// sw.js
const BASE_URL = '/Submission-Web-Intermediate-Dicoding/';
const CACHE_NAME = 'petabicara-cache-v1';
const urlsToCache = [
  BASE_URL,
  BASE_URL + 'index.html',
  BASE_URL + 'src/scripts/styles/add-story.css',
  BASE_URL + 'src/scripts/styles/auth.css',
  BASE_URL + 'src/scripts/styles/components.css',
  BASE_URL + 'src/scripts/styles/home.css',
  BASE_URL + 'src/scripts/styles/main.css',
  BASE_URL + 'src/scripts/styles/view-transitions.css',
  BASE_URL + 'src/scripts/utils/router.js',
  BASE_URL + 'src/scripts/utils/camera-helper.js',
  BASE_URL + 'src/scripts/api/api-service.js',
  BASE_URL + 'src/scripts/model/story-model.js',
  // JavaScript files
  BASE_URL + 'src/scripts/app.js',
  BASE_URL + 'src/scripts/view/app-view.js',
  BASE_URL + 'src/scripts/view/pages/add-story-view.js',
  BASE_URL + 'src/scripts/view/pages/home-view.js',
  BASE_URL + 'src/scripts/view/pages/map-view.js',
  BASE_URL + 'src/scripts/view/pages/login-view.js',
  BASE_URL + 'src/scripts/view/pages/register-view.js',
  BASE_URL + 'src/scripts/presenter/app-presenter.js',
  BASE_URL + 'src/scripts/presenter/pages/add-story-presenter.js',
  BASE_URL + 'src/scripts/presenter/pages/home-presenter.js',
  BASE_URL + 'src/scripts/presenter/pages/map-presenter.js',
  BASE_URL + 'src/scripts/presenter/pages/login-presenter.js',
  BASE_URL + 'src/scripts/presenter/pages/register-presenter.js',
  // PWA assets
  BASE_URL + 'manifest.json',
  BASE_URL + 'icons/icon-72x72.png',
  BASE_URL + 'icons/icon-96x96.png',
  BASE_URL + 'icons/icon-128x128.png',
  BASE_URL + 'icons/icon-144x144.png',
  BASE_URL + 'icons/icon-152x152.png',
  BASE_URL + 'icons/icon-192x192.png',
  BASE_URL + 'icons/icon-384x384.png',
  BASE_URL + 'icons/icon-512x512.png',
  BASE_URL + 'icons/maskable_icon.png',
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
    icon: BASE_URL + 'icons/icon-192x192.png',
    badge: BASE_URL + 'icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat Cerita',
        icon: BASE_URL + 'icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: BASE_URL + 'icons/xmark.png'
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
        if (client.url.includes(BASE_URL) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(BASE_URL);
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