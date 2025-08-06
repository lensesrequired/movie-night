import { createParams, dbclient } from '@/server/dynamodb';
import {
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import bcrypt from 'bcrypt';
import { SerializeOptions, serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const cookieSettings = (env: string) => ({
  httpOnly: true,
  path: '/',
  secure: env !== 'development',
  sameSite: env !== 'development' ? 'none' : undefined,
  expires: new Date(new Date().setDate(new Date().getDate() + 1)),
});

export async function POST(request: NextRequest) {
  const { email, username, password } = await request.json();

  if (!email || !username || !password) {
    return NextResponse.json(
      { _message: 'email, username, and password are required fields' },
      { status: 400 },
    );
  }

  const [usernameCheck, emailCheck] = await Promise.allSettled([
    dbclient.send(
      new GetItemCommand(
        createParams({
          Key: {
            PK: { S: `USER#${username}` },
            SK: { S: '#PROFILE' },
          },
        }),
      ),
    ),
    dbclient.send(
      new QueryCommand(
        createParams({
          Limit: 1,
          IndexName: 'GSI2',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: {
            ':email': { S: email },
          },
        }),
      ),
    ),
  ]);

  if (
    usernameCheck.status !== 'fulfilled' ||
    emailCheck.status !== 'fulfilled'
  ) {
    return NextResponse.json(
      { _message: 'Something went wrong. Please try again later' },
      { status: 500 },
    );
  } else if (usernameCheck.value.Item) {
    return NextResponse.json(
      { _message: 'Username already in use' },
      { status: 409 },
    );
  } else if (emailCheck.value.Items && emailCheck.value.Items.length) {
    return NextResponse.json(
      { _message: 'Email already in use' },
      { status: 409 },
    );
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    await dbclient.send(
      new PutItemCommand(
        createParams({
          Item: {
            PK: { S: `USER#${username}` },
            SK: { S: '#PROFILE' },
            email: { S: email },
            password: { S: hashedPassword },
            displayName: { S: username },
          },
        }),
      ),
    );
    const token = jwt.sign(
      { authed: true, username, displayName: username },
      process.env.JWT_SECRET as jwt.Secret,
      {
        expiresIn: 60 * 60 * 24,
      },
    );

    return NextResponse.json(
      { authed: true },
      {
        headers: {
          'Set-Cookie': serialize(
            'auth',
            String(token),
            cookieSettings(process.env.NODE_ENV) as SerializeOptions,
          ),
        },
      },
    );
  } catch (err) {
    // log error
    console.log('account create', err);
    return NextResponse.json(
      { _message: 'Account could not be created' },
      { status: 500 },
    );
  }
}
