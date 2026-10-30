import { getContent, saveContent } from '@/lib/content';
import { isAdmin, unauthorized } from '@/lib/session';

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return Response.json(await getContent());
}

export async function PUT(request) {
  if (!(await isAdmin())) return unauthorized();
  let content;
  try {
    content = await request.json();
  } catch {
    return Response.json({ error: 'Body must be valid JSON' }, { status: 400 });
  }
  try {
    await saveContent(content);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
  return Response.json({ ok: true });
}
