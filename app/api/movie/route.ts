import { convertTMDBResults } from '@/helpers/tmdb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchText = request.nextUrl.searchParams.get('search');
  const year = request.nextUrl.searchParams.get('year');
  const movieId = request.nextUrl.searchParams.get('movieId');

  if (!searchText && !movieId) {
    return NextResponse.json(
      { _message: 'Search value or Movie ID is required' },
      { status: 400 },
    );
  }

  const query = new URLSearchParams({
    query: searchText || '',
    include_adult: 'false',
    language: 'en-US',
    page: '1',
  });
  if (year) {
    query.set('year', year);
  }

  return (
    movieId
      ? fetch(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
          },
        })
      : fetch(`https://api.themoviedb.org/3/search/movie?${query.toString()}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
          },
        })
  )
    .then((res) => res.json())
    .then((res) => {
      return NextResponse.json({
        results: convertTMDBResults(
          Array.isArray(res.results) ? res.results : [res],
        ),
      });
    })
    .catch((err) => {
      console.log('movie search', err);
      return NextResponse.json(
        { _message: 'Movie search failed' },
        { status: 500 },
      );
    });
}
