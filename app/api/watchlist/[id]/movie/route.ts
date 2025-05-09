import { createParams, dbclient } from '@/server/dynamodb';
import { checkHasAccess } from '@/server/watchlist';
import { TMDBMovieLookup } from '@/types';
import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { email } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;

  if (!(await checkHasAccess(id, email))) {
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
          Limit: 100,
          IndexName: 'GSI1',
          KeyConditionExpression: 'SK = :watchlist AND PK = :movie',
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
          PK: { S: `MOVIE#${tmdbId}` },
          SK: { S: `LIST#${id}` },
          title: { S: title },
          posterPath: { S: posterPath },
          addedBy: { S: `USER#${email}` },
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
      }

      console.log(
        `watchlist add movie already exists ${id}:${tmdbId}`,
        response,
      );
      return NextResponse.json(
        { _message: 'Movie already in Watchlist' },
        { status: 400 },
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
