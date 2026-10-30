import { deleteInquiry, errorMessage, isNotFound, listInquiries, setInquiryStatus } from '@/lib/content';
import { isAdmin, unauthorized } from '@/lib/session';

function failure(err: unknown) {
  const missing = isNotFound(err);
  return Response.json({ error: missing ? 'Inquiry not found' : errorMessage(err) }, { status: missing ? 404 : 400 });
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return Response.json(await listInquiries());
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { id, status } = (await request.json().catch(() => ({}))) as { id?: unknown; status?: unknown };
  try {
    return Response.json(await setInquiryStatus(id, status));
  } catch (err) {
    return failure(err);
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(request.url).searchParams.get('id');
  try {
    await deleteInquiry(id);
  } catch (err) {
    return failure(err);
  }
  return Response.json({ ok: true });
}
