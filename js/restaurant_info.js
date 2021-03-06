let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      const mykey = config.MY_KEY;

      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token=' + mykey, {
        //mapboxToken:
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error('No restaurant id in URL');
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const fav = document.getElementById('fav');
  fav.innerHTML = restaurant.is_favorite;
  fav.innerText = '❤';
  if (restaurant.is_favorite !== true) {
    fav.classList.add('false');
    fav.style.color = '#999';
    fav.setAttribute('aria-label', 'Mark as favorite');
  } else {
    fav.classList.add('true');
    fav.style.color = '#800';
    fav.setAttribute('aria-label', 'Remove from favorites');
  }
  fav.onclick = function () {
    const isFav = !restaurant.is_favorite;
    DBHelper.updateFav(restaurant.id, isFav);
    restaurant.is_favorite = !restaurant.is_favorite;
    if (restaurant.is_favorite !== true) {
      fav.classList.remove('false');
      fav.classList.add('true');
      fav.style.color = '#800';
    } else {
      fav.classList.remove('true');
      fav.classList.add('false');
      fav.style.color = '#999';
    }
  };

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.className = 'lazyload';
  const imageBase = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = imageBase + '.jpg';
  image.setAttribute('srcset', imageBase + `-300-small.jpg 300w ` + `, ` + imageBase + `-500-medium.jpg 500w`);
  image.setAttribute('data-src', imageBase + '.jpg');
  image.alt = `Photo of ` + restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fill reviews
  DBHelper.fetchReviewsById(self.restaurant.id).then(res => {
    self.reviews = res;
    fillReviewsHTML();
  });
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Add New Reviews
 */
addNewReview = () => {
  event.preventDefault();
  // Get data from form
  let restaurantId = getParameterByName('id');
  let name = document.getElementById('reviewer_name').value;
  let rating;
  let comments = document.getElementById('comment_text').value;
  rating = document.querySelector('input[name="rating"]:checked').value;
  const review = [name, rating, comments, restaurantId];

  // Add data to DOM
  const displayNewReview = {
    restaurant_id: parseInt(review[3]),
    name: review[0],
    createdAt: new Date(),
    rating: parseInt(review[1]),
    comments: review[2],
    updatedAt: Date.now()
  };

  document.addEventListener('onLoad', (event) => {
    console.log(event.type);

  });
  // if offline store the review in the db
  if (!navigator.onLine) {
  // add review to local storage then send to server after
    DBHelper.offLineReview(displayNewReview);
    createReviewHTML(displayNewReview);
    document.getElementById('add-review')
      .reset(
        alertify.error('Offline Review added to DB')
      );

  } else {
  // when online do the same thing
    DBHelper.addNewReview(displayNewReview);
    createReviewHTML(displayNewReview);
    document.getElementById('add-review')
      .reset(
        alertify.success('New review was added')
      );
  }
  document.getElementById('add-review').reset();
  displayOfflineReview(displayNewReview);
  DBHelper.fetchAndCacheReviews(displayNewReview);
};

displayOfflineReview = (review) => {
  if (document.getElementById('no-review')) {
    document.getElementById('no-review').remove();
  }
  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');

  //insert the new review at top
  ul.insertBefore(createReviewHTML(review), ul.firstChild);
  container.appendChild(ul);
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.reviews) => {

  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet. Be the first!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

  /**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = review => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.className = 'name';
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.className = 'date';
  date.innerHTML = new Date(review.createdAt).toUTCString().slice(0, 16);
  li.appendChild(date);

  const rating = document.createElement('p');//, `data-rating="${review.rating}"`);
  rating.className = 'starability-result';
  rating.setAttribute('data-rating', review.rating);
  rating.innerHTML = `Rated: ${review.rating} stars`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.className = 'comment';
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

  /**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
};

  /**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Add New Review Modal.
 */
MicroModal.init();
