document.addEventListener('DOMContentLoaded', () => {
  // Get references to the elements
  const trendingDayButton = document.getElementById('trending-day-button');
  const trendingWeekButton = document.getElementById('trending-week-button');
  const movieResults = document.getElementById('movie-results');

  // Add click event listeners to the buttons
  trendingDayButton.addEventListener('click', () => {
    getTrendingMovies('day');
  });

  trendingWeekButton.addEventListener('click', () => {
    getTrendingMovies('week');
  });

  // Fetch trending movies based on time window
  async function getTrendingMovies(timeWindow) {
    try {
      const response = await axios.get(`/movies/trending/${timeWindow}`);
      const movies = response.data;
      displayMovies(movies);
    } catch (error) {
      console.error(error);
      // Handle error case
    }
  }

  // Fetch movie trailers based on movie ID
  async function fetchMovieTrailers(movieId) {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=e7f6ff04c0fa82d6b0f1f3f6c26e8e63`
      );
      const trailers = response.data.results;
      return trailers;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  // Display movies in the DOM
  function displayMovies(movies) {
    movieResults.innerHTML = '';
    movies.forEach(movie => {
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
      }

      movieCard.appendChild(title);
      movieResults.appendChild(movieCard);

      // Add click event listener to each movie card
      movieCard.addEventListener('click', async () => {
        const trailers = await fetchMovieTrailers(movie.id);
        if (trailers.length > 0) {
          const trailerKey = trailers[0].key;
          openTrailerModal(trailerKey, movie.id);
        } else {
          // Handle case when no trailer is available
        }
      });
    });
  }

  // Open the trailer modal and play the trailer
  function openTrailerModal(trailerKey, movieId) {
    const modal = document.getElementById('trailer-modall');
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
  const submitRatingButton = document.getElementById('submit-rating');
  submitRatingButton.addEventListener('click', () => {
    const modal = document.getElementById('trailer-modall');
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
    const modal = document.getElementById('trailer-modall');
    const movieId = modal.dataset.movieId;
    deleteRating(movieId);
    alert('Rating deleted!');
  }
  
  // Add click event listener to the delete rating button outside the openTrailerModal function
  const deleteRatingButton = document.querySelector('.delete-rating');
  deleteRatingButton.addEventListener('click', deleteRatingHandler);
  

  // Close the trailer modal
  function closeModal() {
    const modal = document.getElementById('trailer-modall');
    const iframe = document.getElementById('trailer-iframe');

    // Stop the video playback
    iframe.src = '';

    modal.style.display = 'none';
  }
  // Add click event listener to the close button of the trailer modal
  const closeButton = document.querySelector('.close');
  closeButton.addEventListener('click', closeModal);


  function deleteRating(movieId) {
    fetch(`/ratings/${movieId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          console.log(`Rating deleted for movieId: ${movieId}`);
          // Remove "active" class from all rating stars
          const ratingStars = document.getElementsByClassName('star');
          Array.from(ratingStars).forEach(star => {
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
    const ratingStars = document.getElementsByClassName('star');
    const ratingStarsArray = Array.from(ratingStars); // Convert HTMLCollection to an array

    ratingStarsArray.forEach(star => {
      star.classList.remove('active'); // Remove "active" class from all stars
      const starRating = parseInt(star.dataset.rating);
      if (starRating <= selectedRating) {
        star.classList.add('active');
      }
    });
  }

  function getSelectedRating() {
    const ratingStars = document.getElementsByClassName('star');
    for (let i = ratingStars.length - 1; i >= 0; i--) {
      if (ratingStars[i].classList.contains('active')) {
        return parseInt(ratingStars[i].dataset.rating);
      }
    }
    return 0; // If no rating is selected, return 0 or any default value
  }
});
