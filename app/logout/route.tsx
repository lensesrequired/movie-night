import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('auth');
  return NextResponse.redirect(new URL('/', request.url));
}
