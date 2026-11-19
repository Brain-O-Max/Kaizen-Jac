import { SITES, currentSiteId } from '@/lib/site';
import AdminShell from '@/components/admin/AdminShell';
import { MediaPanel } from '@/components/admin/AdminPanels';

export default function MediaPage() {
  return (
    <AdminShell siteName={SITES[currentSiteId()].name} active="media">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Media library</h1>
          <p className="text-sm text-slate-400">Upload images or PDFs (max 10 MB). Copy a file&apos;s URL to use it anywhere in the content.</p>
        </div>
        <MediaPanel />
      </main>
    </AdminShell>
  );
}
