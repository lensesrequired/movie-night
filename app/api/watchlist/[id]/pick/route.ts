import { DurationOption, MAX_PICKS } from '@/constants';
import { createParams, dbclient, simplifyItem } from '@/server/dynamodb';
import { checkHasAccess } from '@/server/watchlist';
import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
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

  const { name, pickType, moviePool, movieId, expiryOptions } =
    await request.json();
  const { count, type } = expiryOptions || {};

  const today = new Date();
  let expiry = null;
  let ttl = new Date(new Date().setDate(today.getDate() + 7));
  if (count || type) {
    const days = type === DurationOption.DAY ? count : count * 7;
    expiry = new Date(new Date().setDate(today.getDate() + days));
    ttl = new Date(new Date().setDate(today.getDate() + days + 7));
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
        if (response.Items.length === MAX_PICKS) {
          return NextResponse.json(
            {
              _message: `The maximum number of picks have already been created (${MAX_PICKS})`,
            },
            { status: 400 },
          );
        } else if (
          response.Items.some(
            (i) => simplifyItem(i).SK.replace('PICK#', '') === name,
          )
        ) {
          return NextResponse.json(
            {
              _message: `There is already a pick with the name '${name}' for this list`,
            },
            { status: 400 },
          );
        } else {
          const item: Record<string, AttributeValue> = {
            PK: { S: `LIST#${id}` },
            SK: { S: `PICK#${name}` },
            ttl: { N: (Number(ttl) / 1000).toString() },
            pickType: { S: pickType },
            moviePool: { S: moviePool },
          };

          if (expiry) {
            item.votingExpiry = { N: (Number(expiry) / 1000).toString() };
          }
          if (movieId) {
            item.movie = {
              S: movieId,
            };
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
            .catch((err) => {
              console.log(`watchlist pick add ${id}:${name}`, err);
              return NextResponse.json(
                { _message: 'Pick could not be saved' },
                { status: 500 },
              );
            });
        }
      }

      console.log(`watchlist pick lookup on add ${id}`, response);
      return NextResponse.json(
        { _message: 'Pick could not be saved' },
        { status: 500 },
      );
    })
    .catch((err) => {
      console.log(`watchlist pick lookup on add ${id}`, err);
      return NextResponse.json(
        { _message: 'Pick could not be saved' },
        { status: 500 },
      );
    });
}
