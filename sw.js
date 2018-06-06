const version = 'v1'
const cacheName = `MWS_rest1-${version}`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
       '/',
       '/restaurant.html',
       '/css/styles.css',
       '/js/idb.js',
       '/js/dbhelper.js',
       '/js/main.js',
       '/js/restaurant_info.js',
       '/data/restaurants.json',
       '/img/1-300-small.jpg',
       '/img/1-500-medium.jpg',
       '/img/1.jpg',
       '/img/10-300-small.jpg',
       '/img/10-500-medium.jpg',
       '/img/10.jpg',
       '/img/2-300-small.jpg',
       '/img/2-500-medium.jpg',
       '/img/2.jpg',
       '/img/3-300-small.jpg',
       '/img/3-500-medium.jpg',
       '/img/3.jpg',
       '/img/4-300-small.jpg',
       '/img/4-500-medium.jpg',
       '/img/4.jpg',
       '/img/5-300-small.jpg',
       '/img/5-500-medium.jpg',
       '/img/5.jpg',
       '/img/6-300-small.jpg',
       '/img/6-500-medium.jpg',
       '/img/6.jpg',
       '/img/7-300-small.jpg',
       '/img/7-500-medium.jpg',
       '/img/7.jpg',
       '/img/8-300-small.jpg',
       '/img/8-500-medium.jpg',
       '/img/8.jpg',
       '/img/9-300-small.jpg',
       '/img/9-500-medium.jpg',
       '/img/9.jpg',
       '/img/android-chrome-192x192.png',
       '/img/android-chrome-256x256.png',
       '/img/favicon-16x16.png',
       '/img/favicon-32x32.png'
     ]);
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [cacheName];
    //  Delete previous caches
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(keyList.map(key => {
          if (cacheWhitelist.indexOf(`${version}`) === -1) {
            return caches.delete(key);
          }
        }));
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
      if (response) {
      return response; // || fetch(event.request);
    }
    const fetchRequest = event.request.clone();

    return fetch(fetchRequest).then(
      function(response) {
        // Check if we received a valid response
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
    const responseToCache = response.clone();
    caches.open(cacheName)
      .then(cache => {
        cache.put(event.request, responseToCache);
      });

    return response;
          }
        );
      })
    );
});
