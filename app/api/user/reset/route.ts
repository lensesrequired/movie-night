import { createParams, dbclient } from '@/server/dynamodb';
import { createInviteCode } from '@/server/watchlist';
import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

type CreateResetBody = {
  username: string;
  password: string;
};

/**
 * Endpoint to create a reset token for a user
 * @body CreateResetBody
 */
export async function POST(request: NextRequest) {
  const { username, password } = (await request.json()) as CreateResetBody;

  if (!username || !password) {
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
            PK: { S: 'USER#admin' },
            SK: { S: '#PROFILE' },
          },
        }),
      ),
    )
    .then(async (response) => {
      if (response.Item) {
        const { password: savedPassword } = response.Item;
        try {
          const match = bcrypt.compareSync(password, savedPassword.S || '');
          if (match) {
            // TODO: update reset token generation
            const resetToken = createInviteCode();

            const salt = await bcrypt.genSalt();
            const hashedResetToken = await bcrypt.hash(resetToken, salt);
            // TODO: quicker expiration when users can reset themselves
            const today = new Date();
            const twoDays = new Date(today.setDate(today.getDate() + 2));
            return dbclient
              .send(
                new PutItemCommand(
                  createParams({
                    Item: {
                      PK: { S: `USER#${username}` },
                      SK: { S: '#RESET' },
                      resetToken: { S: hashedResetToken },
                      ttl: { N: (Number(twoDays) / 1000).toString() },
                    },
                  }),
                ),
              )
              .then(() => {
                return NextResponse.json({ resetToken });
              })
              .catch((e) => {
                console.log('save reset token', e);
                return NextResponse.json(
                  { _message: 'Reset token generation failed' },
                  { status: 500 },
                );
              });
          }
          return NextResponse.json(
            { _message: 'Permission denied' },
            { status: 401 },
          );
        } catch (e) {
          console.log('password check', e);
          return NextResponse.json(
            { _message: 'Permission denied' },
            { status: 401 },
          );
        }
      }
      return NextResponse.json(
        { _message: 'Admin lookup failed' },
        { status: 500 },
      );
    })
    .catch(async (err) => {
      console.log('admin lookup', err);
      return NextResponse.json(
        { _message: 'Admin lookup failed' },
        { status: 500 },
      );
    });
}
