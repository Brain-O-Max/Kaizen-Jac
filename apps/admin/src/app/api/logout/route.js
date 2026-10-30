import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@kaizen/content/auth';

export async function POST(request) {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return Response.redirect(new URL('/login', request.url), 303);
}
