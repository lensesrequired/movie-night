import { itemToWatchlist } from '@/helpers/watchlist';
import { createParams, dbclient, parseItemsArray } from '@/server/dynamodb';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
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
        { status: 404 },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { email } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;

  const { title, description } = await request.json();

  if (!title) {
    return NextResponse.json(
      { _message: 'Title is required' },
      { status: 400 },
    );
  }

  return dbclient
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
        return dbclient
          .send(
            new UpdateItemCommand(
              createParams({
                Key: {
                  PK: { S: `USER#${email}` },
                  SK: { S: `LIST#${id}` },
                },
                UpdateExpression:
                  'SET #TITLE = :title, #DESCRIPTION = :description',
                ExpressionAttributeNames: {
                  '#TITLE': 'title',
                  '#DESCRIPTION': 'description',
                },
                ExpressionAttributeValues: {
                  ':title': { S: title },
                  ':description': { S: description },
                },
              }),
            ),
          )
          .then(() => {
            return NextResponse.json({ success: true });
          })
          .catch(async (err) => {
            // log error
            console.log('watchlist update', err);
            return NextResponse.json(
              { _message: 'Watchlist could not be updated' },
              { status: 500 },
            );
          });
      }

      console.log(`watchlist update could not find watchlist ${id}`, response);
      return NextResponse.json(
        { _message: 'Watchlist could not be found' },
        { status: 404 },
      );
    })
    .catch((err) => {
      console.log('watchlist update lookup', err);
      return NextResponse.json(
        { _message: 'Watchlist could not be updated' },
        { status: 500 },
      );
    });
}
