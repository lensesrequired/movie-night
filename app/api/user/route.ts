import { createParams, dbclient } from '@/server/dynamodb';
import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import bcrypt from 'bcrypt';
import { SerializeOptions, serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const cookieSettings = (env: string) => ({
  httpOnly: true,
  path: '/',
  secure: env !== 'development',
  sameSite: env !== 'development' ? 'none' : undefined,
  expires: new Date(new Date().setDate(new Date().getDate() + 1)),
});

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { _message: 'username and password are required fields' },
      { status: 400 },
    );
  }

  return dbclient
    .send(
      new GetItemCommand(
        createParams({
          Key: {
            PK: { S: `USER#${email}` },
            SK: { S: '#PROFILE' },
          },
        }),
      ),
    )
    .then(async (response) => {
      if (response.Item) {
        return NextResponse.json(
          { _message: 'Email already in use' },
          { status: 409 },
        );
      } else {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        try {
          await dbclient.send(
            new PutItemCommand(
              createParams({
                Item: {
                  PK: { S: `USER#${email}` },
                  SK: { S: '#PROFILE' },
                  password: { S: hashedPassword },
                  displayName: { S: email },
                },
              }),
            ),
          );
          const token = jwt.sign(
            { authed: true, email, displayName: email },
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
    })
    .catch(async (err) => {
      // log error
      console.log('check user', err);
      return NextResponse.json(
        { _message: 'Account could not be created' },
        { status: 500 },
      );
    });
}
