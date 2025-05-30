import { MAX_MOVIES, MoviePoolOption } from '@/constants';
import { itemsToWatchlistMovies } from '@/helpers/watchlist';
import { createParams, dbclient } from '@/server/dynamodb';
import { checkHasAccess } from '@/server/watchlist';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { username } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;
  const pool = request.nextUrl.searchParams.get('pool');

  if (pool !== MoviePoolOption.ALL_MOVIES) {
    return NextResponse.json(
      { _message: 'Pick option not implemented yet.' },
      { status: 400 },
    );
  }

  const watchlistResponse = await checkHasAccess(id, username);
  if (!watchlistResponse) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you do not have access' },
      { status: 403 },
    );
  }

  const n = Math.floor(Math.random() * MAX_MOVIES);
  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: n + 1,
          IndexName: 'GSI1',
          KeyConditionExpression:
            'SK = :watchlist AND begins_with(PK, :moviePrefix)',
          ExpressionAttributeValues: {
            ':watchlist': { S: `LIST#${id}` },
            ':moviePrefix': { S: 'MOVIE' },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items) {
        if (response.Items.length === n + 1) {
          return NextResponse.json({
            movie: itemsToWatchlistMovies(response.Items)[n],
          });
        }

        const i = Math.floor(Math.random() * response.Items.length);
        return NextResponse.json({
          movie: itemsToWatchlistMovies(response.Items)[i],
        });
      }

      console.log(`watchlist lookup movies for random pick: ${id}`, response);
      return NextResponse.json(
        { _message: 'Watchlist movie could not be retrieved' },
        { status: 500 },
      );
    })
    .catch((err) => {
      console.log(`watchlist lookup movies for random pick: ${id}`, err);
      return NextResponse.json(
        { _message: 'Watchlist movie could not be retrieved' },
        { status: 500 },
      );
    });
}
