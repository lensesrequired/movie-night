import { convertTMDBResults } from '@/helpers/tmdb';
import { TMDBMovieResponse } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

const mockReturn: TMDBMovieResponse = {
  page: 1,
  results: [
    {
      adult: false,
      backdrop_path: '/9tOkjBEiiGcaClgJFtwocStZvIT.jpg',
      genre_ids: [16, 12, 10751, 35],
      id: 269149,
      original_language: 'en',
      original_title: 'Zootopia',
      overview:
        "Determined to prove herself, Officer Judy Hopps, the first bunny on Zootopia's police force, jumps at the chance to crack her first case - even if it means partnering with scam-artist fox Nick Wilde to solve the mystery.",
      popularity: 27.1751,
      poster_path: '/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg',
      release_date: '2016-02-11',
      title: 'Zootopia',
      video: false,
      vote_average: 7.747,
      vote_count: 16620,
    },
    {
      adult: false,
      backdrop_path: '/7nfpkR9XsQ1lBNCXSSHxGV7Dkxe.jpg',
      genre_ids: [10751, 35, 12, 16],
      id: 1084242,
      original_language: 'en',
      original_title: 'Zootopia 2',
      overview:
        'Detectives Judy Hopps and Nick Wilde find themselves on the twisting trail of a mysterious reptile who arrives in Zootopia and turns the mammal metropolis upside down.',
      popularity: 6.7235,
      poster_path: '/ieaBcDSZBZZY4imyEJmMOdSCeo3.jpg',
      release_date: '2025-11-26',
      title: 'Zootopia 2',
      video: false,
      vote_average: 0,
      vote_count: 0,
    },
    {
      adult: false,
      backdrop_path: null,
      genre_ids: [99],
      id: 391711,
      original_language: 'en',
      original_title: 'Imagining Zootopia',
      overview:
        "Fusion spent two years with the production team of Disney's smash hit film. In 'Imagining Zootopia,' you will travel with the team to Africa to explore the animals in their natural habitat and find out how the storytellers and animators dealt with the very real themes of prejudice and bias.",
      popularity: 0.3366,
      poster_path: '/dwLfMBuOZL7YUCQZJYTzYIFzZuu.jpg',
      release_date: '2016-04-05',
      title: 'Imagining Zootopia',
      video: false,
      vote_average: 7.4,
      vote_count: 11,
    },
    {
      adult: false,
      backdrop_path: null,
      genre_ids: [],
      id: 1415793,
      original_language: 'en',
      original_title: 'Return to Zootopia: Full Fan Film',
      overview:
        'In Zootopia, Judy Hopps (Creative Multitasker) and Nick Wilde (Mauricio Velazco) have spent six months as partners in the ZPD, catching criminals and being the best at what they do... but their relationship is slowly flourishing into something more than friendship. Now the duo must test their trust for one another as a new case starts to slowly spiral their lives out of control.',
      popularity: 0.7595,
      poster_path: '/51S1ofG2oxQXWVyrGXtMUm9wu2M.jpg',
      release_date: '',
      title: 'Return to Zootopia: Full Fan Film',
      video: false,
      vote_average: 0,
      vote_count: 0,
    },
  ],
  total_pages: 1,
  total_results: 4,
};

const getMockData = async () => ({ json: async () => mockReturn });

export async function GET(request: NextRequest) {
  const searchText = request.nextUrl.searchParams.get('search');

  if (!searchText) {
    return NextResponse.json(
      { _message: 'Search value is required' },
      { status: 400 },
    );
  }

  return (
    ['zootopia', 'test'].includes(searchText.toLowerCase())
      ? getMockData()
      : fetch(
          `https://api.themoviedb.org/3/search/movie?query=${searchText}&include_adult=false&language=en-US&page=1`,
          {
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
            },
          },
        )
  )
    .then((res) => res.json())
    .then((res) => {
      return NextResponse.json({ results: convertTMDBResults(res.results) });
    })
    .catch((err) => {
      console.log('movie search', err);
      return NextResponse.json(
        { _message: 'Movie search failed' },
        { status: 500 },
      );
    });
}
