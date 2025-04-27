import { itemsToWatchlistMovies } from '@/helpers/watchlist';
import { createParams, dbclient } from '@/server/dynamodb';
import { TMDBMovieLookup } from '@/types';
import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import { v4 as uuid } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // TODO: check has access to watchlist
  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 100,
          IndexName: 'GSI1',
          KeyConditionExpression:
            'SK = :watchlist AND begins_with(GSI_SK, :moviePrefix)',
          ExpressionAttributeValues: {
            ':watchlist': { S: `LIST#${id}` },
            ':moviePrefix': { S: 'MOVIE' },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items) {
        return NextResponse.json({
          movies: itemsToWatchlistMovies(response.Items),
        });
      }

      console.log(`watchlist lookup movies ${id}`, response);
      return NextResponse.json(
        { _message: 'Watchlist movies could not be retrieved' },
        { status: 500 },
      );
    })
    .catch((err) => {
      console.log(`watchlist lookup movies ${id}`, err);
      return NextResponse.json(
        { _message: 'Watchlist movies could not be retrieved' },
        { status: 500 },
      );
    });
}
