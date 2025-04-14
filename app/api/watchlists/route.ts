import { itemToWatchlist } from '@/helpers/watchlist';
import { createParams, dbclient, parseItemsArray } from '@/server/dynamodb';
import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import { v4 as uuid } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { email } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );

  return await dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 100,
          KeyConditionExpression:
            'PK = :email AND begins_with(SK, :watchlistPrefix)',
          ExpressionAttributeValues: {
            ':email': { S: `USER#${email}` },
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

export async function POST(request: NextRequest) {
  const { email } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );

  const { title, description } = await request.json();

  if (!title) {
    return NextResponse.json(
      { _message: 'Title is required' },
      { status: 400 },
    );
  }

  const item: Record<string, AttributeValue> = {
    PK: { S: `USER#${email}` },
    SK: { S: `LIST#${uuid()}` },
    title: { S: title },
    managedBy: { S: `USER#${email}` },
  };

  if (description) {
    item.description = { S: description };
  }

  return dbclient
    .send(
      new PutItemCommand(
        createParams({
          Item: item,
        }),
      ),
    )
    .then(() => {
      return NextResponse.json({ success: true });
    })
    .catch(async (err) => {
      // log error
      console.log('watchlist create', err);
      return NextResponse.json(
        { _message: 'Watchlist could not be created' },
        { status: 500 },
      );
    });
}
