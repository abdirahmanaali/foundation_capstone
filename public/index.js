document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const movieResults = document.getElementById('movie-results');
  const loader = document.getElementById('loader');


  searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    searchMovies(query);
  });

  async function searchMovies(query) {
    try {
      const response = await axios.get(`/search?q=${query}`);
      const movies = response.data;
      displayMovies(movies);
    } catch (error) {
      console.error(error);
      // Handle error case
    }
  }

  async function fetchMovieTrailers(movieId) {
    try {
      const response = await axios.get(`/movies/${movieId}/videos`);
      const trailers = response.data;
      return trailers;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function displayPopularMovies(movies) {
    const popularMoviesContainer = document.getElementById('popular-movies');
    popularMoviesContainer.innerHTML = '';

    movies.slice(0, 10).forEach(movie => {
      const movieCard = createMovieCard(movie);
      popularMoviesContainer.appendChild(movieCard);
    });

    addSliderEffect(popularMoviesContainer);
  }

  function displayTopRatedMovies(movies) {
    const topRatedMoviesContainer = document.getElementById('top-rated-movies');
    topRatedMoviesContainer.innerHTML = '';

    movies.slice(0, 10).forEach(movie => {
      const movieCard = createMovieCard(movie);
      topRatedMoviesContainer.appendChild(movieCard);
    });

    addSliderEffect(topRatedMoviesContainer);
  }

  function displayUpcomingMovies(movies) {
    const upcomingMoviesContainer = document.getElementById('upcoming-movies');
    upcomingMoviesContainer.innerHTML = '';

    movies.slice(0, 10).forEach(movie => {
      const movieCard = createMovieCard(movie);
      upcomingMoviesContainer.appendChild(movieCard);
    });

    addSliderEffect(upcomingMoviesContainer);
  }

  function addSliderEffect(container) {
    const prevButton = container.parentElement.querySelector('.prev-arrow');
    const nextButton = container.parentElement.querySelector('.next-arrow');

    prevButton.addEventListener('click', () => {
      container.scrollBy({
        left: -container.offsetWidth,
        behavior: 'smooth'
      });
    });

    nextButton.addEventListener('click', () => {
      container.scrollBy({
        left: container.offsetWidth,
        behavior: 'smooth'
      });
    });
  }

  function displayMovies(movies) {
    movieResults.innerHTML = '';

    movies.forEach(movie => {
      const movieCard = createMovieCard(movie);
      movieResults.appendChild(movieCard);

      movieCard.addEventListener('click', async () => {
        loader.classList.remove('hide'); // Show the loader

        const trailers = await fetchMovieTrailers(movie.id);

        loader.classList.add('hide'); // Hide the loader

        if (trailers.length > 0) {
          const trailerKey = trailers[0].key;
          openTrailerModal(trailerKey, movie.id);
        } else {
          // Handle case when no trailer is available
          console.log('No trailer available for this movie');
        }
      });
    });
  }


  function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const title = document.createElement('h3');
    title.textContent = movie.title;

    const posterPath = movie.poster_path;
    if (posterPath) {
      const posterUrl = `https://image.tmdb.org/t/p/w500/${posterPath}`;
      const posterImg = document.createElement('img');
      posterImg.src = posterUrl;
      movieCard.appendChild(posterImg);

      // Add click event listener to the poster image
      posterImg.addEventListener('click', async () => {
        loader.classList.remove('hide'); // Show the loader

        const trailers = await fetchMovieTrailers(movie.id);

        loader.classList.add('hide'); // Hide the loader

        if (trailers.length > 0) {
          const trailerKey = trailers[0].key;
          openTrailerModal(trailerKey, movie.id);
        } else {
          // Handle case when no trailer is available
        }
      });

      movieCard.appendChild(title);

      return movieCard;
    }

    // Add click event listener to the movie title
    title.addEventListener('click', async () => {
      loader.classList.remove('hide'); // Show the loader

      const trailers = await fetchMovieTrailers(movie.id);

      loader.classList.add('hide'); // Hide the loader

      if (trailers.length > 0) {
        const trailerKey = trailers[0].key;
        openTrailerModal(trailerKey);
      } else {
        // Handle case when no trailer is available
      }
    });

    movieCard.appendChild(title);
    return movieCard;
  }

  function deleteRating(movieId) {
    fetch(`/ratings/${movieId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          console.log(`Rating deleted for movieId: ${movieId}`);
          // Remove "active" class from all rating stars
          const ratingStars = document.querySelectorAll('.star');
          ratingStars.forEach(star => {
            star.classList.remove('active');
          });
          // Perform any additional actions after deleting the rating
        } else {
          console.error('Failed to delete rating:', response.status);
        }
      })
      .catch(error => {
        console.error('Error deleting rating:', error);
      });
  }


  function openTrailerModal(trailerKey, movieId) {
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-iframe');
    const ratingStars = modal.querySelectorAll('.star');
    const submitRatingButton = modal.querySelector('.submit-rating');
  
    // Reset the rating stars to their initial state
    ratingStars.forEach(star => {
      star.classList.remove('active');
    });
  
    iframe.src = `https://www.youtube.com/embed/${trailerKey}`;
    modal.dataset.movieId = movieId; // Store the movieId in the modal's dataset
    modal.style.display = 'block';
  
    // Load the saved rating for the movie, if available
    getSavedRating(movieId)
      .then(savedRating => {
        if (savedRating) {
          setRatingStars(savedRating);
        }
      })
      .catch(error => {
        console.error('Error retrieving saved rating', error);
      });
  }
  
  // Attach the click event listener to the submit rating button outside the openTrailerModal function
  const submitRatingButton = document.querySelector('.submit-rating');
  submitRatingButton.addEventListener('click', () => {
    const modal = document.getElementById('trailer-modal');
    const movieId = modal.dataset.movieId;
    const rating = getSelectedRating();
    saveRating(movieId, rating);
  });
  
  // Add click event listeners to the rating stars outside the openTrailerModal function
  const ratingStars = document.querySelectorAll('.star');
  ratingStars.forEach(star => {
    star.addEventListener('click', () => {
      setRatingStars(star.dataset.rating);
    });
  });
  
  // Define the click event listener for the delete rating button outside the openTrailerModal function
  function deleteRatingHandler() {
    const modal = document.getElementById('trailer-modal');
    const movieId = modal.dataset.movieId;
    deleteRating(movieId);
    alert('Rating deleted!');
  }
  
  // Add click event listener to the delete rating button outside the openTrailerModal function
  const deleteRatingButton = document.querySelector('.delete-rating');
  deleteRatingButton.addEventListener('click', deleteRatingHandler);
  



  // Function to retrieve the saved rating from the database
  async function getSavedRating(movieId) {
    if (!movieId) {
      console.error('Invalid movieId');
      return null;
    }

    try {
      const response = await axios.get(`/ratings/${movieId}`);
      const rating = response.data.rating;
      return rating || null;
    } catch (error) {
      console.error('Error retrieving rating from the database', error);
      return null;
    }
  }

  // Endpoint to save ratings
  async function saveRating(movieId, rating) {
    if (!movieId) {
      console.error('Invalid movieId');
      return;
    }

    try {
      await axios.post('/ratings', { movieId, rating });
      alert('Rating saved!');
    } catch (error) {
      console.error('Error saving rating to the database', error);
      // Handle the error response from the server
      alert('Error saving rating. Please try again.');
    }
  }



  function setRatingStars(selectedRating) {
    const ratingStars = document.querySelectorAll('.star');
    ratingStars.forEach(star => {
      star.classList.remove('active'); // Remove "active" class from all stars
      const starRating = parseInt(star.dataset.rating);
      if (starRating <= selectedRating) {
        star.classList.add('active');
      }
    });
  }

  function getSelectedRating() {
    const ratingStars = document.querySelectorAll('.star');
    for (let i = ratingStars.length - 1; i >= 0; i--) {
      if (ratingStars[i].classList.contains('active')) {
        return parseInt(ratingStars[i].dataset.rating);
      }
    }
    return 0; // If no rating is selected, return 0 or any default value
  }


  // Fetch popular movies 
  axios
    .get('/movies/popular')
    .then(response => {
      const popularMovies = response.data;
      displayPopularMovies(popularMovies);
    })
    .catch(error => {
      console.error(error);
      // Handle error case
    });

  // Fetch top-rated movies  
  axios
    .get('/movies/top_rated')
    .then(response => {
      const topRatedMovies = response.data;
      displayTopRatedMovies(topRatedMovies);
    })
    .catch(error => {
      console.error(error);
      // Handle error case
    });

  // Fetch upcoming movies  
  axios
    .get('/movies/upcoming')
    .then(response => {
      const upcomingMovies = response.data;
      displayUpcomingMovies(upcomingMovies);
    })
    .catch(error => {
      console.error(error);
      // Handle error case
    });
});

// Close modal when close button is clicked
const closeButton = document.querySelector('.close');
closeButton.addEventListener('click', () => {
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  iframe.src = ''; // Clear the iframe source
  modal.style.display = 'none';
  modal.removeAttribute('data-movie-id'); // Remove the movieId from the dataset
});