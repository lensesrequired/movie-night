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
  let watchlists: Record<string, AttributeValue>[] = [];

  try {
    const ownedWatchlistsResp = await dbclient.send(
      new QueryCommand(
        createParams({
          Limit: 100,
          KeyConditionExpression:
            'PK = :email AND begins_with(SK, :ownedWatchlistPrefix)',
          ExpressionAttributeValues: {
            ':email': { S: `USER#${email}` },
            ':ownedWatchlistPrefix': { S: 'SELF' },
          },
        }),
      ),
    );
    if (ownedWatchlistsResp.Items) {
      watchlists = watchlists.concat(ownedWatchlistsResp.Items);
    }
  } catch (err) {
    console.log('owned watchlists lookup', err);
    return NextResponse.json(
      { _message: 'Watchlists could not be retrieved' },
      { status: 500 },
    );
  }

  try {
    const sharedWatchlistsResp = await dbclient.send(
      new QueryCommand(
        createParams({
          Limit: 100,
          KeyConditionExpression:
            'PK = :email AND begins_with(SK, :sharedWatchlistPrefix)',
          ExpressionAttributeValues: {
            ':email': { S: `USER#${email}` },
            ':sharedWatchlistPrefix': { S: 'SHARED' },
          },
        }),
      ),
    );
    if (sharedWatchlistsResp.Items) {
      watchlists = watchlists.concat(sharedWatchlistsResp.Items);
    }
  } catch (err) {
    console.log('shared watchlists lookup', err);
    return NextResponse.json(
      { _message: 'Watchlists could not be retrieved' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    watchlists: parseItemsArray(watchlists).map(itemToWatchlist),
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
    SK: { S: `SELF#${uuid()}` },
    title: { S: title },
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
