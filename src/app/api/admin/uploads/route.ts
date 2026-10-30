import { deleteUpload, errorMessage, isNotFound, listUploads, saveUpload } from '@/lib/content';
import type { UploadedFile } from '@/lib/types';
import { isAdmin, unauthorized } from '@/lib/session';

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return Response.json(await listUploads());
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const form = await request.formData();
  const files = form.getAll('file').filter((f): f is File => typeof f !== 'string');
  if (!files.length) return Response.json({ error: 'No file provided' }, { status: 400 });

  try {
    const saved: UploadedFile[] = [];
    for (const file of files) saved.push(await saveUpload(file));
    return Response.json(saved, { status: 201 });
  } catch (err) {
    return Response.json({ error: errorMessage(err) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const name = new URL(request.url).searchParams.get('name');
  try {
    await deleteUpload(name || '');
  } catch (err) {
    const missing = isNotFound(err);
    return Response.json({ error: missing ? 'File not found' : errorMessage(err) }, { status: missing ? 404 : 400 });
  }
  return Response.json({ ok: true });
}
