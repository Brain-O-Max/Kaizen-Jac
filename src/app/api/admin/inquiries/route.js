import { deleteInquiry, listInquiries, setInquiryStatus } from '@/lib/content';
import { isAdmin, unauthorized } from '@/lib/session';

const notFound = (err) => err.code === 'ENOENT';

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return Response.json(await listInquiries());
}

export async function PATCH(request) {
  if (!(await isAdmin())) return unauthorized();
  const { id, status } = await request.json().catch(() => ({}));
  try {
    return Response.json(await setInquiryStatus(id, status));
  } catch (err) {
    return Response.json({ error: notFound(err) ? 'Inquiry not found' : err.message }, { status: notFound(err) ? 404 : 400 });
  }
}

export async function DELETE(request) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(request.url).searchParams.get('id');
  try {
    await deleteInquiry(id);
  } catch (err) {
    return Response.json({ error: notFound(err) ? 'Inquiry not found' : err.message }, { status: notFound(err) ? 404 : 400 });
  }
  return Response.json({ ok: true });
}
