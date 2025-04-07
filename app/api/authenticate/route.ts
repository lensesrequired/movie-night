import {NextRequest, NextResponse} from 'next/server'
import {createParams, dbclient} from "@/server/dynamodb";
import {GetItemCommand, GetItemCommandInput} from "@aws-sdk/client-dynamodb";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {serialize, SerializeOptions} from 'cookie';

export const cookieSettings = (env: string) => ({
  httpOnly: true,
  path: '/',
  secure: env !== 'development',
  sameSite: env !== 'development' ? 'none' : undefined,
  expires: new Date(new Date().setDate(new Date().getDate() + 1))
});

export async function POST(request: NextRequest) {
  const {username, password} = await request.json()

  if(!username || !password){
    return NextResponse.json({_message: 'username and password are required fields'}, {status: 400})
  }

  return dbclient
    .send(
      new GetItemCommand(
        createParams({
          Key: {
            PK: { S: `USER#${username}` },
            SK: { S: '#PROFILE' }
          }
        })
      )
    )
    .then(async (response) => {
      if (response.Item) {
        const { password: savedPassword } = response.Item;
        try {
          const match = bcrypt.compareSync(password, savedPassword.S || '');
          if (match) {
            const token = jwt.sign({ authed: true, username }, process.env.JWT_SECRET as jwt.Secret, {
              expiresIn: 60 * 60 * 24
            });
            return NextResponse.json({authed:true}, {headers: {'Set-Cookie': serialize('auth', String(token), cookieSettings(process.env.NODE_ENV) as SerializeOptions)}})
          }
          return NextResponse.json({ _message: 'Login failed' }, {status: 401})
        } catch (e) {
          console.log('password check', e);
          return NextResponse.json({ _message: 'Login failed' }, {status: 401})
        }
      }
      return NextResponse.json({ _message: 'User does not exist' }, {status: 404})
    })
    .catch(async (err) => {
      // log error
      console.log('check user', err);
      return NextResponse.json({ _message: 'Login failed' }, {status: 500})
    });
}
