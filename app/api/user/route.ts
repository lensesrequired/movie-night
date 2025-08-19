import { createParams, dbclient, simplifyItem } from '@/server/dynamodb';
import {
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
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

type UpdateUserBody = {
  resetToken?: string;
  username: string;
  password: string;
};

/**
 * Endpoint to update a user
 * @body UpdateUserBody
 */
export async function PUT(request: NextRequest) {
  const { resetToken, username, password } =
    (await request.json()) as UpdateUserBody;

  if (!resetToken || !username || !password) {
    return NextResponse.json(
      { _message: 'resetToken, username, and password are required fields' },
      { status: 400 },
    );
  }

  return dbclient
    .send(
      new GetItemCommand(
        createParams({
          Key: {
            PK: { S: `USER#${username}` },
            SK: { S: '#RESET' },
          },
        }),
      ),
    )
    .then(async (response) => {
      if (response.Item) {
        const { resetToken: savedResetToken } = simplifyItem(response.Item);
        try {
          const match = bcrypt.compareSync(resetToken, savedResetToken || '');
          if (match) {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            return dbclient
              .send(
                new UpdateItemCommand(
                  createParams({
                    Key: {
                      PK: { S: `USER#${username}` },
                      SK: { S: '#PROFILE' },
                    },
                    UpdateExpression: `SET #password = :hashedPassword`,
                    ExpressionAttributeNames: {
                      '#password': 'password',
                    },
                    ExpressionAttributeValues: {
                      ':hashedPassword': { S: hashedPassword },
                    },
                  }),
                ),
              )
              .then(() => {
                // TODO: remove reset token
                return NextResponse.json({ success: true });
              })
              .catch((e) => {
                console.log('account update', e);
                return NextResponse.json(
                  { _message: 'Account could not be updated' },
                  { status: 500 },
                );
              });
          }
          return NextResponse.json(
            { _message: 'Login failed' },
            { status: 401 },
          );
        } catch (e) {
          console.log('password check', e);
          return NextResponse.json(
            { _message: 'Login failed' },
            { status: 401 },
          );
        }
      }
      return NextResponse.json(
        { _message: 'User does not exist' },
        { status: 404 },
      );
    })
    .catch(async (err) => {
      // log error
      console.log('check user', err);
      return NextResponse.json({ _message: 'Login failed' }, { status: 500 });
    });
}
