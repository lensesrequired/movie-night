import { itemToWatchlist } from '@/helpers/watchlist';
import { createParams, dbclient, simplifyItem } from '@/server/dynamodb';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { email } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;
  let watchlist = null;

  try {
    const ownedWatchlistResp = await dbclient.send(
      new QueryCommand(
        createParams({
          Limit: 100,
          KeyConditionExpression: 'PK = :email AND SK = :ownedWatchlist',
          ExpressionAttributeValues: {
            ':email': { S: `USER#${email}` },
            ':ownedWatchlist': {
              S: `SELF#${id}`,
            },
          },
        }),
      ),
    );
    if (ownedWatchlistResp.Items) {
      watchlist = ownedWatchlistResp.Items[0];
    }
  } catch (err) {
    console.log('owned watchlist lookup', err);
    return NextResponse.json(
      { _message: 'Watchlist could not be retrieved' },
      { status: 500 },
    );
  }

  if (!watchlist) {
    try {
      const sharedWatchlistsResp = await dbclient.send(
        new QueryCommand(
          createParams({
            Limit: 100,
            KeyConditionExpression: 'PK = :email AND SK = :sharedWatchlist',
            ExpressionAttributeValues: {
              ':email': { S: `USER#${email}` },
              ':sharedWatchlist': { S: `SHARED#${id}` },
            },
          }),
        ),
      );
      if (sharedWatchlistsResp.Items) {
        watchlist = sharedWatchlistsResp.Items[0];
      }
    } catch (err) {
      console.log('shared watchlist lookup', err);
      return NextResponse.json(
        { _message: 'Watchlist could not be retrieved' },
        { status: 500 },
      );
    }
  }

  if (watchlist) {
    return NextResponse.json({
      watchlist: itemToWatchlist(simplifyItem(watchlist)),
    });
  }

  return NextResponse.json(
    { _message: 'Watchlist could not be found' },
    { status: 404 },
  );
}
