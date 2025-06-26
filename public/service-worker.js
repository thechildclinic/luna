
const CACHE_NAME = 'luna-ai-journal-cache-v2'; // Updated version for production
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.css',
  // External assets that are critical for the app
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap',
  // Icon assets (using SVG placeholders for now)
  '/icons/icon-192x192.png.svg',
  '/icons/icon-512x512.png.svg',
  '/icons/apple-touch-icon.svg'
];

// URLs for esm.sh modules used in importmap
// Note: In production build, these will be bundled, but keeping for development compatibility
const ESM_CDN_ASSETS = [
  "https://esm.sh/react@^19.1.0",
  "https://esm.sh/react@^19.1.0/",
  "https://esm.sh/react-dom@^19.1.0/",
  "https://esm.sh/@google/genai@^1.4.0"
];

const ALL_ASSETS_TO_CACHE = [...CORE_ASSETS, ...ESM_CDN_ASSETS];


self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching core assets');
        // Cache core assets individually to avoid failure if one asset is missing
        const cachePromises = ALL_ASSETS_TO_CACHE.map(assetUrl => {
          const request = new Request(assetUrl, {
            mode: assetUrl.startsWith('http') ? 'cors' : 'same-origin',
            cache: 'reload' // Ensure fresh assets during install
          });

          return cache.add(request).catch(err => {
            console.warn(`Failed to cache ${assetUrl}:`, err);
            // Don't fail the entire installation if one asset fails
            return Promise.resolve();
          });
        });

        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('Service Worker installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('Service Worker installation failed:', error);
        throw error;
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip API requests to Google's Gemini API - these should always go to network
  if (url.hostname === 'generativelanguage.googleapis.com') {
    return;
  }

  // For navigation requests (HTML), try network first, then cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If successful, cache the new version
          if (response && response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            }).catch(err => console.warn('Failed to cache navigation response:', err));
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          console.log('Network failed for navigation, trying cache');
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For static assets, use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, fetch from network
        return fetch(request).then((networkResponse) => {
          // Only cache successful GET responses
          if (networkResponse && networkResponse.ok && networkResponse.status === 200) {
            // Don't cache if it's a redirect or error
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              })
              .catch(err => console.warn('Failed to cache resource:', request.url, err));
          }
          return networkResponse;
        }).catch(error => {
          console.warn('Fetch failed for:', request.url, error);
          // For critical assets, you might want to return a fallback
          return new Response('Network error', {
            status: 408,
            statusText: 'Network timeout'
          });
        });
      })
  );
});
