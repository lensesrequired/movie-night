import { MAX_MOVIES } from '@/constants';
import {
  createParams,
  dbclient,
  simplify,
  simplifyItem,
} from '@/server/dynamodb';
import { checkHasAccess } from '@/server/watchlist';
import { TMDBMovieLookup } from '@/types';
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

  const {
    id: tmdbId,
    title,
    posterPath,
    releaseDate,
  }: TMDBMovieLookup = await request.json();

  if (!tmdbId) {
    return NextResponse.json(
      { _message: 'Movie ID is required' },
      { status: 400 },
    );
  }

  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: MAX_MOVIES,
          IndexName: 'GSI1',
          KeyConditionExpression:
            'SK = :watchlist AND begins_with(PK, :moviePrefix)',
          ExpressionAttributeValues: {
            ':watchlist': { S: `LIST#${id}` },
            ':moviePrefix': { S: 'MOVIE' },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items) {
        if (response.Items.length === MAX_MOVIES) {
          return NextResponse.json(
            {
              _message: `This watchlist has reached its maximum movie capacity (${MAX_MOVIES})`,
            },
            { status: 400 },
          );
        }
        if (
          response.Items.some(
            (item) => simplifyItem(item).PK === `MOVIE#${tmdbId}`,
          )
        ) {
          return NextResponse.json(
            { _message: 'This movie is already in this watchlist' },
            { status: 400 },
          );
        }
      }

      const item: Record<string, AttributeValue> = {
        PK: { S: `MOVIE#${tmdbId}` },
        SK: { S: `LIST#${id}` },
        title: { S: title },
        posterPath: { S: posterPath },
        addedBy: { S: `USER#${username}` },
        dateAdded: { N: new Date().getTime().toString() },
      };
      if (releaseDate) {
        item.releaseDate = {
          N: new Date(releaseDate).getTime().toString(),
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
        .catch(async (err) => {
          // log error
          console.log('watchlist add movie', err);
          return NextResponse.json(
            { _message: 'Movie could not be added' },
            { status: 500 },
          );
        });
    })
    .catch((err) => {
      console.log('watchlist add movie lookup', err);
      return NextResponse.json(
        { _message: 'Movie could not be added' },
        { status: 500 },
      );
    });
}
