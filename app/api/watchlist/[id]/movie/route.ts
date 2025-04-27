import { createParams, dbclient } from '@/server/dynamodb';
import { TMDBMovieLookup } from '@/types';
import {
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import { v4 as uuid } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { email } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;

  const {
    id: tmdbId,
    title,
    posterPath,
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
          Limit: 100,
          IndexName: 'GSI1',
          KeyConditionExpression: 'SK = :watchlist',
          ExpressionAttributeValues: {
            ':watchlist': { S: `LIST#${id}` },
          },
        }),
      ),
    )
    .then((watchlistResponse) => {
      if (watchlistResponse.Items && watchlistResponse.Items.length) {
        return dbclient
          .send(
            new QueryCommand(
              createParams({
                Limit: 100,
                IndexName: 'GSI1',
                KeyConditionExpression: 'SK = :watchlist AND GSI_SK = :movie',
                ExpressionAttributeValues: {
                  ':watchlist': { S: `LIST#${id}` },
                  ':movie': { S: `MOVIE#${tmdbId}` },
                },
              }),
            ),
          )
          .then((response) => {
            if (!response.Items || !response.Items.length) {
              const item: Record<string, AttributeValue> = {
                PK: { S: uuid() },
                SK: { S: `LIST#${uuid()}` },
                GSI_SK: { S: `MOVIE#${tmdbId}` },
                title: { S: title },
                posterPath: { S: posterPath },
                addedBy: { S: `USER#${email}` },
              };

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
            }

            console.log(
              `watchlist add movie already exists ${id}:${tmdbId}`,
              watchlistResponse,
            );
            return NextResponse.json(
              { _message: 'Movie already in Watchlist' },
              { status: 400 },
            );
          });
      }

      console.log(
        `watchlist add movie could not find watchlist ${id}`,
        watchlistResponse,
      );
      return NextResponse.json(
        { _message: 'Watchlist could not be found' },
        { status: 404 },
      );
    })
    .catch((err) => {
      console.log('watchlist add movie lookup', err);
      return NextResponse.json(
        { _message: 'Movie could not be added' },
        { status: 500 },
      );
    });
}
