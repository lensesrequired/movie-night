import { PickOption } from '@/constants';
import {
  createParams,
  dbclient,
  parseItemsArray,
  simplifyItem,
} from '@/server/dynamodb';
import { checkHasAccess } from '@/server/watchlist';
import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

type VoteParams = { id: string; pickId: string };

/**
 * Endpoint to retrieve pick votes
 * @pathParams VoteParams
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<VoteParams> },
) {
  const { username } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id, pickId } = await params;

  if (!(await checkHasAccess(id, username))) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you do not have access' },
      { status: 403 },
    );
  }

  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 3,
          KeyConditionExpression: 'PK = :userId AND SK = :votePickPrefix',
          ExpressionAttributeValues: {
            ':userId': { S: `USER#${username}` },
            ':votePickPrefix': { S: `PICK#${pickId}` },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items) {
        return NextResponse.json({
          votes: parseItemsArray(response.Items),
        });
      }

      console.log(`vote lookup for ${id}:${pickId} failed`, response);
      return NextResponse.json(
        { _message: 'Something went wrong. Please try again later' },
        { status: 500 },
      );
    })
    .catch((err) => {
      console.log(`vote lookup for ${id}:${pickId} failed`, err);
      return NextResponse.json(
        { _message: 'Something went wrong. Please try again later' },
        { status: 500 },
      );
    });
}

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
  const { votes } = await request.json();

  if (!(await checkHasAccess(id, username))) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you do not have access' },
      { status: 403 },
    );
  }

  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 1,
          KeyConditionExpression: 'PK = :watchlistId AND SK = :pickId',
          ExpressionAttributeValues: {
            ':watchlistId': { S: `LIST#${id}` },
            ':pickId': { S: `PICK#${pickId}` },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items && response.Items.length > 0) {
        const pick = simplifyItem(response.Items[0]);
        if (pick.pickType === PickOption.RANDOM_SELECTION) {
          return NextResponse.json(
            { _message: 'This type of Pick does not take votes' },
            { status: 400 },
          );
        }
        if (pick.movie || new Date(pick.votingExpiry * 1000) <= new Date()) {
          return NextResponse.json(
            { _message: 'This Pick is closed to voting' },
            { status: 400 },
          );
        }

        dbclient
          .send(
            new QueryCommand(
              createParams({
                Limit: 1,
                KeyConditionExpression: 'PK = :userId AND SK = :votePickPrefix',
                ExpressionAttributeValues: {
                  ':userId': { S: `USER#${username}` },
                  ':votePickPrefix': { S: `PICK#${pickId}` },
                },
              }),
            ),
          )
          .then((response) => {
            if (response.Items && response.Items.length > 0) {
              return NextResponse.json(
                { _message: 'Pick can only be voted on once' },
                { status: 400 },
              );
            }

            dbclient
              .send(
                new PutItemCommand(
                  createParams({
                    Item: {
                      PK: { S: `USER#${username}` },
                      SK: { S: `PICK#${pickId}#VOTE#${votes[0]}` },
                      rank: { N: '0' },
                      ttl: { N: pick.expiry.toString() },
                    },
                  }),
                ),
              )
              .then((response) => {
                if (response.$metadata.httpStatusCode === 200) {
                  return NextResponse.json({ success: true });
                }

                console.log(`vote submission for ${id}:${pickId}`, response);
                return NextResponse.json({
                  _message: 'Something went wrong. Please try again later',
                });
              })
              .catch((err) => {
                console.log(`vote submission for ${id}:${pickId}`, err);
                return NextResponse.json(
                  { _message: 'Something went wrong. Please try again later' },
                  { status: 500 },
                );
              });
          });
      }

      console.log(
        `watchlist pick lookup for ${id}:${pickId} could not be found`,
        response,
      );
      return NextResponse.json(
        { _message: 'Pick could not be found' },
        { status: 404 },
      );
    })
    .catch((err) => {
      console.log(`watchlist pick lookup for ${id}:${pickId} failed`, err);
      return NextResponse.json(
        { _message: 'Pick could not be found' },
        { status: 500 },
      );
    });
}
