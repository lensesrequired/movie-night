import { MAX_PICKS } from '@/constants';
import { itemsToWatchlistPick } from '@/helpers/pick';
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
          Limit: MAX_PICKS,
          KeyConditionExpression:
            'PK = :watchlistId AND begins_with(SK, :pickPrefix)',
          ExpressionAttributeValues: {
            ':watchlistId': { S: `LIST#${id}` },
            ':pickPrefix': { S: 'PICK' },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items) {
        return NextResponse.json({
          picks: itemsToWatchlistPick(response.Items),
        });
      }

      console.log(`watchlist pick lookup  ${id}`, response);
      return NextResponse.json(
        { _message: 'Picks could not be retrieved' },
        { status: 500 },
      );
    })
    .catch((err) => {
      console.log(`watchlist pick lookup ${id}`, err);
      return NextResponse.json(
        { _message: 'Picks could not be retrieved' },
        { status: 500 },
      );
    });
}
