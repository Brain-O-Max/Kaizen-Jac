import { SITES, currentSiteId } from '@/lib/site';
import AdminShell from '@/components/admin/AdminShell';
import { InquiriesPanel } from '@/components/admin/AdminPanels';

export default function InquiriesPage() {
  return (
    <AdminShell siteName={SITES[currentSiteId()].name} active="inquiries">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Inquiries</h1>
          <p className="text-sm text-slate-400">Messages sent through the website contact form. Each one is also emailed to you.</p>
        </div>
        <InquiriesPanel />
      </main>
    </AdminShell>
  );
}
