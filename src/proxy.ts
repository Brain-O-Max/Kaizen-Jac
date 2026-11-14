import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { isReadOnlyDeployment } from '@/lib/site';

// Every admin page and admin API route requires a valid session, except the login page itself.
// On read-only deployments (e.g. Vercel) the whole admin is switched off instead.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isReadOnlyDeployment()) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'The admin panel is switched off on this read-only preview.' }, { status: 503 });
    }
    if (pathname === '/admin/disabled') return NextResponse.next();
    return NextResponse.redirect(new URL('/admin/disabled', request.url));
  }

  if (pathname === '/admin/login') return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
