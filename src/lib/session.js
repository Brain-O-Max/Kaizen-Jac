import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

// Route handlers re-check the session so they stay protected even if the proxy matcher changes.
export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
