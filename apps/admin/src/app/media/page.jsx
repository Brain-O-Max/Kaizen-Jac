import { listUploads } from '@kaizen/content';
import AdminNav from '@/components/AdminNav';
import MediaLibrary from '@/components/MediaLibrary';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const files = await listUploads();
  return (
    <>
      <AdminNav active="media" />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Media library</h1>
          <p className="text-sm text-slate-400">Upload images or PDFs (max 10 MB). Copy a file&apos;s URL to use it anywhere in the content.</p>
        </div>
        <MediaLibrary initialFiles={files} />
      </main>
    </>
  );
}
