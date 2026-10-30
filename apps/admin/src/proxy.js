import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@kaizen/content/auth';

// Every admin page and API route requires a valid session, except the login page itself.
export async function proxy(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|icon.svg|favicon.ico).*)'],
};
