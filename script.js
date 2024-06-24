const API_KEY='4b50fd6e468f284fd0466f123de95dc7'
const BASE_URL='https://api.themoviedb.org/3'
const IMG_URL='https://image.tmdb.org/t/p/original'
const searchInput =  document.getElementById("search-input") 

// Listener to call functions for certain pages
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('index.html')) {
        featured();
        getGenreContent(10764,'reality-tv','tv')
        getGenreContent(16,'animation-movie','movie')
        getTrendingAll()
        getTopRatedTv()
    } else if (window.location.pathname.endsWith('watchlist.html')) {
        displayWatchlist();
        console.log('watchlist page')
    } else if (window.location.pathname.endsWith('watch.html')){
        getTrailer()
    } else if (window.location.pathname.endsWith('get-details.html')){
        getDetails()
        console.log('on getdeatial')
    }
});


// Query URL parameters
function queryURL(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param).trim();
}


// General function to fetch data from the API
async function fetchData(url,query) {
    try{
        if (query === undefined){
            response =  await fetch(`${BASE_URL}${url}?api_key=${API_KEY}`);
        }else{
            response =  await fetch(`${BASE_URL}${url}?api_key=${API_KEY}&query=${query}`);}

        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        return data.results;
    }catch(error){
        console.log('no data found',error);
    }
}


// Display data in cards
async function displayData(results,containerId,mediaType) {
    const container = document.getElementById(containerId);
    results.forEach(item => {
        const type = item.media_type ? item.media_type : mediaType
        const id = item.id;
        const title = item.title || item.name;
        const posterPath = item.backdrop_path ? `${IMG_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750';

        
  
        const movieElement = `
        <div class="card text-bg-dark col-4 swiper-slide">
              <a href="./pages/get-details.html?type=${type}&id=${id}">
                  <img src="${posterPath}" class="card-img" alt="poster" >
                  <div class="card-img-overlay position-absolute right-0">
                      <h5 class="card-title text-wrap position-absolute bottom-0 mb-3">${title}</h5>
                  </div>
              </a>
          </div>
        `;

    container.innerHTML += movieElement;
});
}


async function getTrailer(){    
    id = queryURL('id');
    type = queryURL('type');
    const result = await fetchData(`/${type}/${id}/videos`)
    const trailer = result.find(video => video.type === 'Trailer');
    
    const iframe = `<iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1"  allowfullscreen></iframe>`

    document.getElementById('videoContainer').innerHTML = iframe
}


//Handle search input
searchInput.addEventListener('input', async (e) => {
    document.getElementById('main-body').innerHTML = ''
    document.getElementById('searchResults').innerHTML = ''
    const query = e.target.value;
    if (query === '') {
       document.getElementById('searchResults').innerHTML = ''
    }
    const result = await fetchData('/search/multi',`${query}&include_adult=false`)
    
    result.forEach(item =>{
        const id = item.id
        const title = item.title || item.name;
        const type = item.media_type;
        const poster = item.poster_path ? `${IMG_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750';

        const card = `
        <div class="col-sm-6 col-md-3 mb-4">
            <div class="card text-bg-dark">
                <a href="./pages/get-details.html?type=${type}&id=${id}">
                    <img src="${poster}" class="card-img" alt="poster">
                    <div class="card-img-overlay position-absolute right-0">
                        <h5 class="card-title text-wrap position-absolute bottom-0">${title}</h5>
                    </div>
                </a>
            </div>
        </div>
        `

        document.getElementById('searchResults').innerHTML += card
    }
    )
   
})


// Function to fetch and display genre-based content
async function getGenreContent(genreId, genreName, mediaType) {
    const results = await fetchData(`/discover/${mediaType}`, `&vote_count.gte=100&with_genres=${genreId}`);
    displayData(results, genreName, mediaType);
}


// Fetches and displays top rate tv shows
async function getTopRatedTv() {
    const result = await fetchData('/tv/top_rated');
    displayData(result,'top-rated-tv','tv');
}


// Gets the trending movies and tv shows
async function getTrendingAll() {
    const result = await fetchData('/trending/all/week');
    displayData(result,'trending-all');
}


// Fetch an display all trending to display carousel
async function featured(){
    const result = await fetchData('/trending/all/day');

    result.forEach(async (movie, index) => {
        const id = movie.id;
        const type = movie.media_type;
        const title = movie.title || movie.name ;
        const poster = movie.backdrop_path;
        const logo =  await getLogo(type,id)

        const nextSlide = index+1
    
        const carouselIndicator = `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}" ${index === 0 ? 'class="active" aria-current="true"' : null} aria-label="Slide ${nextSlide}"></button>`
        const carouselItem = `<div class="carousel-item position-relative ${index === 0 ? 'active' : null}">
                                <img src="${logo}" class="position-absolute m-2" alt="${title}-poster" style="width: 10rem; height: auto;">
                                <div class="position-absolute bottom-0 m-5 z-3">
                                    <button class="btn btn-primary btn-lg" id="watchNowButton" onclick="window.location.href = '../pages/watch.html?type=${type}&id=${id}';">Watch Now</button>
                                    <button class="btn btn-outline-primary btn-lg bg-dark" onclick="window.location.href= '../pages/get-details.html?type=${type}&id=${id}';">Details</button>
                                </div>
                                <img src="${IMG_URL}${poster}" class="d-block w-100" alt="${title}-poster">
                              </div>`
                              
        document.getElementById('indicators').innerHTML += carouselIndicator;
        document.getElementById('featured-movies').innerHTML += carouselItem;
    });
}


function updateWatchlist(action, media) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (action === 'add') {
        if (!watchlist.some(item => item.id === media.id)) {
            watchlist.push(media);
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            alert('Added to watchlist');
        } else {
            alert('Already in watchlist');
        }
    } else if (action === 'remove') {
        watchlist = watchlist.filter(item => item.id !== media.id);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert('Removed from watchlist');
    }
}


function displayWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const watchlistContainer = document.getElementById('watchlist-container');

    if (watchlistContainer) {
        watchlistContainer.innerHTML = '';

        watchlist.forEach(movie => {
            const card = `
        <div class="col-sm-6 col-md-3 mb-4">
            <div class="card text-bg-dark">
                <a href="../pages/get-details.html?type=${movie.type}&id=${movie.id}">
                    <img src="${movie.posterPath}" class="card-img" alt="poster">
                    <div class="card-img-overlay position-absolute right-0">
                        <h5 class="card-title text-wrap position-absolute bottom-0">${movie.title}</h5>
                    </div>
                </a>
            </div>
        </div>
        `
            watchlistContainer.innerHTML += card;
        });
    } else {
        console.error('Element with ID "watchlist-container" not found');
    }
}

