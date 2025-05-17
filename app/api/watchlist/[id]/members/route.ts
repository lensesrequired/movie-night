import { itemsToWatchlistMovies } from '@/helpers/watchlist';
import {
  createParams,
  dbclient,
  parseItemsArray,
  simplifyItem,
} from '@/server/dynamodb';
import { checkHasAccess } from '@/server/watchlist';
import { DeleteItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { username } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;

  const accessResponse = await checkHasAccess(id, username);
  if (
    !accessResponse ||
    (accessResponse.Items &&
      simplifyItem(accessResponse.Items[0]).managedBy.replace('USER#', '') !==
        username)
  ) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you are not the manager of it' },
      { status: 403 },
    );
  }

  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 100,
          IndexName: 'GSI1',
          KeyConditionExpression:
            'SK = :watchlist AND begins_with(PK, :userPrefix)',
          ExpressionAttributeValues: {
            ':watchlist': { S: `LIST#${id}` },
            ':userPrefix': { S: 'USER' },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items) {
        return NextResponse.json({
          members: parseItemsArray(response.Items).reduce((members, item) => {
            members.push(item.PK.replace('USER#', ''));
            return members;
          }, []),
        });
      }

      console.log(`watchlist lookup members ${id}`, response);
      return NextResponse.json(
        { _message: 'Watchlist members could not be retrieved' },
        { status: 500 },
      );
    })
    .catch((err) => {
      console.log(`watchlist lookup members ${id}`, err);
      return NextResponse.json(
        { _message: 'Watchlist members could not be retrieved' },
        { status: 500 },
      );
    });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { username } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;
  const deleteMember = request.nextUrl.searchParams.get('username');

  const accessResponse = await checkHasAccess(id, username);
  if (
    !accessResponse ||
    (accessResponse.Items &&
      simplifyItem(accessResponse.Items[0]).managedBy.replace('USER#', '') !==
        username)
  ) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you are not the manager of it' },
      { status: 403 },
    );
  }

  if (deleteMember === username) {
    // TODO: add functionality to remove self if not owner or delete entire watchlist
    return NextResponse.json(
      {
        _message:
          'You cannot remove yourself as a member of this watchlist since you manage it',
      },
      { status: 400 },
    );
  }

  return dbclient
    .send(
      new DeleteItemCommand(
        createParams({
          Key: {
            PK: { S: `USER#${deleteMember}` },
            SK: { S: `LIST#${id}` },
          },
        }),
      ),
    )
    .then(() => {
      return NextResponse.json({ success: true });
    })
    .catch((err) => {
      console.log(`watchlist remove member ${id}:${deleteMember}`, err);
      return NextResponse.json(
        { _message: 'Watchlist member could not be removed' },
        { status: 500 },
      );
    });
}
