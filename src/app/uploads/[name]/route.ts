import { serveUpload } from '@/lib/content';

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return serveUpload(name);
}
