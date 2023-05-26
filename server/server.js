const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const movieController = require('./controller.js');

const app = express();
const PORT = 4000;


app.use(express.static('public'));
app.use(express.json());
// Middleware to parse request body
app.use(bodyParser.json());

app.get('/search', movieController.searchMovies);

app.get('/movies/trending/:timeWindow', movieController.getTrendingMovies);

app.get('/movies/:category', movieController.getMoviesByCategory);

app.get('/movies/:movieId/videos', movieController.getMovieVideos);

app.get('/movies/popular', movieController.getPopularMovies);

app.get('/movies/top_rated', movieController.getTopRatedMovies);

app.get('/movies/upcoming', movieController.getUpcomingMovies);

app.post('/ratings', movieController.saveRating);

app.get('/ratings/:movieId', movieController.getRating);

app.delete('/ratings/:movieId', movieController.deleteRating);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Opening.....`);
  const open = await import('open');
  open.default(`http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  server.close();
  process.exit();
});
