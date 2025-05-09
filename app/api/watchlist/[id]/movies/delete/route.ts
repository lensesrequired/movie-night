import { TABLE_NAME, dbclient } from '@/server/dynamodb';
import { checkHasAccess } from '@/server/watchlist';
import { BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { email } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;
  const { movies } = await request.json();

  if (!(await checkHasAccess(id, email))) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you do not have access' },
      { status: 403 },
    );
  }

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
