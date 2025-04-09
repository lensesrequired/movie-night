import { createParams, dbclient } from '@/server/dynamodb';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// TODO: npm install this and use that
const uuid = () => {
  return 'generate';
};

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  let email = '';

  // TODO: move into middleware?
  if (authCookie?.value) {
    const token = jwt.verify(
      authCookie?.value,
      process.env.JWT_SECRET as jwt.Secret,
    ) as jwt.JwtPayload;
    if (!token.authed || !token.email) {
      return NextResponse.json(
        { _message: 'Login again to perform this action' },
        { status: 401 },
      );
    } else {
      email = token.email;
    }
  }

  const { title, description } = await request.json();

  if (!title) {
    return NextResponse.json(
      { _message: 'Title is required' },
      { status: 400 },
    );
  }

  const item: Record<string, AttributeValue> = {
    PK: { S: `USER#${email}` },
    SK: { S: `#SELF#${uuid()}` },
    title: { S: title },
  };

  if (description) {
    item.description = { S: description };
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
      console.log('watchlist create', err);
      return NextResponse.json(
        { _message: 'Watchlist could not be created' },
        { status: 500 },
      );
    });
}
