import { deleteUpload, listUploads, saveUpload } from '@kaizen/content';
import { isAdmin, unauthorized } from '@/lib/session';

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return Response.json(await listUploads());
}

export async function POST(request) {
  if (!(await isAdmin())) return unauthorized();
  const form = await request.formData();
  const files = form.getAll('file').filter((f) => typeof f === 'object');
  if (!files.length) return Response.json({ error: 'No file provided' }, { status: 400 });

  try {
    const saved = [];
    for (const file of files) saved.push(await saveUpload(file));
    return Response.json(saved, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!(await isAdmin())) return unauthorized();
  const name = new URL(request.url).searchParams.get('name');
  try {
    await deleteUpload(name || '');
  } catch (err) {
    const status = err.code === 'ENOENT' ? 404 : 400;
    return Response.json({ error: err.code === 'ENOENT' ? 'File not found' : err.message }, { status });
  }
  return Response.json({ ok: true });
}
