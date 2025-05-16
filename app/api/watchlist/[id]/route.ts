import { itemToWatchlist } from '@/helpers/watchlist';
import {
  createParams,
  dbclient,
  parseItemsArray,
  simplifyItem,
} from '@/server/dynamodb';
import { checkHasAccess } from '@/server/watchlist';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { username } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;

  const watchlistResponse = await checkHasAccess(id, username);
  if (!watchlistResponse) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you do not have access' },
      { status: 403 },
    );
  }

  if (watchlistResponse.Items) {
    const ownWatchlist = simplifyItem(watchlistResponse.Items[0]);
    const managedBy = ownWatchlist.managedBy.replace('USER#', '');
    if (managedBy === username) {
      return NextResponse.json({
        watchlist: itemToWatchlist(ownWatchlist),
      });
    } else {
      return checkHasAccess(id, managedBy).then((response) => {
        if (response && response.Items) {
          return NextResponse.json({
            watchlist: itemToWatchlist(parseItemsArray(response.Items)[0]),
          });
        }

        return NextResponse.json(
          { _message: 'Watchlist does not exist' },
          { status: 404 },
        );
      });
    }
  }

  return NextResponse.json(
    { _message: 'Watchlist does not exist or you do not have access' },
    { status: 403 },
  );
}

export async function PATCH(
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

  const { title, description, allowInvites } = await request.json();

  if (!title) {
    return NextResponse.json(
      { _message: 'Title is required' },
      { status: 400 },
    );
  }

  return dbclient
    .send(
      new UpdateItemCommand(
        createParams({
          Key: {
            PK: { S: `USER#${username}` },
            SK: { S: `LIST#${id}` },
          },
          UpdateExpression:
            'SET #TITLE = :title, #DESCRIPTION = :description, #ALLOW_INVITES = :allowInvites',
          ExpressionAttributeNames: {
            '#TITLE': 'title',
            '#DESCRIPTION': 'description',
            '#ALLOW_INVITES': 'allowInvites',
          },
          ExpressionAttributeValues: {
            ':title': { S: title },
            ':description': { S: description },
            ':allowInvites': { B: allowInvites },
          },
        }),
      ),
    )
    .then(() => {
      return NextResponse.json({ success: true });
    })
    .catch(async (err) => {
      console.log('watchlist update', err);
      return NextResponse.json(
        { _message: 'Watchlist could not be updated' },
        { status: 500 },
      );
    });
}
