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

  if (!(await checkHasAccess(id, username))) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you do not have access' },
      { status: 403 },
    );
  }

  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 100,
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
        return NextResponse.json({
          movies: itemsToWatchlistMovies(response.Items),
        });
      }

      console.log(`watchlist lookup movies ${id}`, response);
      return NextResponse.json(
        { _message: 'Watchlist movies could not be retrieved' },
        { status: 500 },
      );
    })
    .catch((err) => {
      console.log(`watchlist lookup movies ${id}`, err);
      return NextResponse.json(
        { _message: 'Watchlist movies could not be retrieved' },
        { status: 500 },
      );
    });
}
