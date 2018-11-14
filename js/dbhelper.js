/**
 * Common database helper functions.
 */
/**
 * Start a new idb database
 */
function openDatabase() {
  if (!('indexedDB' in window)) {
    return null;
  }
  return idb.open('restaurants_db', 3, function (upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});

      case 1: 
        const reviews = upgradeDb.createObjectStore('reviews', {keyPath: 'id', autoIncrement: true});
        reviews.createIndex('restaurant', 'restaurant_id');
    }
  });
}

const dbPromise = openDatabase();


class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static DATABASE_URL(id) {
    const port = 1337; // Change this to your server port
    if (!id) {
      return `http://localhost:${port}/restaurants`;
    } else {
      return `http://localhost:${port}/restaurants/${id}`;
    }
  }

  static DB_REVIEWS_URL() {
    const Port = 1337; // Change this to your server port
    return `http://localhost:${Port}/reviews/`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    // Get restaurants from IndexedDB
    dbPromise.then(db => {
      const tx = db.transaction('restaurants');
      const res = tx.objectStore('restaurants');
      return res.getAll();
    }).then(restaurants => {
      // if we have restaurants in IndexedDb, we return them
      if (restaurants.length !== 0) {
        callback(null, restaurants);
      } else {
        // If not we fetch from the server
        fetch(DBHelper.DATABASE_URL())
          .then(response => {
            return response.json();
          })
          .then(restaurants => {
            // Once fetched we add them into IndexedDB
            dbPromise.then(db => {
              const tx = db.transaction('restaurants', 'readwrite');
              const res = tx.objectStore('restaurants');
              for (const restData of restaurants) {
                res.put(restData);
              }
              callback(null, restaurants);
              return tx.complete;
            }).then(function () {
              // success message
              console.log('Restaurants added');
            }).catch(error => {
              // message being returned if failing to add restaurants to Db
              console.log(error);
            });
          });
      }
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type === cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood === neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine !== 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type === cuisine);
        }
        if (neighborhood !== 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood === neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) === i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) === i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Fetch and cache all reviews with error handling.
   */
  static fetchAndCacheReviews() {
    // Fetch reviews from the server
    fetch(DBHelper.DB_REVIEWS_URL())
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return;
        }
      })
      .then(res => {
        // Once fetched we add them to IndexedDB
        dbPromise.then(db => {
          let tx = db.transaction('reviews', 'readwrite');
          if (res && res.length > 0) {
            res.forEach(review => {
              tx.objectStore('reviews').put(review);
            });
          }
          return tx.complete;
        }).then(function () {
          // success message
          console.log('All Reviews added');
          // error returned if failing to add reviews to IDb
        }).catch(error => console.log(error));
      });
  }

  /**
   * Fetch reviews by its ID.
   */
  static fetchReviewsById(id) {
    return dbPromise.then(db => {
      const index = db.transaction('reviews', 'readwrite')
        .objectStore('reviews').index('restaurant');
      return index.getAll(id).then(reviews => {
        return reviews.reverse();
      });
    });
  }

  // add new review to the page
  static addNewReview(review) {
    console.log('this is what is sent to the addReview:', review);


    fetch('http://localhost:1337/reviews/', {
      method: 'POST',
      mode: 'cors',
      headers: new Headers ({'Content-Type': 'application/json; charset=utf-8'}),
      body: JSON.stringify(review)
    }).then((response) => {

      console.log(response, 'after being sent to the server');

      dbPromise.then(db => {
        const tx = db.transaction('reviews', 'readwrite');
        const revStore = tx.objectStore('reviews');

        // loop thru each review and add to the cache
        revStore.put(review);
        return tx.complete;
      });
    });

  }

  static offLineReview(review) {
    localStorage.setItem('review', JSON.stringify(review));

    window.addEventListener('online', event => {
      alertify.success('CONNECTION RESTORED');
      DBHelper.addNewReview(review);
      localStorage.removeItem('review');
    });
  }

  /**
   * Update Favorites
   */
  static updateFav(Id, isFav) {
    fetch(`http://localhost:1337/restaurants/${Id}/?is_favorite=${isFav}`, {
      method: 'PUT'
    }).then(() => {
      console.log('Favorite changed');
      dbPromise.then(db => {
        const tx = db.transaction('restaurants', 'readwrite');
        const restaurantStore = tx.objectStore('restaurants');
        restaurantStore.get(Id)
          .then(restaurant => {
            restaurant.is_favorite = isFav;
            restaurantStore.put(restaurant);
          });
      });
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, newMap) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      });
    marker.addTo(newMap);
    return marker;
  }
}
