/*
* Some code from 'Going Offline' by Jeremy Keith - https://amzn.to/2LzSo78
*/

const version = 'V1.3';
const staticCacheName = version + 'staticfiles';
const reviewsCacheName = 'reviews';

const cacheList = [
  staticCacheName,
  reviewsCacheName
];

addEventListener('install', installEvent => {
  skipWaiting();
  installEvent.waitUntil(
    caches.open(staticCacheName)
      .then(staticCache => {
        return staticCache.addAll([
          '/', '/index.html',
          '/restaurant.html',
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
          '/favicon.ico',
          'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
          'https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/0.4.0/modern-normalize.min.css',
          'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
        ]); // end return addAll
      }) // end open then
  ); // end waitUntil
}); // end addEventListener

addEventListener('fetch', fetchEvent => {
  const request = fetchEvent.request;
  // When the user requests an HTML file
  if (request.headers.get('Accept').includes('text/html')) {
    fetchEvent.respondWith(
    // Fetch that page from the network
      fetch(request)
        .catch(error => {
          console.log('Page not Cached: ' + error);
          // Otherwise show the fallback page
          return caches.match('/offline.html');
        }) // end fetch catch
    ); // end respondWith
    return; // Go no further
  } // end if
  // When the user requests an image
  /*if (request.headers.get('Accept').
    includes('image')) {
    fetchEvent.respondWith(
    // Look for a cached version of the image
      caches.match(request)
        .then(responseFromCache => {
          if (responseFromCache) {
            return responseFromCache;
          } // end if
          // Otherwise fetch the image from the network
          return fetch(request)
            .then(responseFromFetch => {
              // Put a copy in the cache
              const copy = responseFromFetch.clone();
              fetchEvent.waitUntil(
                caches.open(imageCacheName)
                  .then(imageCache => {
                    return imageCache.put(request, copy);
                  }) // end open then
              ); // end waitUntil
              return responseFromFetch;
            }); // end fetch then and return
        }) // end match then
    ); // end respondWith
    return; // Go no further
  } // end if */
  // For everything else...
  fetchEvent.respondWith(
  // Look for a cached version of the file
    caches.match(request)
      .then(responseFromCache => {
        if (responseFromCache) {
          return responseFromCache;
        } // end if
        // Otherwise fetch the file from the network
        return fetch(request);
      }) // end match then
  ); // end respondWith
}); // end addEventListener
