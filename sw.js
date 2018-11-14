/**
* Some code from the following sources
* https://developers.google.com/web/fundamentals/primers/service-workers/
* https://developers.google.com/web/updates/2015/09/updates-to-cache-api
**/
self.importScripts('./js/idb.js');

const version = 'v4';
const cacheName = `MWS_rest3-${version}`;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => {
    return cache.addAll([
      '/', '/index.html',
      '/restaurant.html',
      '/offline.html',
      '/css/styles.css',
      '/js/idb.js',
      '/js/dbhelper.js',
      '/js/main.js',
      '/js/restaurant_info.js',
      '/js/lazysizes.min.js',
      '/img/1.jpg',
      '/img/10.jpg',
      '/img/2.jpg',
      '/img/3.jpg',
      '/img/4.jpg',
      '/img/5.jpg',
      '/img/6.jpg',
      '/img/7.jpg',
      '/img/8.jpg',
      '/img/9.jpg',
      '/img/undefined.jpg',
      '/img/android-chrome-192x192.png',
      '/img/android-chrome-256x256.png',
      '/img/favicon-16x16.png',
      '/img/favicon-32x32.png',
      'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
      'https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/0.4.0/modern-normalize.min.css',
      'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
    ])
      .then(() => self.skipWaiting());
  }));
});

self.addEventListener('activate', activateEvent => {
  activateEvent.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== cacheName) {
              return caches.delete(cacheName);
            } // end if
          }) // end map
        ); // end return Promise.all
      }) // end keys then
      .then(() => {
        return clients.claim();
      }) // end then
  ); // end waitUntil
}); // end addEventListener

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request))
      .then(response => {
        if (response) {
          return response || fetch(event.request);
        }
        // end fetch catch
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Clone the request
            const responseToCache = response.clone();
            caches.open(cacheName)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }); // end fetch.then
      }) // end .then response
      .catch(error => {
        console.log('Page not cached ' + error);
        return caches.match('/offline.html');
      }) // end .catch
  ); // end respondWith
}); // end addEventListener
