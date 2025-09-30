import React, { use, useEffect, useState } from 'react';
import Search from './components/Search.jsx';
import Loader from './components/Loader.jsx';
import MovieCard from './components/MovieCard.jsx';
import {useDebounce} from 'react-use';
import Loading from './components/Loading.jsx';
import { updateSearchCount } from './appwrite.js';

const BASE_API_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {

  const [loadings, setLoadings] = useState(false);

  useEffect(() => {
    setLoadings(true);
    setTimeout(() => {
      setLoadings(false);
    }, 3000);
  }, []);

  const [searchTerm,setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList,setMovieList] = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  const [debouncedSearchTerm,setDebouncedSearchTerm] = useState('');

  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    // Try serverless function first
    try {
      const endpoint = query
        ? `/api/movies?query=${encodeURIComponent(query)}`
        : `/api/movies`;

      const response = await fetch(endpoint);

      if (!response.ok) throw new Error('Serverless function failed');

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Error fetching movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      // Fallback: direct TMDB API call
      try {
        const BASE_API_URL = 'https://api.themoviedb.org/3';
        const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        const API_OPTIONS = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
        };

        const endpoint = query
          ? `${BASE_API_URL}/search/movie?query=${encodeURIComponent(query)}`
          : `${BASE_API_URL}/discover/movie?sort_by=popularity.desc`;

        const response = await fetch(endpoint, API_OPTIONS);

        if (!response.ok) throw new Error('Direct TMDB API call failed');

        const data = await response.json();

        if (data.Response === 'False') {
          setErrorMessage(data.Error || 'Error fetching movies');
          setMovieList([]);
          return;
        }

        setMovieList(data.results || []);

        if (query && data.results.length > 0) {
          await updateSearchCount(query, data.results[0]);
        }
      } catch (fallbackError) {
        console.error('Both serverless and fallback failed:', fallbackError);
        setErrorMessage('Failed to fetch movies. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(searchTerm);
  }, [searchTerm]);

  return (
    <main>
      <div className='pattern' />
      <div className='wrapper'>
        {
          loadings ? <Loading /> : null
        }
        <header>
          <img src='browsflix.png' />
          <img src='./hero.png' alt='Hero Banner' />
          <h1>
            Find <span className='text-gradient'>Movies</span> You'll Enjoy Without The Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
        </header>

        <section className='all-movies'>
          <h2 className='mt-[40px]'>All Movies</h2>
          
          {isLoading ? (
            <Loader />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )
            }

        </section>
        
      </div>
    </main>
  )
}
export default App;

