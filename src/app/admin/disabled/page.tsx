import { SITES, currentSiteId } from '@/lib/site';

// Shown instead of the admin panel on read-only preview deployments (see isReadOnlyDeployment in src/lib/site.ts).
export default function AdminDisabledPage() {
  const site = SITES[currentSiteId()];

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md card">
        <h1 className="text-lg font-bold">{site.name} Admin is switched off</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          This is a read-only preview, so edits, uploads and inquiries can&apos;t be saved here. The admin panel is available
          on the live website, which runs on a server with permanent storage.
        </p>
        <a href="/" className="btn-primary">Back to the website</a>
      </div>
    </main>
  );
}
