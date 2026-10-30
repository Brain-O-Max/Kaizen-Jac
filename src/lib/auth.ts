// Admin session helpers. Uses Web Crypto only, so it runs in the Next.js proxy as well as in route handlers.
export const SESSION_COOKIE = 'kaizen_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('ADMIN_SESSION_SECRET must be set (at least 16 characters)');
  }
  return secret;
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(getSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Token format: <expiresAtEpochSeconds>.<hmac>
export async function createSessionToken(): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  return `${expires}.${await hmac(`admin:${expires}`)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expires, sig] = token.split('.');
  if (!expires || !sig || Number(expires) < Date.now() / 1000) return false;
  return timingSafeEqual(sig, await hmac(`admin:${expires}`));
}

export async function checkPassword(password: unknown): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== 'string') return false;
  // Compare HMACs so the comparison is constant-time regardless of length.
  return timingSafeEqual(await hmac(`pw:${password}`), await hmac(`pw:${expected}`));
}
