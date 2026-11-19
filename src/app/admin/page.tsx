import { SITES, currentSiteId } from '@/lib/site';
import AdminShell from '@/components/admin/AdminShell';
import { ContentPanel } from '@/components/admin/AdminPanels';

export default function ContentPage() {
  const site = SITES[currentSiteId()];
  return (
    <AdminShell siteName={site.name} active="content">
      <main className="max-w-6xl mx-auto px-4 py-6">
        <ContentPanel siteId={site.id} />
      </main>
    </AdminShell>
  );
}
