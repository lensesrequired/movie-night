import { PickOperation } from '@/constants';
import { TABLE_NAME, createParams, dbclient } from '@/server/dynamodb';
import { checkHasAccess } from '@/server/watchlist';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

type VoteParams = { id: string; pickId: string };

/**
 * Endpoint to submit a pick vote
 * @pathParams VoteParams
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<VoteParams> },
) {
  const { username } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id, pickId } = await params;
  const operation = request.nextUrl.searchParams.get('operation');

  if (!(await checkHasAccess(id, username))) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you do not have access' },
      { status: 403 },
    );
  }

  switch (operation as PickOperation) {
    case PickOperation.CLOSE_VOTING:
      return dbclient
        .send(
          new QueryCommand(
            createParams({
              IndexName: 'GSI1',
              KeyConditionExpression:
                'SK = :pickId AND begins_with(PK, :userVotePrefix)',
              ExpressionAttributeValues: {
                ':pickId': { S: `PICK#${pickId}` },
                ':userVotePrefix': { S: 'USER' },
              },
            }),
          ),
        )
        .then((response) => {
          if (response && response.Items) {
            // TODO: Ranked choice algorithm
            return;
            // Save winningMovieId and then return it
            const winningMovieId = 'winningMovieId';
            return dbclient
              .send(
                new UpdateItemCommand({
                  TableName: TABLE_NAME,
                  Key: {
                    PK: { S: `LIST#${id}` },
                    SK: { S: `PICK#${pickId}` },
                  },
                  UpdateExpression: `SET #movie = :movieId`,
                  ExpressionAttributeNames: {
                    '#movie': 'movie',
                  },
                  ExpressionAttributeValues: {
                    ':movieId': { S: winningMovieId },
                  },
                }),
              )
              .then((updateResponse) => {
                if (updateResponse.$metadata.httpStatusCode === 200) {
                  return NextResponse.json({ pickedMovie: winningMovieId });
                }

                console.log(
                  `pick vote setting for ${id}:${pickId} had bad response`,
                  updateResponse,
                );
                return NextResponse.json({
                  _message: 'Something went wrong. Please try again later',
                });
              })
              .catch((err) => {
                console.log(
                  `pick vote setting for ${id}:${pickId} failed`,
                  err,
                );
                return NextResponse.json(
                  { _message: 'Something went wrong. Please try again later' },
                  { status: 500 },
                );
              });
          }

          console.log(
            `pick vote counting for ${id}:${pickId} had bad response`,
            response,
          );
          return NextResponse.json({
            _message: 'Something went wrong. Please try again later',
          });
        })
        .catch((err) => {
          console.log(`pick vote counting for ${id}:${pickId} failed`, err);
          return NextResponse.json(
            { _message: 'Something went wrong. Please try again later' },
            { status: 500 },
          );
        });
    default:
      return NextResponse.json(
        { _message: 'Pick operation not supported' },
        { status: 400 },
      );
  }
}
