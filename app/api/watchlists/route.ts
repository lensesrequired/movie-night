import { itemToWatchlist } from '@/helpers/watchlist';
import { createParams, dbclient, parseItemsArray } from '@/server/dynamodb';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { username } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );

  return await dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 100,
          KeyConditionExpression:
            'PK = :username AND begins_with(SK, :watchlistPrefix)',
          ExpressionAttributeValues: {
            ':username': { S: `USER#${username}` },
            ':watchlistPrefix': { S: 'LIST' },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items) {
        return NextResponse.json({
          watchlists: parseItemsArray(response.Items).map(itemToWatchlist),
        });
      }

      console.log('watchlists lookup did not contain items', response);
      return NextResponse.json(
        { _message: 'Watchlists could not be retrieved' },
        { status: 500 },
      );
    })
    .catch((err) => {
      console.log('watchlists lookup', err);
      return NextResponse.json(
        { _message: 'Watchlists could not be retrieved' },
        { status: 500 },
      );
    });
}
