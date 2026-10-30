import { errorMessage, saveInquiry } from '@/lib/content';

// Basic per-IP rate limit (in memory, per server process) to slow down form spam.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill the "website" field, bots often do. Pretend success.
  if (body?.website) return Response.json({ ok: true });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return Response.json({ error: 'Too many submissions. Please try again later or call us directly.' }, { status: 429 });
  }

  try {
    await saveInquiry(body);
  } catch (err) {
    return Response.json({ error: errorMessage(err) }, { status: 400 });
  }
  return Response.json({ ok: true }, { status: 201 });
}
