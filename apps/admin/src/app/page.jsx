import { getContent } from '@kaizen/content';
import AdminNav from '@/components/AdminNav';
import ContentEditor from '@/components/ContentEditor';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const content = await getContent();
  return (
    <>
      <AdminNav active="content" />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <ContentEditor initialContent={content} />
      </main>
    </>
  );
}
