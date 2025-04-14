import { itemToWatchlist } from '@/helpers/watchlist';
import {
  createParams,
  dbclient,
  parseItemsArray,
  simplifyItem,
} from '@/server/dynamodb';
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

  return await dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 100,
          KeyConditionExpression: 'PK = :email AND SK = :watchlist',
          ExpressionAttributeValues: {
            ':email': { S: `USER#${email}` },
            ':watchlist': { S: `LIST#${id}` },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items && response.Items.length) {
        return NextResponse.json({
          watchlist: itemToWatchlist(parseItemsArray(response.Items)[0]),
        });
      }

      console.log(`watchlist lookup did not find watchlist ${id}`, response);
      return NextResponse.json(
        { _message: 'Watchlist could not be found' },
        { status: 500 },
      );
    })
    .catch((err) => {
      console.log('watchlist lookup', err);
      return NextResponse.json(
        { _message: 'Watchlist could not be retrieved' },
        { status: 500 },
      );
    });
}
