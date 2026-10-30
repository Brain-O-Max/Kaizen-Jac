import { serveUpload } from '@/lib/content';

export async function GET(_request, { params }) {
  const { name } = await params;
  return serveUpload(name);
}
