import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');

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
    }

    request.cookies.set('info', encodeURIComponent(JSON.stringify(token)));
    return NextResponse.next({ request });
  } else {
    return NextResponse.json(
      { _message: 'Login to perform this action' },
      { status: 401 },
    );
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/watchlists',
  runtime: 'nodejs',
};
