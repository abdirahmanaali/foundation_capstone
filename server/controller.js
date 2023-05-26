const axios = require('axios');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../movie-search/process.env') });

const APIKey = process.env.API_KEY;

// PostgreSQL connection configuration
const connectionConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: true,
};

// Create a PostgreSQL client
const client = new Client(connectionConfig);

// Connect to the PostgreSQL database
client.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(err => {
    console.error('Error connecting to the database', err);
  });

exports.searchMovies = async (req, res) => {
  const query = req.query.q;
  const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${APIKey}&query=${query}`;

  try {
    const response = await axios.get(apiUrl);
    const movies = response.data.results;
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getTrendingMovies = async (req, res) => {
  const timeWindow = req.params.timeWindow;
  const apiUrl = `https://api.themoviedb.org/3/trending/movie/${timeWindow}?api_key=${APIKey}`;

  try {
    const response = await axios.get(apiUrl);
    const movies = response.data.results;
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMoviesByCategory = async (req, res) => {
  const category = req.params.category;
  const apiUrl = `https://api.themoviedb.org/3/movie/${category}?api_key=${APIKey}`;

  try {
    const response = await axios.get(apiUrl);
    const movies = response.data.results;
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMovieVideos = async (req, res) => {
  const movieId = req.params.movieId;
  const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${APIKey}`;

  try {
    const response = await axios.get(apiUrl);
    const videos = response.data.results;
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getPopularMovies = async (req, res) => {
  const apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${APIKey}`;

  try {
    const response = await axios.get(apiUrl);
    const movies = response.data.results;
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getTopRatedMovies = async (req, res) => {
  const apiUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${APIKey}`;

  try {
    const response = await axios.get(apiUrl);
    const movies = response.data.results;
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUpcomingMovies = async (req, res) => {
  const apiUrl = `https://api.themoviedb.org/3/movie/upcoming?api_key=${APIKey}`;

  try {
    const response = await axios.get(apiUrl);
    const movies = response.data.results;
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.saveRating = (req, res) => {
  const { movieId, rating } = req.body;

  // Check if the 'ratings' table exists in the database
  const checkTableQuery = "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ratings')";
  client.query(checkTableQuery)
    .then(result => {
      const tableExists = result.rows[0].exists;
      if (!tableExists) {
        // Create the 'ratings' table if it doesn't exist
        const createTableQuery = `
          CREATE TABLE ratings (
            id SERIAL PRIMARY KEY,
            movie_id INTEGER REFERENCES movies(id),
            rating INTEGER
          )
        `;
        return client.query(createTableQuery);
      }
    })
    .then(() => {
      // Insert the rating into the 'ratings' table
      const insertRatingQuery = 'INSERT INTO ratings (movie_id, rating) VALUES ($1, $2)';
      const values = [movieId, rating];
      return client.query(insertRatingQuery, values);
    })
    .then(() => {
      res.json({ message: 'Rating saved!' });
    })
    .catch(err => {
      console.error('Error saving rating to the database', err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};


exports.getRating = (req, res) => {
  const { movieId } = req.params;
  const query = 'SELECT rating FROM ratings WHERE movie_id = $1';
  const values = [movieId];
  client.query(query, values)
    .then(result => {
      if (result.rows.length > 0) {
        res.json({ rating: result.rows[0].rating });
      } else {
        res.json({ rating: null });
      }
    })
    .catch(err => {
      console.error('Error retrieving rating from the database', err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
  };

  exports.deleteRating = async (req, res) => {
    const movieId = req.params.movieId;
  
    try {
      const query = 'DELETE FROM ratings WHERE movie_id = $1';
      await client.query(query, [movieId]);
      res.sendStatus(200);
    } catch (error) {
      console.error('Error deleting rating from the database', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  