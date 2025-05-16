import { createParams, dbclient, simplifyItem } from '@/server/dynamodb';
import {
  DeleteItemCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { username } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );

  const { code } = await request.json();

  if (!code) {
    return NextResponse.json(
      { _message: 'Invite Code is required' },
      { status: 400 },
    );
  }

  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 1,
          IndexName: 'GSI1',
          KeyConditionExpression: 'SK = :inviteCode',
          ExpressionAttributeValues: {
            ':inviteCode': { S: `INVITE_CODE#${code}` },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items && response.Items.length) {
        const {
          PK: watchlistKey,
          SK: inviteCodeKey,
          ttl: expiration,
        } = simplifyItem(response.Items[0]);
        if (new Date(expiration) < new Date()) {
          return NextResponse.json(
            { _message: 'Expired Invite Code' },
            { status: 400 },
          );
        }

        return dbclient
          .send(
            new QueryCommand(
              createParams({
                Limit: 1,
                IndexName: 'GSI1',
                KeyConditionExpression:
                  'SK = :watchlist AND begins_with(PK, :userPrefix)',
                ExpressionAttributeValues: {
                  ':watchlist': { S: watchlistKey },
                  ':userPrefix': { S: 'USER' },
                },
              }),
            ),
          )
          .then((watchlistResponse) => {
            if (watchlistResponse.Items && watchlistResponse.Items.length) {
              const watchlist = simplifyItem(watchlistResponse.Items[0]);
              const item: Record<string, AttributeValue> = {
                PK: { S: `USER#${username}` },
                SK: { S: watchlistKey },
                managedBy: { S: watchlist.managedBy },
              };

              return dbclient
                .send(
                  new PutItemCommand(
                    createParams({
                      Item: item,
                    }),
                  ),
                )
                .then(async () => {
                  await dbclient.send(
                    new DeleteItemCommand(
                      createParams({
                        Key: {
                          PK: { S: watchlistKey },
                          SK: { S: inviteCodeKey },
                        },
                      }),
                    ),
                  );
                  return NextResponse.json({
                    watchlistId: watchlistKey.replace('LIST#', ''),
                  });
                })
                .catch(async (err) => {
                  // log error
                  console.log('watchlist join', err);
                  return NextResponse.json(
                    { _message: 'Could not join watchlist' },
                    { status: 500 },
                  );
                });
            }

            console.log(
              'watchlist lookup on watchlist join',
              watchlistResponse,
            );
            return NextResponse.json(
              { _message: 'Something went wrong. Please try again later' },
              { status: 500 },
            );
          })
          .catch((err) => {
            console.log('watchlist join', err);
            return NextResponse.json(
              { _message: 'Invalid Invite Code' },
              { status: 500 },
            );
          });
      }

      console.log(`watchlist join: ${code}`, response);
      return NextResponse.json(
        { _message: 'Invalid Invite Code' },
        { status: 400 },
      );
    })
    .catch((err) => {
      console.log('watchlist join', err);
      return NextResponse.json(
        { _message: 'Invalid Invite Code' },
        { status: 500 },
      );
    });
}
