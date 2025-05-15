import {
  createParams,
  dbclient,
  simplify,
  simplifyItem,
} from '@/server/dynamodb';
import { checkHasAccess, createInviteCode } from '@/server/watchlist';
import {
  DeleteItemCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { username } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;

  const watchlistResp = await checkHasAccess(id, username);
  if (!watchlistResp) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you do not have access' },
      { status: 403 },
    );
  }

  const [watchlist] = watchlistResp.Items || [];
  const managedBy = simplify(watchlist.managedBy).replace('USER#', '');
  if (managedBy !== username) {
    const managedListResp = await checkHasAccess(id, managedBy);
    if (managedListResp) {
      const allowInvites = simplify(
        (managedListResp.Items || [])[0].allowInvites,
      );
      if (!allowInvites) {
        return NextResponse.json(
          {
            _message:
              'You do not have permission to view invite codes for this watchlist',
          },
          { status: 403 },
        );
      }
    } else {
      return NextResponse.json(
        {
          _message: 'Something went wrong. Please try again',
        },
        { status: 500 },
      );
    }
  }

  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 10,
          KeyConditionExpression:
            'PK = :watchlistId AND begins_with(SK, :inviteCodePrefix)',
          ExpressionAttributeValues: {
            ':watchlistId': { S: `LIST#${id}` },
            ':inviteCodePrefix': { S: 'INVITE_CODE' },
          },
        }),
      ),
    )
    .then((inviteCodeResp) => {
      return NextResponse.json({
        codes: (inviteCodeResp.Items || []).map((item) => {
          const { SK, ttl } = simplifyItem(item);
          return { code: SK.replace('INVITE_CODE#', ''), expiresAt: ttl };
        }),
      });
    })
    .catch((err) => {
      console.log('invite code lookup', err);
      return NextResponse.json(
        { _message: 'Something went wrong. Please try again later' },
        { status: 500 },
      );
    });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { username } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  const { id } = await params;

  const watchlistResp = await checkHasAccess(id, username);
  if (!watchlistResp) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you do not have access' },
      { status: 403 },
    );
  }

  const [watchlist] = watchlistResp.Items || [];
  const managedBy = simplify(watchlist.managedBy).replace('USER#', '');
  if (managedBy !== username) {
    const managedListResp = await checkHasAccess(id, managedBy);
    if (managedListResp) {
      const allowInvites = simplify(
        (managedListResp.Items || [])[0].allowInvites,
      );
      if (!allowInvites) {
        return NextResponse.json(
          {
            _message:
              'You do not have permission to create invite codes for this watchlist',
          },
          { status: 403 },
        );
      }
    } else {
      return NextResponse.json(
        {
          _message: 'Something went wrong. Please try again',
        },
        { status: 500 },
      );
    }
  }

  try {
    const inviteCodeResp = await dbclient.send(
      new QueryCommand(
        createParams({
          Limit: 10,
          KeyConditionExpression:
            'PK = :watchlistId AND begins_with(SK, :inviteCodePrefix)',
          ExpressionAttributeValues: {
            ':watchlistId': { S: `LIST#${id}` },
            ':inviteCodePrefix': { S: 'INVITE_CODE' },
          },
        }),
      ),
    );

    if (inviteCodeResp.Items && inviteCodeResp.Items.length === 10) {
      return NextResponse.json(
        {
          _message:
            'The maximum number of invite codes have already been created',
        },
        { status: 400 },
      );
    }
  } catch (err) {
    console.log('invite code lookup', err);
    return NextResponse.json(
      { _message: 'Something went wrong. Please try again later' },
      { status: 500 },
    );
  }

  const inviteCode = createInviteCode();
  const today = new Date();
  const nextWeek = new Date(today.setDate(today.getDate() + 7));
  return dbclient
    .send(
      new PutItemCommand(
        createParams({
          Item: {
            PK: { S: `LIST#${id}` },
            SK: { S: `INVITE_CODE#${inviteCode}` },
            ttl: { S: nextWeek.toISOString() },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.$metadata.httpStatusCode === 200) {
        return NextResponse.json({ code: inviteCode });
      }

      console.log('invite code save', response);
      return NextResponse.json({
        _message: 'Something went wrong. Please try again later',
      });
    })
    .catch((err) => {
      console.log('invite code save', err);
      return NextResponse.json(
        { _message: 'Something went wrong. Please try again later' },
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
  const code = request.nextUrl.searchParams.get('code');

  const watchlistResp = await checkHasAccess(id, username);
  if (!watchlistResp) {
    return NextResponse.json(
      { _message: 'Watchlist does not exist or you do not have access' },
      { status: 403 },
    );
  }

  const [watchlist] = watchlistResp.Items || [];
  const managedBy = simplify(watchlist.managedBy).replace('USER#', '');
  if (managedBy !== username) {
    const managedListResp = await checkHasAccess(id, managedBy);
    if (managedListResp) {
      const allowInvites = simplify(
        (managedListResp.Items || [])[0].allowInvites,
      );
      if (!allowInvites) {
        return NextResponse.json(
          {
            _message:
              'You do not have permission to delete invite codes for this watchlist',
          },
          { status: 403 },
        );
      }
    } else {
      return NextResponse.json(
        {
          _message: 'Something went wrong. Please try again',
        },
        { status: 500 },
      );
    }
  }

  try {
    await dbclient.send(
      new DeleteItemCommand(
        createParams({
          Key: {
            PK: { S: `LIST#${id}` },
            SK: { S: `INVITE_CODE#${code}` },
          },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log('invite code delete', err);
    return NextResponse.json(
      { _message: 'Something went wrong. Please try again later' },
      { status: 500 },
    );
  }
}
