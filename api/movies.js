export default async (req, res) => {
  const API_KEY = process.env.TMDB_API_KEY;
  const BASE_API_URL = 'https://api.themoviedb.org/3';
  const { query } = req.query;

  const endpoint = query
    ? `${BASE_API_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${BASE_API_URL}/discover/movie?sort_by=popularity.desc`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};