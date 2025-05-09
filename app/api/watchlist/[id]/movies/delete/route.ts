import { itemsToWatchlistMovies } from '@/helpers/watchlist';
import { TABLE_NAME, createParams, dbclient } from '@/server/dynamodb';
import { BatchWriteItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { movies } = await request.json();

  // TODO: check has access to watchlist
  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 1,
          IndexName: 'GSI1',
          KeyConditionExpression: 'SK = :watchlist',
          ExpressionAttributeValues: {
            ':watchlist': { S: `LIST#${id}` },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items) {
        return dbclient
          .send(
            new BatchWriteItemCommand({
              RequestItems: {
                [TABLE_NAME]: movies.map((tmdbId: string) => ({
                  DeleteRequest: {
                    Key: {
                      PK: { S: `MOVIE#${tmdbId}` },
                      SK: { S: `LIST#${id}` },
                    },
                  },
                })),
              },
            }),
          )
          .then((response) => {
            console.log(response);
            if (response['$metadata'].httpStatusCode === 200) {
              return NextResponse.json({
                success: true,
              });
            }

            console.log(`watchlist delete movies ${id}`, response);
            return NextResponse.json(
              { _message: 'Watchlist movies could not be deleted' },
              { status: 500 },
            );
          })
          .catch((err) => {
            console.log(`watchlist delete movies ${id}`, err);
            return NextResponse.json(
              { _message: 'Watchlist could not be found' },
              { status: 404 },
            );
          });
      }

      console.log(`watchlist delete movies ${id}`, response);
      return NextResponse.json(
        { _message: 'Watchlist could not be found' },
        { status: 404 },
      );
    })
    .catch((err) => {
      console.log(`watchlist delete movies ${id}`, err);
      return NextResponse.json(
        { _message: 'Watchlist could not be found' },
        { status: 404 },
      );
    });
}
