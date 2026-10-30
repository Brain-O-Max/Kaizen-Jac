import { listInquiries } from '@kaizen/content';
import AdminNav from '@/components/AdminNav';
import InquiryList from '@/components/InquiryList';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  const inquiries = await listInquiries();
  return (
    <>
      <AdminNav active="inquiries" />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Inquiries</h1>
          <p className="text-sm text-slate-400">Messages sent through the website contact form.</p>
        </div>
        <InquiryList initialInquiries={inquiries} />
      </main>
    </>
  );
}