async function getLogo(type,id){
    const response =  await fetch(`${BASE_URL}/${type}/${id}/images?include_image_language=en&api_key=${API_KEY}`);
    const data = await response.json();
    const logoPath = data.logos[0].file_path
    const logo = `${IMG_URL}${logoPath}`
    return logo

}

// Fetches episode details
async function getEpisodes(id,seasonNumber){
    const response = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`)
    const data =  await response.json();
    document.getElementById('episode-display').innerHTML = ''
    data.episodes.forEach(episode => {
       

            const title = episode.name;
            const overview = episode.overview;
            const still = episode.still_path ? `${IMG_URL}${episode.still_path}` :null;
            const runtime = episode.runtime;
            
            
            const episodes = `
                                <li class="list-group-item d-flex align-items-center">
                                <div class="col-4">
                                    <a href="#">
                                    <img src=${still} alt="" class="img-thumbnail m-2">
                                    </a>
                                </div>
                                <div class="p-4">
                                    <div class="d-flex">
                                        <p>${title}</p>
                                        <p class="position-absolute start-100">${runtime}m</p>
                                    </div>
                                    <p>${overview}</p>
                                </div>
                            </li>
                            `
            
            

            document.getElementById('episode-display').innerHTML += episodes
    })
}


async function getDetails() {
    const id = queryURL('id');
    const type = queryURL('type');

    const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
    if (!response.ok) {
        console.error('No data returned from fetchData');
        return;
    }

    const result = await response.json();

    // Assuming fetchData returns a single movie object and not an array
    const item = result;
    const title = item.title || item.name;
    const overview = item.overview || 'No overview available';
    const posterPath = item.backdrop_path ? `${IMG_URL}${item.backdrop_path}` : 'https://via.placeholder.com/500x750';
    const releaseDate = item.release_date || item.first_air_date;
    const rating = Math.round(item.vote_average * 10) / 10;
    const runtime = item.runtime || item.episode_run_time[0] || item.last_episode_to_air.runtime;
    const genres = item.genres.map(genre => genre.name).join(', ');

    // Create the details HTML
    const details = `
        <div class="col-12 col-lg-6">
            <img src="${posterPath}" class="img-fluid">
        </div>
        <div class="col-12 col-lg-6" id="details-content">
            <h1>${title}</h1>
            <p>${releaseDate} | ${runtime} mins | ${genres}</p>
            <p>${overview}</p>
            <p class="d-flex align-items-center"> 
                <span class="align-middle"><i class="bi bi-star-fill" style="color: #b159db;"></i></span>
                <span class="m-2 align-middle">${rating}/10</span>
            </p>
            <button class="btn btn-primary" id="watchNowButton" onclick="window.location.href = '../pages/watch.html?type=${type}&id=${id}';">Watch Now</button>
            <button class="btn btn-primary bg-dark d-none" id="add-to-watchlist">Add to Watchlist</button>
            <button class="btn btn-primary bg-dark d-none" id="remove-from-watchlist">Remove from Watchlist</button>
        </div>
    `;

    // Clear existing details and append new ones
    document.getElementById('details').innerHTML = details;

    // Check if the item is in the watchlist
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const isInWatchlist = watchlist.some(movie => movie.id === id);

    // Show the correct button based on watchlist status
    if (isInWatchlist) {
        document.getElementById('remove-from-watchlist').classList.remove('d-none');
    } else {
        document.getElementById('add-to-watchlist').classList.remove('d-none');
    }

    // Add to watchlist button click handler
    document.getElementById('add-to-watchlist').addEventListener('click', () => {
        updateWatchlist('add', { id, title, posterPath, type });
        document.getElementById('add-to-watchlist').classList.add('d-none');
        document.getElementById('remove-from-watchlist').classList.remove('d-none');
    });

    // Remove from watchlist button click handler
    document.getElementById('remove-from-watchlist').addEventListener('click', () => {
        updateWatchlist('remove', { id, title, posterPath, type });
        document.getElementById('remove-from-watchlist').classList.add('d-none');
        document.getElementById('add-to-watchlist').classList.remove('d-none');
    });

    if (type === 'tv'){

        const dropdown = `
        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="toggle-btn">
              Season 1
        </button>
        <ul class="dropdown-menu" id="season-links">
            <li><a class="dropdown-item active" href="#" aria-current="true" data-season="1">Season 1</a></li>
        </ul>
        <ul class="list-group list-group-numbered  list-group-flush m-3 episode-links" id="episode-display">
        
        </ul>
        `
        document.getElementById('seasons-button').innerHTML += dropdown
    
        for (let i = 2; i <= item.number_of_seasons; i++){
            document.getElementById("season-links").innerHTML +=`<li><a class="dropdown-item" aria-current="false" href="#" data-season="${i}">Season ${i}</a></li>`
        }
    
        getEpisodes(id, 1)
    
        const seasons = document.getElementById('season-links')
        seasons.addEventListener('click', (e) => {
            const seasonNumber = e.target.getAttribute('data-season');
            e.target.setAttribute('class', 'dropdown-item active')
            document.getElementById('toggle-btn').textContent= `Season ${seasonNumber}`
            getEpisodes(id, seasonNumber)
        })}
}









// Get the list Genre options for filter
async function getGenres(){
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    const data = await response.json();
    
    data.genres.forEach(genre => {
        const name = genre.name;

        const genreElement = `
        <li><a class="dropdown-item" href="../pages/genres.html">${name}</a></li>
        `;

        document.getElementById('genre-list').innerHTML += genreElement;
    });

}

//--------------------------Movies Page Codes --------------------------//
//Test Listened to call Movie page functions
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('movies.html')) {
        upcomingMovies()
        getPopularMovies()
        getTopRatedMovies()
    } else if (window.location.pathname.endsWith('watchlist.html')) {
        displayWatchlist();
        console.log('watchlist page')
    } else if (window.location.pathname.endsWith('watch.html')){
        getTrailer()
    } else if (window.location.pathname.endsWith('get-details.html')){
        getDetails()
        console.log('on getdeatial')
    }
});


async function trendingMovies(){
    const result = await fetchData('/trending/all/day');
}

//fetch and display Popular
async function getPopularMovies() {
    const result = await fetchData('/movie/popular'); 
    displayData(result,'popular-movies','film');
}

//fetch and display Top Rated Movies
async function getTopRatedMovies() {
    const result = await fetchData('/movie/top_rated'); 
    displayData(result,'top-rated-movies','film');
}

//fetch and display Upcoming Movies
async function upcomingMovies() {
    const result = await fetchData('/movie/upcoming'); 
    displayData(result,'upcoming-movies','film');
}

//--------------------------TV Shows Page Codes --------------------------//
//Test Listened to call Tv show page functions
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('tv-shows.html')) {
        airingToday()
        onTheAir()
        getPopularTv()
        getTopRatedTv()
    } else if (window.location.pathname.endsWith('watchlist.html')) {
        displayWatchlist();
        console.log('watchlist page')
    } else if (window.location.pathname.endsWith('watch.html')){
        getTrailer()
    } else if (window.location.pathname.endsWith('get-details.html')){
        getDetails()
        console.log('on getdeatial')
    }
});

//fetch and display Airing Today
async function airingToday(){
    const result = await fetchData('/tv/airing_today'); 
    displayData(result,'airing-today-tv','tv');
}

//fetch and display On The Air
async function onTheAir(){
    const result = await fetchData('/tv/on_the_air'); 
    displayData(result,'on-the-air-tv','tv');
}

//fetch and display Popular TV Shows
async function getPopularTv() {
    const result = await fetchData('/tv/popular'); 
    displayData(result,'popular-tv','tv');
}

//fetch and display Top Rated TV Shows
async function getTopRatedTv() {
    const result = await fetchData('/tv/top_rated'); 
    displayData(result,'top-rated-tv','tv');
}












