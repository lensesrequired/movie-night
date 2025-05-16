import { createParams, dbclient, simplifyItem } from '@/server/dynamodb';
import {
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
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
                Limit: 50,
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
            console.log(watchlistResponse.Items);
          })
          .catch((err) => {
            console.log('watchlist join', err);
            return NextResponse.json(
              { _message: 'Invalid Invite Code' },
              { status: 500 },
            );
          });
        // const item: Record<string, AttributeValue> = {
        //   PK: { S: `MOVIE#${tmdbId}` },
        //   SK: { S: `LIST#${id}` },
        //   title: { S: title },
        //   posterPath: { S: posterPath },
        //   addedBy: { S: `USER#${username}` },
        //   dateAdded: { N: new Date().getTime().toString() },
        // };
        // if (releaseDate) {
        //   item.releaseDate = {
        //     N: new Date(releaseDate).getTime().toString(),
        //   };
        // }
        //
        // return dbclient
        //   .send(
        //     new PutItemCommand(
        //       createParams({
        //         Item: item,
        //       }),
        //     ),
        //   )
        //   .then(() => {
        //     return NextResponse.json({ success: true });
        //   })
        //   .catch(async (err) => {
        //     // log error
        //     console.log('watchlist add movie', err);
        //     return NextResponse.json(
        //       { _message: 'Movie could not be added' },
        //       { status: 500 },
        //     );
        //   });
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
